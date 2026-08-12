import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Digital from './pages/Digital'
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="artwork/digital" element={<Digital />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
