import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStudio } from './store/studio'
import PublicLayout from './layouts/PublicLayout'
import StudioLayout from './layouts/StudioLayout'

// 공개
import Landing from './pages/public/Landing'
import ExplorePawns from './pages/public/ExplorePawns'
import ExploreParts from './pages/public/ExploreParts'
import ExploreScenes from './pages/public/ExploreScenes'
import PawnDetail from './pages/public/PawnDetail'
import SceneDetail from './pages/public/SceneDetail'
import Profile from './pages/public/Profile'
import Login from './pages/public/Login'

// 스튜디오
import Onboarding from './pages/studio/Onboarding'
import Dashboard from './pages/studio/Dashboard'
import Generate from './pages/studio/Generate'
import Slicer from './pages/studio/Slicer'
import Parts from './pages/studio/Parts'
import PawnEditor from './pages/studio/PawnEditor'
import MyPawns from './pages/studio/MyPawns'
import SceneBuilder from './pages/studio/SceneBuilder'
import MyScenes from './pages/studio/MyScenes'
import SettingsPage from './pages/studio/Settings'

function StudioGuard() {
  const user = useStudio((s) => s.currentUser)
  if (!user) return <Navigate to="/login" replace />
  return <StudioLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="explore" element={<ExplorePawns />} />
          <Route path="explore/parts" element={<ExploreParts />} />
          <Route path="explore/scenes" element={<ExploreScenes />} />
          <Route path="pawn/:id" element={<PawnDetail />} />
          <Route path="scene/:id" element={<SceneDetail />} />
          <Route path="u/:handle" element={<Profile />} />
        </Route>

        <Route path="/studio" element={<StudioGuard />}>
          <Route index element={<Dashboard />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="generate" element={<Generate />} />
          <Route path="slicer" element={<Slicer />} />
          <Route path="parts" element={<Parts />} />
          <Route path="pawn" element={<PawnEditor />} />
          <Route path="pawn/:id" element={<PawnEditor />} />
          <Route path="pawns" element={<MyPawns />} />
          <Route path="scenes" element={<SceneBuilder />} />
          <Route path="scene/:id" element={<SceneBuilder />} />
          <Route path="my-scenes" element={<MyScenes />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
