import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CloudSync } from './components/system/CloudSync'
import { PrintResume } from './components/resume/PrintResume'
import { DashboardPage } from './pages/DashboardPage'
import { ExplorePage } from './pages/ExplorePage'
import { MapPage } from './pages/MapPage'
import { ListsPage } from './pages/ListsPage'
import { PublicProfilePage } from './pages/PublicProfilePage'

function App() {
  return (
    <BrowserRouter>
      <CloudSync />
      <PrintResume />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/lists" element={<ListsPage />} />
        </Route>
        {/* deliberately outside the Layout shell - no sidebar, no sign-in
            state, no picker/palette. a visitor here isn't using the app,
            they're viewing one public page */}
        <Route path="/u/:uid" element={<PublicProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App