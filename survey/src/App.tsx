import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SurveyList from '@/pages/SurveyList'
import SurveyCreate from '@/pages/SurveyCreate'
import SurveyAnswer from '@/pages/SurveyAnswer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveyList />} />
        <Route path="/create" element={<SurveyCreate />} />
        <Route path="/edit/:id" element={<SurveyCreate />} />
        <Route path="/s/:id" element={<SurveyAnswer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
