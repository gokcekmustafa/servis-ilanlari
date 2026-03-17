import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IlanDetayPage from './pages/IlanDetayPage';
import IlanEklePage from './pages/IlanEklePage';
import PanelPage from './pages/PanelPage';
import { Ilan } from './types';
import { mevcutKullanici, cikisYap } from './lib/auth';

type Page = 'home' | 'login' | 'register' | 'detay' | 'ilan-ekle' | 'panel';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedIlan, setSelectedIlan] = useState<Ilan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const user = mevcutKullanici();
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.id);
    }
    setYukleniyor(false);
  }, []);

  const handleLogin = () => {
    const user = mevcutKullanici();
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.id);
    }
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await cikisYap();
    setIsLoggedIn(false);
    setUserId(null);
    setCurrentPage('home');
  };

  const handleIlanDetay = (ilan: Ilan) => {
    setSelectedIlan(ilan);
    setCurrentPage('detay');
  };

  const handleIlanEkle = () => {
    if (!isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('ilan-ekle');
  };

  const handleIlanSuccess = () => {
    setSuccessMsg('İlanınız basariyla yayinlandi!');
    setCurrentPage('home');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const headerProps = {
    isLoggedIn,
    onGoLogin: () => setCurrentPage('login'),
    onLogout: handleLogout,
    onIlanEkle: handleIlanEkle,
    onGoPanel: () => setCurrentPage('panel'),
  };

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setCurrentPage('register')}
        onGoHome={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegister={handleLogin}
        onGoLogin={() => setCurrentPage('login')}
        onGoHome={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'detay' && selectedIlan) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header {...headerProps} />
        <IlanDetayPage
          ilan={selectedIlan}
          onGoBack={() => setCurrentPage('home')}
          onGoLogin={() => setCurrentPage('login')}
          isLoggedIn={isLoggedIn}
        />
        <Footer />
      </div>
    );
  }

  if (currentPage === 'ilan-ekle') {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header {...headerProps} />
        <IlanEklePage
          onGoBack={() => setCurrentPage('home')}
          onSuccess={handleIlanSuccess}
          userId={userId || ''}
        />
        <Footer />
      </div>
    );
  }

  if (currentPage === 'panel') {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header {...headerProps} />
        <PanelPage
          onLogout={handleLogout}
          onIlanEkle={handleIlanEkle}
          onIlanDetay={handleIlanDetay}
          userId={userId || ''}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header {...headerProps} />
      {successMsg && (
        <div className="bg-green-500 text-white text-center py-3 text-sm font-medium">
          {successMsg}
        </div>
      )}
      <HomePage
        onGoLogin={() => setCurrentPage('login')}
        onIlanDetay={handleIlanDetay}
      />
      <Footer />
    </div>
  );
}
