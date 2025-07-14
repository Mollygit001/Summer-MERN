import React from 'react'

const Footer = () => {
  const date = new Date().getFullYear();
  return (
    <>
    <footer className='bg-gray-800 text-white p-4 text-center '>
        <p>&copy; {date} Rights are reserved under our terms and condition.</p>
      </footer>
    </>
  )
}

export default Footer