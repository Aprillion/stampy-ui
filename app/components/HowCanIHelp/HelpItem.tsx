import {ReactNode} from 'react'
import LinkCard, {Link} from '~/components/LinkCard'

type HelpItemProps = {
  title?: ReactNode
  children: ReactNode
  links?: Link[]
  titleFont?: 'large-bold' | 'default-bold'
}
const HelpItem = ({title, children, links, titleFont = 'large-bold'}: HelpItemProps) => {
  return (
    <div className="section-split padding-bottom-40">
      <div>
        {title && <p className={`padding-bottom-16 ${titleFont}`}>{title}</p>}
        <p className="grey default padding-bottom-16"> {children} </p>
      </div>
      <div>
        {links?.map((link) => (
          <div key={link.title} className="padding-bottom-16">
            <LinkCard action={link.action || '#'} {...link} />
          </div>
        ))}
      </div>
    </div>
  )
}
export default HelpItem
