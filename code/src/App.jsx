
import React from 'react';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Help from './components/Help';
import InfoPage from './components/InfoPage';
import MessageManage from './components/MessageManage';
import StudentsManage from './components/StudentsManage';
import CoursesManage from './components/CoursesManage';
import MessageForm from './components/MessageForm';
import StudentsForm from './components/StudentsForm';
import CourseForm from './components/CourseForm';
import TaskManage from './components/TaskManage';
import TaskForm from './components/TaskForm';
import GradeManage from './components/GradeManage';
import GradeForm from './components/GradeForm';

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/help' element={<Help />} />
        <Route path='/info' element={<InfoPage />} />

        <Route path='/StudentsForm' element={<StudentsForm />} />
        <Route path='/StudentsForm/:id' element={<StudentsForm />} />
        <Route path='/StudentsManage' element={<StudentsManage />} />

        <Route path='/CourseForm' element={<CourseForm />} />
        <Route path='/CourseForm/:id' element={<CourseForm />} />
        <Route path='/CoursesManage' element={<CoursesManage />} />

        <Route path='/MessageForm' element={<MessageForm />} />
        <Route path='/MessageForm/:id' element={<MessageForm />} />
        <Route path='/MessageManage' element={<MessageManage />} />

        <Route path='/TaskForm' element={<TaskForm />} />
        <Route path='/TaskForm/:id' element={<TaskForm />} />
        <Route path='/TaskManage' element={<TaskManage />} />

        <Route path='/GradeForm' element={<GradeForm />} />
        <Route path='/GradeForm/:id' element={<GradeForm />} />
        <Route path='/GradeManage' element={<GradeManage />} />
      </Routes>
    </div>
  );
}
