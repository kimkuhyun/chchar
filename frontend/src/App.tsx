import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStudio } from './store/studio'
import PublicLayout from './layouts/PublicLayout'
import StudioLayout from './layouts/StudioLayout'
// 공개
import Landing from './pages/public/Landing'
import ExploreLevels from './pages/public/ExploreLevels'
import ExploreAssets from './pages/public/ExploreAssets'
import LevelDetail from './pages/public/LevelDetail'
import Profile from './pages/public/Profile'
import Login from './pages/public/Login'
// 스튜디오
import Dashboard from './pages/studio/Dashboard'
import GpuConnect from './pages/studio/GpuConnect'
import Generate from './pages/studio/Generate'
import Queue from './pages/studio/Queue'
import MyAssets from './pages/studio/MyAssets'
import AssetDetail from './pages/studio/AssetDetail'
import Builder from './pages/studio/Builder'
import Slicer from './pages/studio/Slicer'
import Play from './pages/studio/Play'
import MyLevels from './pages/studio/MyLevels'
import Presets from './pages/studio/Presets'
import Settings from './pages/studio/Settings'
import Pipeline from './pages/studio/Pipeline'

function StudioGuard() {
  const uid = useStudio((s) => s.currentUserId)
  if (!uid) return <Navigate to="/login" replace />
  return <StudioLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="explore" element={<ExploreLevels />} />
          <Route path="explore/assets" element={<ExploreAssets />} />
          <Route path="level/:id" element={<LevelDetail />} />
          <Route path="u/:handle" element={<Profile />} />
        </Route>

        <Route path="/studio" element={<StudioGuard />}>
          <Route index element={<Dashboard />} />
          <Route path="gpu" element={<GpuConnect />} />
          <Route path="generate" element={<Generate />} />
          <Route path="queue" element={<Queue />} />
          <Route path="assets" element={<MyAssets />} />
          <Route path="asset/:id" element={<AssetDetail />} />
          <Route path="builder" element={<Builder />} />
          <Route path="slicer" element={<Slicer />} />
          <Route path="play" element={<Play />} />
          <Route path="levels" element={<MyLevels />} />
          <Route path="presets" element={<Presets />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pipeline" element={<Pipeline />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
