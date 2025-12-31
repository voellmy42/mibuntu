import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes that require authentication but not necessarily a role yet */}
            <Route element={<ProtectedRoute requireOnboarding={false} />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Protected Routes that require a full profile (role) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/planner" element={<Planner />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
