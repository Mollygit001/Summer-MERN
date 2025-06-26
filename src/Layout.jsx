import Header from './components/Header'
import Footer from './components/Footer'

const Layout = ({children, userDetails}) => {
  return (
    <div className='flex flex-col min-h-screen bg-gray-100'>
      <Header userDetails = {userDetails}/>
      <main className='flex-grow container mx-auto p-4'>
        {children}
      </main>
      <Footer/>
    </div>
  )
}

export default Layout