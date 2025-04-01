import React from 'react'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import Help from './components/Help'
import InfoPage from './components/InfoPage'
import MSGManage from './components/MSGManage'
import StudentsManage from './components/StudentsManage'
import CoursesManage from './components/CoursesManage'
import MSGForms from './components/MSGForms'
import StudentsForm from './components/StudentsForm'

export default function App() {
  return (
    <div>
      <Header/>

      <Routes>
        <Route path='/MSGFForms' element={<MSGForms />} />
        <Route path='/StudentsForm' element={<StudentsForm />} />
        <Route path='/StudentsManage' element={<StudentsManage />} />
        <Route path='/CoursesManage' element={<CoursesManage />} />
        <Route path='/MSGManage' element={<MSGManage />} />
        <Route path='/' element={<HomePage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/info" element={<InfoPage />} />
      </Routes>
    </div>
  )
}
