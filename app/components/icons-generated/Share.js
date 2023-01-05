import * as React from 'react'
import {useMediaPredicate} from 'react-media-hook'

const SvgShare = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    style={{
      enableBackground: 'new 0 0 448 512',
    }}
    xmlSpace="preserve"
    {...props}
  >
    <circle
      cx={369}
      cy={112}
      r={80}
      style={{
        fill: '#f0f',
      }}
    />
    <circle
      cx={368}
      cy={400}
      r={80}
      style={{
        fill: '#0ff',
      }}
    />
    <circle
      cx={79.1}
      cy={256}
      r={80}
      style={{
        fill: '#8080ff',
      }}
    />
    <path
      className="image-core"
      d="M448 112c0 44.2-35.8 80-80 80-25.9 0-48.9-12.3-63.5-31.3l-147.4 73.7c1 6.9 2 14.1 2 21.6s-1 14.7-2 21.6l147.4 73.7c14.6-19 37.6-31.3 63.5-31.3 44.2 0 80 35.8 80 80s-35.8 80-80 80-80-35.8-80-80c0-12.6 2.9-24.5 8.1-35.9l-144.9-71.6C137.9 318.3 111 336 80 336c-44.2 0-80-35.8-80-80s35.8-80 80-80c31 0 57.9 17.7 71.2 43.5L296.1 147c-5.2-10.6-8.1-22.4-8.1-35 0-44.2 35.8-80 80-80s80 35.8 80 80zM79.1 320c36.2 0 64-28.7 64-64s-27.8-64-64-64c-34.4 0-64 28.7-64 64s29.6 64 64 64zM368 48c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm0 416c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64z"
      style={{
        fill: useMediaPredicate('(prefers-color-scheme: dark)')
          ? 'rgb(204, 204, 204)'
          : 'rgb(51, 51, 51)',
      }}
    />
  </svg>
)

export default SvgShare
