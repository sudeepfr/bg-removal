import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import AppContextProvider from './context/AppContext.jsx'

  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
         <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <AppContextProvider>
           <App />
          </AppContextProvider>
         </ClerkProvider>
    
  </BrowserRouter>,
)

