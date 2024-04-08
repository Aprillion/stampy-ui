import {useState, useEffect, MouseEvent, useCallback, ReactNode} from 'react'
import type {ActionFunctionArgs} from '@remix-run/cloudflare'
import {Form, useSearchParams} from '@remix-run/react'
import {json} from '@remix-run/cloudflare'
import {makeColumnIncrementer} from '~/server-utils/stampy'
import ThumbUpIcon from '~/components/icons-generated/ThumbUp'
import ThumbDownIcon from '~/components/icons-generated/ThumbDown'
import Button from '~/components/Button'
import {DarkLight, Edit, Flag, Followup, Hide, Like, Search} from '~/components/icons-generated'

export enum ActionType {
  DARKLIGHT = 'darkLight',
  EDIT = 'edit',
  FLAG = 'flag',
  FOLLOWUP = 'followup',
  HELPFUL = 'helpful',
  UNHELPFUL = 'unhelpful',
  HIDE = 'hide',
  REQUEST = 'request',
  SEARCH = 'search',
}
export type ActionProps = {
  Icon: React.FC
  title: string
  handler?: (pageid: string, actionTaken: boolean) => Promise<string>
}
type ActionsDict = {
  [k: string]: ActionProps
}
const actions = {
  darkLight: {
    Icon: DarkLight,
    title: 'Dark/Light',
  },
  edit: {
    Icon: Edit,
    title: 'Edit',
  },
  flag: {
    Icon: Flag,
    title: 'Flag',
  },
  followup: {
    Icon: Followup,
    title: 'Followup',
  },
  request: {
    Icon: Like,
    title: 'Request',
    handler: makeColumnIncrementer('Request Count'),
  },
  helpful: {
    Icon: ThumbUpIcon,
    title: 'Yes',
    handler: makeColumnIncrementer('Helpful'),
  },
  unhelpful: {
    Icon: ThumbDownIcon,
    title: 'No',
    handler: makeColumnIncrementer('Unhelpful'),
  },
  hide: {
    Icon: Hide,
    title: 'Hide',
  },
  search: {
    Icon: Search,
    title: 'Search',
  },
} as ActionsDict

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()
  const pageid = formData.get('pageid') as string
  const actionType = formData.get('action') as ActionType
  const actionTaken = (formData.get('actionTaken') as string) === 'true'

  const handler = actions[actionType]?.handler
  if (handler) {
    const result = await handler(pageid, actionTaken)
    if (result != 'ok') return json({error: result}, {status: 400})
  } else {
    console.log(`Got unhandled action: ${actionType} for page ${pageid}`)
  }

  return {result: 'ok'}
}

type Props = {
  pageid: string
  actionType: ActionType
  showText?: boolean
  children?: ReactNode | ReactNode[]
  [k: string]: unknown
  onSuccess?: () => void
  onClick?: () => void
}
export const Action = ({
  pageid,
  actionType,
  showText = true,
  children,
  onSuccess,
  onClick,
  ...props
}: Props) => {
  const [remixSearchParams] = useSearchParams()
  const [stateString] = useState(() => remixSearchParams.get('state') ?? '')
  const {Icon, title} = actions[actionType]

  // Get the state of this action for the given `pageid` from localstorage. This
  // will result in each action only being allowed once per browser
  const actionId = `${pageid}-${actionType}`
  const [actionTaken, setActionTaken] = useState(false)
  const loadActionTaken = useCallback(() => {
    try {
      return localStorage.getItem(actionId) === 'true'
    } catch (e) {
      // This will happen when local storage is disabled
      return false
    }
  }, [actionId])
  useEffect(() => setActionTaken(loadActionTaken()), [loadActionTaken])
  useEffect(() => {
    if (loadActionTaken() || actionTaken) {
      try {
        localStorage.setItem(actionId, actionTaken.toString())
      } catch (e) {
        // This will happen when local storage is disabled
      }
    }
  }, [actionTaken, loadActionTaken, actionId])

  const handleAction = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    if (onClick) {
      onClick()
    }
    setActionTaken(!actionTaken)

    // This sort of cheats - if more than 1 request is sent per second (or some other such time
    // period), one of them will be (sort of) picked at random. This should be ok in the long run.
    // Hopefully.
    const searchParams = new URLSearchParams({
      pageid,
      actionTaken: actionTaken.toString(),
      action: actionType,
    })
    const response = await fetch('/questions/actions', {method: 'POST', body: searchParams})

    if (response.ok !== true) {
      setActionTaken(!actionTaken)
    } else if (onSuccess) {
      onSuccess()
    }
  }

  const className = 'secondary icon-link' + (actionTaken ? ' focused' : '')

  return (
    <Form
      replace
      action="/questions/actions"
      method="post"
      title={title}
      onClick={handleAction}
      {...props}
    >
      <input type="hidden" name="action" value={actionType} />
      <input type="hidden" name="pageid" value={pageid} />
      <input type="hidden" name="incBy" value={actionTaken ? -1 : 1} />
      <input type="hidden" name="stateString" value={stateString} />
      {children}
      <Button className={className}>
        <Icon />
        <p className={[actionTaken ? 'teal-500' : 'grey', 'small'].join(' ')}>
          {' '}
          {showText && title}
        </p>
      </Button>
    </Form>
  )
}
