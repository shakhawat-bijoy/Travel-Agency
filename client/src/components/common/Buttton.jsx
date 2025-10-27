import React from 'react'
import { Link } from 'react-router-dom'

const Button = ({text, className,to, onClick, type}) => {
  return (
    <div onClick={onClick}>
      <Link to={to}>
      <button type={type} className={`cursor-pointer ${className}`}>{text}</button>
      
      </Link>
    </div>
  )
}

export default Button