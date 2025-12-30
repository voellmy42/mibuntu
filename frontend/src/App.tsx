import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
