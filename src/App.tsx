import { useEffect, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import ToastViewport from './components/ToastViewport'
import NotificationBridge from './components/NotificationBridge'
import Landing from './pages/Landing'
import Login from './pages/Login'
import PostJob from './pages/PostJob'
import JobBidding from './pages/JobBidding'
import Tracking from './pages/Tracking'
import MyJobs from './pages/MyJobs'
import DriverBoard from './pages/DriverBoard'
import DriverJob from './pages/DriverJob'
import Account from './pages/Account'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { useAuth, type Role } from './state/AuthContext'

function RequireRole({ role, children }: { role?: Role; children: ReactElement }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname, preselect: role }} />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/post'} replace />
  }
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

const P = ({ children }: { children: ReactElement }) => <PageTransition>{children}</PageTransition>

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div data-role={user?.role ?? 'customer'} className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <NotificationBridge />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<P><Landing /></P>} />
            <Route path="/login" element={<P><Login /></P>} />
            <Route path="/post" element={<RequireRole role="customer"><P><PostJob /></P></RequireRole>} />
            <Route path="/job/:jobId" element={<RequireRole role="customer"><P><JobBidding /></P></RequireRole>} />
            <Route path="/track/:jobId" element={<RequireRole role="customer"><P><Tracking /></P></RequireRole>} />
            <Route path="/jobs" element={<RequireRole role="customer"><P><MyJobs /></P></RequireRole>} />
            <Route path="/driver" element={<RequireRole role="driver"><P><DriverBoard /></P></RequireRole>} />
            <Route path="/driver/job/:jobId" element={<RequireRole role="driver"><P><DriverJob /></P></RequireRole>} />
            <Route path="/account" element={<RequireRole role="driver"><P><Account /></P></RequireRole>} />
            <Route path="/settings" element={<RequireRole><P><Settings /></P></RequireRole>} />
            <Route path="*" element={<P><NotFound /></P>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastViewport />
    </div>
  )
}
