import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Settings, CreditCard, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/firebase';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleCreditsClick = () => {
    navigate('/plans');
  };

  return (
    <header className="bg-primary shadow-lg relative z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold text-black flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Camera className="w-8 h-8" />
            Picasso's Portraits
          </Link>
          
          <div className="flex items-center gap-4">
            {!user && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors cursor-pointer shadow-md"
              >
                <User className="w-5 h-5" />
                <span>Log In / Sign Up</span>
              </button>
            )}

            <button
              onClick={handleCreditsClick}
              className="flex items-center gap-2 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors cursor-pointer shadow-md"
            >
              <CreditCard className="w-5 h-5" />
              <span>Picasso Credits</span>
            </button>
            
            {user && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors cursor-pointer shadow-md"
                >
                  <Settings className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-accent-red/90 transition-colors cursor-pointer shadow-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
};

export default Navigation;