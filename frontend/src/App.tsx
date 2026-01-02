import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import PremiumRoute from './components/PremiumRoute';
import Updates from './pages/Updates';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/updates" element={<Updates />} />

              {/* Protected Routes that require authentication but not necessarily a role yet */}
              <Route element={<ProtectedRoute requireOnboarding={false} />}>
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>

              <Route path="/marketplace" element={<Marketplace />} />

              {/* Protected Routes that require a full profile (role) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/planner" element={<Planner />} />

                {/* Premium Routes */}
                <Route element={<PremiumRoute />}>
                  {/* Future premium-only routes */}
                </Route>
              </Route>
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
