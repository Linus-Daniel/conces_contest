import { CandidateProvider } from '@/context/authContext'
import React from 'react'
import Header from './Header'
import Footer from './Footer'

function Wrapper({children}: {children: React.ReactNode}) {
  return (
    <div className='w-full h-scree'>
        <CandidateProvider>
          <Header />
            {children}
          <Footer />
        </CandidateProvider>
    </div>
  )
}

export default Wrapper