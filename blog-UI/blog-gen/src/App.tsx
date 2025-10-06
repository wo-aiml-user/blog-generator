import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BlogGenerationPage from './pages/BlogGenerationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<BlogGenerationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
