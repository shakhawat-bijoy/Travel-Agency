import { Link } from 'react-router-dom'

const Image = ({src, alt, to, className}) => {
  return (
    <Link to={to}>
      <picture>
         <img className={className} src={src} alt={alt} />
      </picture>
    </Link>
  )
}

export default Image