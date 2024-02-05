import React from 'react'

interface MenuItemProps {
  link: string
  icon?: React.ReactNode | string
  text: string
  /**
   * Is this the primary class of Menu link?
   */
  primary?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}
export const MenuItem = ({
  primary = false,
  link,
  icon,
  text,
  onMouseEnter,
  onMouseLeave,
}: MenuItemProps) => {
  return (
    <li className="top-menu-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <a href={link} className="top-menu-link">
        {icon ? (
          typeof icon === 'string' ? (
            <img loading="lazy" src={icon} className="top-menu-icon" alt={text} />
          ) : (
            icon
          )
        ) : null}

        <span className={['top-menu-text', primary ? '' : 'secondary'].join(' ')}>{text}</span>
      </a>
    </li>
  )
}

export default MenuItem
