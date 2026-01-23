import React from 'react'
import { Link } from 'react-router-dom'

const Button = ({ text, className, to, onClick, type, target }) => {
  const isExternal = to?.startsWith('http') || target === '_blank';

  if (isExternal) {
    return (
      <a href={to} target={target} rel={target === '_blank' ? "noopener noreferrer" : ""} onClick={onClick} className="inline-block">
        <button type={type} className={`cursor-pointer ${className}`}>{text}</button>
      </a>
    );
  }

  return (
    <div onClick={onClick}>
      <Link to={to}>
        <button type={type} className={`cursor-pointer ${className}`}>{text}</button>
      </Link>
    </div>
  )
}

export default Button