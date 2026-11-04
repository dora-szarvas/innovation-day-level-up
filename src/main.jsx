import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// HashRouter, never BrowserRouter. Both publish targets serve the app from a
// one-level-deep subpath and neither rewrites unknown paths back to index.html,
// so path-based routes 404 on refresh and on any shared deep link. Keeping routes
// in the fragment means one index.html serves every route at any mount path.
// DO NOT "modernize" this — see rule 15 in 00-nebula-core.mdc and the full
// contract in 12-nebula-hosting-and-routing.mdc.
import { HashRouter } from 'react-router-dom'
import './nebula.css'
import './index.css'
import './game.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
