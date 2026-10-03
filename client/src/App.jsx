<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticlesBackground from './components/ParticlesBackground';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 position-relative">
        {/* Ambient Animated Particles */}
        <ParticlesBackground />

        {/* Global Navigation */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
=======
import React from 'react'

function App() {
  return (
    <div>App</div>
  )
}

export default App
>>>>>>> 7c8a8c19c062396d958d4e03aad9a4052ed53bdc
