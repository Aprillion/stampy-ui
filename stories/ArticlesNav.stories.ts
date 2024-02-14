import type {Meta, StoryObj} from '@storybook/react'
import {ArticlesNav} from '../app/components/ArticlesNav/Menu'

const meta = {
  title: 'Components/ArticlesNav',
  component: ArticlesNav,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArticlesNav>
export default meta
type Story = StoryObj<typeof ArticlesNav>

const article = {
  title: 'New to AI safety? Start here.',
  subtitle: 'Basic information about all of this',
  pageid: '9OGZ',
  icon: '/assets/coded-banner.svg',
  hasText: true,
  children: [
    {
      title: 'What would an AGI be able to do?',
      pageid: 'NH51',
      hasText: false,
    },
    {
      title: 'Types of AI',
      pageid: 'NH50',
      hasText: false,
      children: [
        {
          title: 'What are the differences between AGI, transformative AI, and superintelligence?',
          pageid: '5864',
          hasText: true,
        },
        {
          title: 'What is intelligence?',
          pageid: '6315',
          hasText: true,
        },
        {
          title: 'What is artificial general intelligence (AGI)?',
          pageid: '2374',
          hasText: true,
        },
        {
          title: 'What is "superintelligence"?',
          pageid: '6207',
          hasText: true,
        },
        {
          title: 'What is artificial intelligence (AI)?',
          pageid: '8G1H',
          hasText: true,
        },
      ],
    },
    {
      title: 'Introduction to ML',
      pageid: 'NH50',
      hasText: false,
      children: [
        {
          title: 'What are large language models?',
          pageid: '8161',
          hasText: true,
        },
        {
          title: 'What is compute?',
          pageid: '9358',
          hasText: true,
        },
      ],
    },
    {
      title: 'Introduction to AI Safety',
      pageid: 'NH53',
      hasText: false,
      children: [
        {
          title: 'Why would an AI do bad things?',
          pageid: '2400',
          hasText: true,
        },
        {
          title: 'How likely is extinction from superintelligent AI?',
          pageid: '7715',
          hasText: true,
        },
        {
          title: 'What is AI safety?',
          pageid: '8486',
          hasText: true,
        },
        {
          title: 'Why is safety important for smarter-than-human AI?',
          pageid: '6297',
          hasText: true,
        },
      ],
    },
  ],
}

export const Default: Story = {
  args: {
    path: ['90GZ', 'NH51'],
    article,
  },
}

export const TopSelected: Story = {
  args: {
    path: ['9OGZ'],
    article,
  },
}

export const ChildSelected: Story = {
  args: {
    path: ['9OGZ', 'NH53', '8486'],
    article,
  },
}
