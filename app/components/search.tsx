import {useState, useEffect, useCallback, useRef, MutableRefObject, FocusEvent} from 'react'
import debounce from 'lodash/debounce'
import {Searcher, Question as QuestionType, SearchResult} from 'stampy-search'
import {AddQuestion} from '~/routes/questions/add'
import {Action, ActionType} from '~/routes/questions/actions'
import {MagnifyingGlass, Edit} from '~/components/icons-generated'
import AutoHeight from 'react-auto-height'
import Dialog from '~/components/dialog'

type Props = {
  onSiteAnswersRef: MutableRefObject<QuestionType[]>
  initialQuery?: string
  openQuestionTitles: string[]
  onSelect: (pageid: string, title: string) => void
}

const empty: [] = []

export default function Search({
  onSiteAnswersRef,
  initialQuery,
  openQuestionTitles,
  onSelect,
}: Props) {
  const [showResults, setShowResults] = useState(initialQuery !== undefined)
  const [showMore, setShowMore] = useState(false)
  const searchInputRef = useRef('')

  const [arePendingSearches, setPendingSearches] = useState(false)
  const [results, setResults] = useState([] as SearchResult[])
  const [searcher, setSearcher] = useState<Searcher>()

  useEffect(() => {
    setSearcher(
      new Searcher({
        getAllQuestions: () => onSiteAnswersRef.current,
        onResolveCallback: (query?: string, res?: SearchResult[] | null) => {
          if (res) {
            setPendingSearches(false)
            setResults(res)
          }
        },
      })
    )
  }, [onSiteAnswersRef])

  const searchFn = useCallback(
    (rawValue: string) => {
      const value = rawValue.trim()
      if (value === searchInputRef.current) return

      searchInputRef.current = value

      setPendingSearches(true)
      searcher && searcher.searchLive(value)
      logSearch(value)
    },
    [searcher]
  )

  // Show the url query if defined
  useEffect(() => {
    if (initialQuery && searcher) {
      initialQuery && searchFn(initialQuery)
    }
  }, [initialQuery, searcher, searchFn])

  const handleChange = debounce(searchFn, 100)

  const hideSearchResults = () => setShowResults(false)
  const [hideEnabled, setHide] = useState(true)
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    // If the focus changes from something in the search widget to something outside
    // of it, then hide the results. If it's just jumping around the results, then keep
    // them shown.
    const focusedOnResult = e.relatedTarget?.classList.contains('result-item') || false
    // Safari doesn't provide related target info in the blur event, so this will
    // make sure that it won't hide the search results right away, as that stops
    // the clicked element from fireing (it gets destroyed before the click handler fires)
    if (hideEnabled) setShowResults(focusedOnResult)
  }

  const handleSelect = (pageid: string, title: string) => {
    setHide(true)
    setShowMore(false)
    hideSearchResults()
    onSelect(pageid, title)
  }

  return (
    <>
      <div onFocus={() => setShowResults(true)} onBlur={handleBlur}>
        <label className="searchbar">
          <input
            type="search"
            name="searchbar"
            placeholder="Search for more questions here..."
            autoComplete="off"
            defaultValue={searchInputRef.current}
            onChange={(e) => handleChange(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchFn(e.currentTarget.value)}
          />
          <MagnifyingGlass />
        </label>
        <div className={`search-loader ${arePendingSearches ? 'loader' : ''}`}> </div>
        {arePendingSearches && results.length == 0 && (
          <div className="result-item-box no-questions">Searching for questions...</div>
        )}
        <AutoHeight>
          <div
            className={`dropdown ${
              showResults && searchInputRef.current.length > 0 ? '' : 'hidden'
            }`}
          >
            <div>
              {showResults &&
                results.map(({pageid, title, score, model}) => (
                  <ResultItem
                    key={pageid}
                    {...{
                      pageid,
                      title,
                      score,
                      model,
                      onSelect: handleSelect,
                      isAlreadyOpen: openQuestionTitles.includes(title),
                      setHide,
                    }}
                  />
                ))}
              {showResults && results.length === 0 && <i>(no results)</i>}
            </div>
            <button
              className="result-item result-item-box none-of-the-above"
              onClick={() => setShowMore(true)}
              onMouseDown={() => setHide(false)}
              onMouseUp={() => setHide(true)}
            >
              I&apos;m asking something else
            </button>
          </div>
        </AutoHeight>
      </div>
      {showMore && searcher && (
        <ShowMoreSuggestions
          onClose={() => {
            setShowMore(false)
            setHide(true)
          }}
          searcher={searcher}
          question={searchInputRef.current}
          relatedQuestions={results.map(({title}) => title)}
        />
      )}
    </>
  )
}

const ResultItem = ({
  pageid,
  title,
  score,
  model,
  onSelect,
  isAlreadyOpen,
  setHide,
}: {
  pageid: string
  title: string
  score: number
  model: string
  onSelect: Props['onSelect']
  isAlreadyOpen: boolean
  setHide?: (b: boolean) => void
}) => {
  const tooltip = `score: ${score.toFixed(2)}, engine: ${model} ${
    isAlreadyOpen ? '(already open)' : ''
  }`

  return (
    <button
      className={`transparent-button result-item result-item-box ${
        isAlreadyOpen ? 'already-open' : ''
      }`}
      key={title}
      title={tooltip}
      onClick={() => onSelect(pageid, title)}
      onMouseDown={() => setHide && setHide(false)}
    >
      {title}
    </button>
  )
}

const ShowMoreSuggestions = ({
  question,
  relatedQuestions,
  onClose,
  searcher,
}: {
  question: string
  relatedQuestions: string[]
  onClose: (e: unknown) => void
  searcher: Searcher
}) => {
  const [extraQuestions, setExtraQuestions] = useState<SearchResult[]>(empty)
  const [error, setError] = useState<string>()

  useEffect(() => {
    searcher
      .searchUnpublished(question, 5)
      .then((res: SearchResult[] | null) => res && setExtraQuestions(res))
      .catch((e: any) => {
        console.error(e)
        setError(e)
      })
  }, [question, searcher])

  if (extraQuestions === empty) {
    return (
      <Dialog onClose={onClose}>
        <div className="loader"></div>
        {error && <div className="error">{error}</div>}
      </Dialog>
    )
  } else if (extraQuestions.length === 0) {
    return (
      <Dialog onClose={onClose}>
        <AddQuestion title={question} relatedQuestions={relatedQuestions} immediately={true} />
      </Dialog>
    )
  }
  return (
    <Dialog onClose={onClose}>
      <div className="dialog-title">
        You searched for &quot;{question}&quot;.
        <br />
        Here are some questions we&apos;re still answering. Are any of these what you&apos;re
        looking for?
      </div>
      {extraQuestions.map((question) => (
        <RequestQuestion key={question.pageid} {...question} />
      ))}
      <AddQuestion title={question} relatedQuestions={relatedQuestions} />
    </Dialog>
  )
}

const RequestQuestion = ({pageid, title, url}: SearchResult) => {
  return (
    <div className="possible-question" key={`extra-question-${pageid}`}>
      <Action className="result-item" pageid={pageid} actionType={ActionType.REQUEST}>
        <button className="transparent-button title" key={title}>
          {title}
        </button>
      </Action>
      <a className="icon-link" href={url} target="_blank" rel="noreferrer" title="edit answer">
        <Edit />
        Edit
      </a>
    </div>
  )
}

/**
 * Handle flushing searched phrases to the NLP logger endpoint
 */
let prevSearch = ''
let lastTimestamp = 0

const logSearch = (value: string) => {
  setTimeout(shouldFlushSearch(value, prevSearch), 4000)
  lastTimestamp = Date.now()
  prevSearch = value
}

const shouldFlushSearch = (value: string, prevSearch: string) => () => {
  const substring = prevSearch.startsWith(value) || value.startsWith(prevSearch)
  const timeDiff = Math.abs(Date.now() - lastTimestamp)
  const logValue = (value: string) =>
    fetch(`/questions/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'search',
        query: value,
        type: location.hostname,
      }),
    })

  // The searched value is totally different from the previous one - assume that they
  // are searching for something new, and log the previous search value
  if (prevSearch !== '' && !substring) {
    logValue(prevSearch)
    // The user has stopped typing for more than 4s - they either type very slowly,
    // have gotten distracted, or have found what they were looking for, so might as well log it
  } else if (value !== '' && timeDiff > 4000) {
    logValue(value)
  }
}
