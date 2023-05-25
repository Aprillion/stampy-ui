import {useState, useRef, useEffect, useMemo, useCallback} from 'react'
import type {MouseEvent} from 'react'
import {useSearchParams, useTransition} from '@remix-run/react'
import {
  Question,
  QuestionState,
  RelatedQuestions,
  PageId,
  QuestionStatus,
} from '~/server-utils/stampy'
import {fetchAllQuestionsOnSite} from '~/routes/questions/allQuestionsOnSite'
import {
  processStateEntries,
  getStateEntries,
  entryState,
  addQuestions as addQuestionsToState,
  insertInto as insertIntoState,
  moveQuestion as moveQuestionInState,
  moveToTop as moveQuestionToTop,
} from '~/hooks/stateModifiers'

function updateQuestionMap(question: Question, map: Map<PageId, Question>): Map<PageId, Question> {
  map.set(question.pageid, question)
  for (const {pageid, title} of question.relatedQuestions) {
    if (!pageid || map.has(pageid)) continue

    map.set(pageid, {
      title,
      pageid,
      text: null,
      answerEditLink: null,
      relatedQuestions: [],
      tags: [],
    })
  }
  return map
}

const emptyQuestionArray: Question[] = []

export default function useQuestionStateInUrl(minLogo: boolean, initialQuestions: Question[]) {
  const [remixSearchParams] = useSearchParams()
  const transition = useTransition()

  const [stateString, setStateString] = useState(
    () =>
      remixSearchParams.get('state') && processStateEntries(remixSearchParams.get('state') ?? '')
  )
  const [questionMap, setQuestionMap] = useState(() => {
    const initialMap: Map<PageId, Question> = new Map()
    for (const question of initialQuestions) {
      updateQuestionMap(question, initialMap)
    }
    return initialMap
  })

  const onSiteAnswersRef = useRef(emptyQuestionArray)

  useEffect(() => {
    // not needed for initial screen => lazy load on client
    fetchAllQuestionsOnSite().then((questions) => {
      const liveQuestions = questions.filter((q) => q.status === QuestionStatus.LIVE_ON_SITE)
      onSiteAnswersRef.current = liveQuestions
    })
  }, [])

  useEffect(() => {
    if (transition.location) {
      const state = new URLSearchParams(transition.location.search).get('state')
      setStateString(state)
    }
  }, [transition.location])

  const initialCollapsedState = useMemo(
    () => initialQuestions.map(({pageid}) => `${pageid}${QuestionState.COLLAPSED}`).join(''),
    [initialQuestions]
  )
  const questions: Question[] = useMemo(() => {
    return getStateEntries(stateString ?? initialCollapsedState).map(([pageid, questionState]) => ({
      pageid,
      title: '...',
      text: null,
      answerEditLink: null,
      relatedQuestions: [],
      questionState,
      tags: [],
      ...questionMap.get(pageid),
    }))
  }, [stateString, initialCollapsedState, questionMap])

  useEffect(() => {
    const mainQuestions = questions.filter(
      ({questionState}) => questionState != QuestionState.RELATED
    )
    let title
    if (minLogo) {
      title = 'AI Safety FAQ'
    } else if (mainQuestions.length == 1) {
      title = mainQuestions[0].title
    } else {
      const suffix = stateString ? ` - ${stateString}` : ''
      title = `Stampy ${suffix}`
    }
    if (title.length > 150) title = title.slice(0, 150 - 3) + '...'
    document.title = title
  }, [stateString, minLogo, questions])

  const reset = (event: MouseEvent) => {
    event.preventDefault()
    history.replaceState('', '', '/')
    setStateString(null)
  }

  const moveToTop = (currentState: string, {pageid}: Question) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    return moveQuestionToTop(currentState, pageid)
  }

  /*
   * Get all related questions of the provided `question` that should be displayed
   */
  const getRelatedQuestions = (
    questionProps: Question,
    topLevelQuestions: Question[] = []
  ): RelatedQuestions => {
    const {relatedQuestions} = questionProps

    const onSiteAnswers = onSiteAnswersRef.current
    const onSiteSet = new Set(onSiteAnswers.map(({pageid}) => pageid))

    return (
      relatedQuestions
        // If top level questions are provided, ignore them - otherwise they'd get collapsed and moved back
        // into the related section
        .filter((question) => !topLevelQuestions.some(({pageid}) => pageid === question.pageid))
        // Remove all questions that aren't published
        .filter((question) => onSiteSet.has(question.pageid))
    )
  }

  /*
   * Update the window.location with the new URL state
   */
  const updateStateString = useCallback(
    (newState: string) => {
      if (stateString == newState) return
      const newSearchParams = new URLSearchParams(remixSearchParams)
      newSearchParams.set('state', newState)
      history.replaceState(newState, '', '?' + newSearchParams.toString())
      setStateString(newState)
    },
    [remixSearchParams, stateString]
  )

  /*
   * Add the given `questions` to the global questions map. This will not update the URL
   */
  const mergeNewQuestions = useCallback((questions: Question[]) => {
    setQuestionMap((currentMap) =>
      questions.reduce((map, question) => updateQuestionMap(question, map), new Map(currentMap))
    )
  }, [])

  /*
   * Add the given `newQuestions` to the collection of questions. This will also update the URL
   */
  const addQuestions = useCallback(
    (newQuestions: Question[]) => {
      const questions = newQuestions.filter((q) => !questionMap.get(q.pageid))
      mergeNewQuestions(questions)

      const newState = addQuestionsToState(stateString ?? initialCollapsedState, questions)
      updateStateString(newState)
    },
    [initialCollapsedState, stateString, questionMap, updateStateString, mergeNewQuestions]
  )

  /*
   * Toggle the selected question.
   *
   * If the question is to be opened, this will also make sure all it's related questions
   * are on the page
   */
  const toggleQuestion = useCallback(
    (questionProps: Question, options?: {moveToTop?: boolean}) => {
      const {pageid, relatedQuestions} = questionProps
      let currentState = stateString ?? initialCollapsedState

      if (options?.moveToTop) {
        currentState = moveToTop(currentState, questionProps)
      }

      const onSiteAnswers = onSiteAnswersRef.current
      if (onSiteAnswers.length === 0 && relatedQuestions.length > 0) {
        // if onSiteAnswers (needed for relatedQuestions) are not loaded yet, wait a moment to re-run
        setTimeout(() => toggleQuestion(questionProps, options), 200)
        return
      }

      const displayableRelatedQuestions = getRelatedQuestions(
        questionProps,
        // if the question is being opened, pull in all related questions. On the other hand,
        // if it's being closed, leave opened related questions, as the user could simply be cleaning
        // things up
        entryState(currentState, pageid) == QuestionState.OPEN ? questions : []
      )
      const newState = insertIntoState(currentState, pageid, displayableRelatedQuestions)

      updateStateString(newState)
    },
    [initialCollapsedState, questions, stateString, updateStateString]
  )

  const onLazyLoadQuestion = useCallback(
    (question: Question) => mergeNewQuestions([question]),
    [mergeNewQuestions]
  )

  const moveQuestion = useCallback(
    (pageId: PageId, to: PageId | null) => {
      const currentState = stateString ?? initialCollapsedState
      updateStateString(moveQuestionInState(currentState, pageId, to ?? ''))
    },
    [initialCollapsedState, stateString, updateStateString]
  )

  /*
   * Moves the given question to the top of the page, opens it, and make sure all related ones are loaded
   */
  const selectQuestion = useCallback(
    (pageid: string, title: string) => {
      // if the question is already loaded, move it to top
      for (const q of questionMap.values()) {
        if (pageid === q.pageid) {
          toggleQuestion(q, {moveToTop: true})
          return
        }
      }
      // else show the new question in main view and let the Question component fetch it
      const tmpQuestion: Question = {
        pageid,
        title,
        text: null,
        answerEditLink: null,
        relatedQuestions: [],
        tags: [],
      }
      onLazyLoadQuestion(tmpQuestion)
      toggleQuestion(tmpQuestion, {moveToTop: true})
    },
    [onLazyLoadQuestion, questionMap, toggleQuestion]
  )

  // if there is only 1 question from a direct link, load related questions too
  useEffect(() => {
    if (questions.length === 1) {
      const insertAfterOnSiteStatusIsKnown = () => {
        if (onSiteAnswersRef.current.length === 0) {
          setTimeout(insertAfterOnSiteStatusIsKnown, 200)
          return
        }
        const relatedQuestions = getRelatedQuestions(questions[0])
        const newState = insertIntoState(
          stateString ?? initialCollapsedState,
          questions[0].pageid,
          relatedQuestions,
          {toggle: false}
        )

        updateStateString(newState)
      }
      insertAfterOnSiteStatusIsKnown()
    }
  }, [questions, stateString, initialCollapsedState, updateStateString])

  return {
    questions,
    onSiteAnswersRef,
    reset,
    toggleQuestion,
    onLazyLoadQuestion,
    selectQuestion,
    addQuestions,
    moveQuestion,
  }
}
