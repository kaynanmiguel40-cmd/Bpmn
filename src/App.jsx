import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'

function App() {
  return (
    <div className="h-full min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:id?" element={<Editor />} />
      </Routes>
    </div>
  )
}

export default App
