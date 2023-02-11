import {useState, useRef, useEffect, useMemo, useCallback} from 'react'
import type {MouseEvent} from 'react'
import {useSearchParams, useTransition} from '@remix-run/react'
import {Question, QuestionState, RelatedQuestions} from '~/server-utils/stampy'
import {fetchOnSiteAnswers} from '~/routes/questions/allOnSite'

type PageId = Question['pageid']

const getStateEntries = (state: string): [PageId, QuestionState][] =>
  Array.from(state.matchAll(/([^-_r]+)([-_r]*)/g) ?? []).map((groups) => [
    groups[1], // question id
    (groups[2] as QuestionState) || QuestionState.OPEN,
  ])

function updateQuestionMap(question: Question, map: Map<PageId, Question>): Map<PageId, Question> {
  map.set(question.pageid, question)
  for (const {pageid, title} of question.relatedQuestions) {
    if (!pageid || map.has(pageid)) continue

    map.set(pageid, {title, pageid, text: null, answerEditLink: null, relatedQuestions: []})
  }
  return map
}

const emptyQuestionArray: Question[] = []
const emptyQuestionMap: Record<string, Question> = {}

export default function useQuestionStateInUrl(minLogo: boolean, initialQuestions: Question[]) {
  const [remixSearchParams] = useSearchParams()
  const transition = useTransition()

  const [stateString, setStateString] = useState(() => remixSearchParams.get('state'))
  const [questionMap, setQuestionMap] = useState(() => {
    const initialMap: Map<PageId, Question> = new Map()
    for (const question of initialQuestions) {
      updateQuestionMap(question, initialMap)
    }
    return initialMap
  })

  const onSiteAnswersRef = useRef(emptyQuestionArray)
  const onSiteGDocLinkMapRef = useRef(emptyQuestionMap)

  useEffect(() => {
    // not needed for initial screen => lazy load on client
    fetchOnSiteAnswers().then((data) => {
      onSiteAnswersRef.current = data
      onSiteGDocLinkMapRef.current = data.reduce((acc, q) => {
        if (q.answerEditLink) acc[q.answerEditLink] = q
        return acc
      }, emptyQuestionMap)
    })
  }, [])

  useEffect(() => {
    if (transition.location) {
      const state = new URLSearchParams(transition.location.search).get('state')
      setStateString(state)
    }
  }, [transition.location])

  useEffect(() => {
    const suffix = stateString ? ` - ${stateString}` : ''
    document.title = minLogo ? 'AI Safety FAQ' : `Stampy (alpha)${suffix}`
  }, [stateString, minLogo])

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
      ...questionMap.get(pageid),
      questionState,
    }))
  }, [stateString, initialCollapsedState, questionMap])

  const reset = (event: MouseEvent) => {
    event.preventDefault()
    history.replaceState('', '', '/')
    setStateString(null)
  }

  const moveToTop = (currentState: string, {pageid}: Question) => {
    const removePageRe = new RegExp(`${pageid}.`, 'g')
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    return `${pageid}-${currentState.replace(removePageRe, '')}`
  }

  /*
   * Get all related questions of the provided `question` that aren't already displayed on the site
   */
  const unshownRelatedQuestions = (
    questions: Question[],
    questionProps: Question
  ): RelatedQuestions => {
    const {relatedQuestions} = questionProps

    const onSiteAnswers = onSiteAnswersRef.current
    const onSiteSet = new Set(onSiteAnswers.map(({pageid}) => pageid))

    return relatedQuestions.filter((question) => {
      const isOnSite = onSiteSet.has(question.pageid)
      // hide already displayed questions, detect duplicates by pageid (pageid can be different due to redirects)
      // TODO: #25 relocate already displayed to slide in as a new related one
      const isAlreadyDisplayed = questions.some(({pageid}) => pageid === question.pageid)
      return isOnSite && !isAlreadyDisplayed
    })
  }

  /*
   * Open the given question and add its subquestions - this will return an appropriate URL param string
   */
  const insertIntoState = (
    state: string,
    pageid: PageId,
    relatedQuestions: RelatedQuestions
  ): string =>
    getStateEntries(state)
      .map(([k, v]) => {
        if (k === pageid.toString()) {
          const newValue: QuestionState =
            v === QuestionState.OPEN ? QuestionState.COLLAPSED : QuestionState.OPEN
          const related = relatedQuestions
            .filter((i) => i)
            .map((r) => `${r.pageid}${QuestionState.RELATED}`)
            .join('')
          return `${k}${newValue}${related}`
        }
        return `${k}${v}`
      })
      .join('')

  /*
   * Update the window.location with the new URL state
   */
  const updateStateString = useCallback(
    (newState: string) => {
      const newSearchParams = new URLSearchParams(remixSearchParams)
      newSearchParams.set('state', newState)
      history.replaceState(newState, '', '?' + newSearchParams.toString())
      setStateString(newState)
    },
    [remixSearchParams]
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

      const newState = questions.reduce(
        (newState, q) => `${newState}${q.pageid}${QuestionState.COLLAPSED}`,
        stateString ?? initialCollapsedState
      )
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
        setTimeout(() => toggleQuestion(questionProps, options), 500)
        return
      }

      const newRelatedQuestions = unshownRelatedQuestions(questions, questionProps)
      const newState = insertIntoState(currentState, pageid, newRelatedQuestions)

      updateStateString(newState)
    },
    [initialCollapsedState, questions, stateString, updateStateString]
  )

  const onLazyLoadQuestion = useCallback(
    (question: Question) => mergeNewQuestions([question]),
    [mergeNewQuestions]
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
      const tmpQuestion = {
        pageid,
        title,
        text: null,
        answerEditLink: null,
        relatedQuestions: [],
      }
      onLazyLoadQuestion(tmpQuestion)
      toggleQuestion(tmpQuestion, {moveToTop: true})
    },
    [onLazyLoadQuestion, questionMap, toggleQuestion]
  )

  return {
    questions,
    onSiteAnswersRef,
    onSiteGDocLinkMapRef,
    reset,
    toggleQuestion,
    onLazyLoadQuestion,
    selectQuestion,
    addQuestions,
  }
}
