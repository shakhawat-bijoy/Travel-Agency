import { Link } from 'react-router-dom'

const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={item.label} className="flex items-center gap-2">
              {isLast || !item.to ? (
                <span className="text-gray-900 font-medium">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-teal-600">
                  {item.label}
                </Link>
              )}
              {!isLast && <span className="text-gray-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
