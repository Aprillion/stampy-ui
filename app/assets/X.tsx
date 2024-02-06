interface OpenBookProps {
  /**
   * Classname for the icon
   */
  classname: string
  /**
   * On click event
   */
  onClick: () => void
}
const X = ({classname, onClick}: OpenBookProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      className={classname}
      onClick={onClick}
    >
      <path
        fill="#AFB7C2"
        d="M3.64645 11.6464c-.19527.1953-.19527.5119 0 .7072.19526.1952.51184.1952.7071 0L8 8.70711l3.6464 3.64649c.1953.1952.5119.1952.7072 0 .1952-.1953.1952-.5119 0-.7072L8.70711 8l3.64649-3.64645c.1952-.19526.1952-.51184 0-.7071-.1953-.19527-.5119-.19527-.7072 0L8 7.29289 4.35355 3.64645c-.19526-.19527-.51184-.19527-.7071 0-.19527.19526-.19527.51184 0 .7071L7.29289 8l-3.64644 3.6464Z"
      />
    </svg>
  )
}
export const XIcon = X
