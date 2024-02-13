import type {SVGProps} from 'react'
const SvgArrowUpRight = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" {...props}>
    <g stroke="#1D9089" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5h5.5V8M13 3 2.5 13.5" />
    </g>
  </svg>
)
export default SvgArrowUpRight
