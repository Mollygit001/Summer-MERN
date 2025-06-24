import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <>
    <header className='bg-blue-600 text-white p-4 text-center'>
        <h1 className='text-2xl font-bold mb-2'>My MERN App</h1>
        <nav>
          <Link to="/" className="mx-2 hover:underline">Home</Link>
          <Link to="/login" className="mx-2 hover:underline">Login</Link>
        </nav>
      </header>
    </>
  )
}

export default Header