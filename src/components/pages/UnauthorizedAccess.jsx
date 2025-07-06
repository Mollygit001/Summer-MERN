import React from 'react'

const UnauthorizedAccess = () => {
  return (
    <>
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
            <p className="text-lg text-gray-700">You do not have permission to view this page.</p>
            <p className="text-sm text-gray-500 mt-2">Please contact your administrator if you believe this is an error.</p>
        </div>
    </>
  )
}

export default UnauthorizedAccess