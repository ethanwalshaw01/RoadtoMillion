import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import PostJob from './pages/PostJob'
import JobBidding from './pages/JobBidding'
import Confirmed from './pages/Confirmed'
import DriverBoard from './pages/DriverBoard'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/job/:jobId" element={<JobBidding />} />
          <Route path="/confirmed/:jobId" element={<Confirmed />} />
          <Route path="/driver" element={<DriverBoard />} />
        </Routes>
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        Recovr — a sample car recovery bidding platform · demo data only
      </footer>
    </div>
  )
}
