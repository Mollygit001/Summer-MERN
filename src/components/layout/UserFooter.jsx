import React from 'react'

const UserFooter = () => {
  return (
    <>
        <footer className="bg-gray-800 text-white p-4 text-center">
            <p className="text-sm">© {new Date().getFullYear()} Affiliate++. All rights reserved.</p>
            <p className="text-xs">Powered by React, Node.js, Express, and MongoDB</p>
        </footer>
    </>
  )
}

export default UserFooter