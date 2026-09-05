import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CloudSync } from './components/system/CloudSync'
import { DashboardPage } from './pages/DashboardPage'
import { ExplorePage } from './pages/ExplorePage'
import { MapPage } from './pages/MapPage'
import { ListsPage } from './pages/ListsPage'

function App() {
  return (
    <BrowserRouter>
      <CloudSync />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/lists" element={<ListsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App