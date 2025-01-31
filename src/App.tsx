import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhotoBooth from './components/PhotoBooth';
import AdminPanel from './components/AdminPanel';
import Navigation from './components/Navigation';
import PaymentPlans from './components/PaymentPlans';
import DynamicBackground from './components/DynamicBackground';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <div className="min-h-screen bg-canvas">
            <DynamicBackground />
            <Navigation />
            <main className="container mx-auto px-4 py-8 content-area relative z-10">
              <Routes>
                <Route path="/" element={<PhotoBooth />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/plans" element={<PaymentPlans />} />
              </Routes>
            </main>
          </div>
          <Toaster position="top-right" />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;