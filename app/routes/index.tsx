import {useState} from 'react'
import type {LoaderFunction} from '@remix-run/cloudflare'
import type {ShouldReloadFunction} from '@remix-run/react'
import {useLoaderData, Link} from '@remix-run/react'
import copy from 'copy-to-clipboard'

import type {Question as QuestionType} from '~/stampy'
import {getIntro, getInitialQuestions} from '~/stampy'
import useQuestionStateInUrl from '~/hooks/useQuestionStateInUrl'
import useRerenderOnResize from '~/hooks/useRerenderOnResize'
import Search from '~/components/search'
import Question from '~/components/question'
import logoSvg from '~/assets/stampy-logo.svg'

import iconShare from '~/assets/icons/share-nodes.svg'
import iconCode from '~/assets/icons/code.svg'
import iconUsers from '~/assets/icons/users.svg'

type LoaderData = {
  intro: string
  initialQuestions: QuestionType[]
}

export const loader: LoaderFunction = async ({request}): Promise<LoaderData> => {
  return {
    intro: await getIntro(),
    initialQuestions: await getInitialQuestions(request),
  }
}

export const unstable_shouldReload: ShouldReloadFunction = () => false

export default function App() {
  const {intro, initialQuestions} = useLoaderData<LoaderData>()
  const {questions, reset, toggleQuestion, onLazyLoadQuestion, selectQuestionByTitle} =
    useQuestionStateInUrl(initialQuestions)

  useRerenderOnResize() // recalculate AutoHeight

  const [copied, setCopied] = useState(false)
  const shareLink = () => {
    copy(location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <>
      <header>
        <Link to="/" onClick={(e) => reset(e)}>
          <img className="logo simplified-logo" alt="logo" width="150" height="129" src={logoSvg} />
        </Link>
        <div className="intro">
          <h1>
            Welcome to <span className="highlight">stampy.ai</span>!
          </h1>
          <h3>
            I can answer your questions about <br />
            <a href="https://en.wikipedia.org/wiki/Existential_risk_from_artificial_general_intelligence">
              artificial general intelligence safety
            </a>
          </h3>
        </div>
        <div className="icon-link-group">
          <button
            className={`icon-link transparent-button share ${copied ? 'copied' : ''}`}
            onClick={shareLink}
          >
            <img alt="" src={iconShare} className="icon-link" />
            Share link
          </button>
          <a href="https://stampy.ai/wiki/Get_involved" className="icon-link">
            <img alt="" src={iconUsers} className="icon-link" />
            Get Involved
          </a>
          <a href="https://github.com/StampyAI/stampy-ui" className="icon-link">
            <img alt="" src={iconCode} className="icon-link" />
            Help Code
          </a>
        </div>
      </header>
      <main>
        <Search onSelect={selectQuestionByTitle} />
        {questions.map((questionProps) => (
          <Question
            key={questionProps.pageid}
            questionProps={questionProps}
            onLazyLoadQuestion={onLazyLoadQuestion}
            onToggle={toggleQuestion}
          />
        ))}
      </main>
      <footer>
        <a href="https://stampy.ai/wiki/Stampy">About</a>
        <a href="https://stampy.ai/wiki/Get_involved">Get Involved</a>
        <a href="https://github.com/StampyAI/stampy-ui">Help Code</a>
        <a href="https://stampy.ai/wiki/Discord_invite">Join Discord</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdT--8lx5F2pAZoRPPkDusA7vUTvKTVnNiAb9U5cqnohDhzHA/viewform">
          Feedback
        </a>
        <a href="https://stampy.ai/wiki/Meta:Copyrights">@ 2022 stampy.ai</a>
      </footer>
    </>
  )
}
