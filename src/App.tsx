import type { ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PostJob from './pages/PostJob'
import JobBidding from './pages/JobBidding'
import Confirmed from './pages/Confirmed'
import DriverBoard from './pages/DriverBoard'
import Account from './pages/Account'
import { useAuth, type Role } from './state/AuthContext'

function RequireRole({ role, children }: { role: Role; children: ReactElement }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/post'} replace />
  }
  return children
}

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div
      data-role={user?.role}
      className="flex min-h-screen flex-col transition-colors duration-500"
    >
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route
              path="/post"
              element={
                <RequireRole role="customer">
                  <PageTransition><PostJob /></PageTransition>
                </RequireRole>
              }
            />
            <Route
              path="/job/:jobId"
              element={
                <RequireRole role="customer">
                  <PageTransition><JobBidding /></PageTransition>
                </RequireRole>
              }
            />
            <Route
              path="/confirmed/:jobId"
              element={
                <RequireRole role="customer">
                  <PageTransition><Confirmed /></PageTransition>
                </RequireRole>
              }
            />
            <Route
              path="/driver"
              element={
                <RequireRole role="driver">
                  <PageTransition><DriverBoard /></PageTransition>
                </RequireRole>
              }
            />
            <Route
              path="/account"
              element={
                <RequireRole role="driver">
                  <PageTransition><Account /></PageTransition>
                </RequireRole>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        Recovr — a sample car recovery bidding platform · demo data only
      </footer>
    </div>
  )
}
