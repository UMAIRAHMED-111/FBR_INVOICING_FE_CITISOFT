import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logoImg from './assets/aa-logo.jpeg'
import { Provider } from 'react-redux'
import { store } from './store/store'

function WithFavicon() {
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
    link.setAttribute('rel', 'icon')
    link.setAttribute('type', 'image/png')
    link.setAttribute('href', logoImg)
    if (!link.parentNode) document.head.appendChild(link)
  }, [])
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <WithFavicon />
    </Provider>
  </StrictMode>,
)
