import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import episode from './data/episode.json'
import Library from './screens/Library.jsx'
import Episodes from './screens/Episodes.jsx'
import Game from './screens/Game.jsx'
import EndScreen from './screens/EndScreen.jsx'

/**
 * Level Up: Midnight Train (Innovation Day 2026 demo).
 * Routes: #/ library → #/midnight-train episodes → #/midnight-train/play → #/midnight-train/end.
 * The last run lives here so the end screen can read it; nothing is persisted (no learner data).
 */
export default function App() {
  // Focus-session length in minutes; null = no timer.
  const [sessionMinutes, setSessionMinutes] = useState(episode.sessionLength.default)
  const [lastRun, setLastRun] = useState(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Every visit starts in the game library, even if the URL was left mid-episode.
  useEffect(() => {
    if (pathname !== '/') navigate('/', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on first load
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route
        path="/midnight-train"
        element={
          <Episodes
            sessionMinutes={sessionMinutes}
            onSessionMinutesChange={setSessionMinutes}
          />
        }
      />
      {/* Every run starts as "new to the topic" (level 0); in the product this comes from course proficiency. */}
      <Route path="/midnight-train/play" element={<Game startLevel={0} sessionMinutes={sessionMinutes} onEnd={setLastRun} />} />
      <Route
        path="/midnight-train/end"
        element={lastRun ? <EndScreen run={lastRun} /> : <Navigate to="/midnight-train" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
