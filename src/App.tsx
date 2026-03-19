import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import IlanDetayPage from './pages/IlanDetayPage';
import IlanEklePage from './pages/IlanEklePage';
import PanelPage from './pages/PanelPage';
import AdminPage from './pages/AdminPage';
import HakkimizdaPage from './pages/HakkimizdaPage';
import NasilIsliyorPage from './pages/NasilIsliyorPage';
import SSSPage from './pages/SSSPage';
import IletisimPage from './pages/IletisimPage';
import KullanimKosullariPage from './pages/KullanimKosullariPage';
import KisiselVerilerPage from './pages/KisiselVerilerPage';
import KunyePage from './pages/KunyePage';
import { Ilan } from './types';
import { mevcutKullanici, cikisYap } from './lib/auth';

type Page =
  | 'home' | 'login' | 'register' | 'detay' | 'ilan-ekle'
  | 'panel' | 'admin' | 'hakkimizda' | 'nasil-isliyor'
  | 'sss' | 'iletisim' | 'kullanim-kosullari'
  | 'kisisel-veriler' | 'kunye';

const ADMIN_TELEFON = '05369500280';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedIlan, setSelectedIlan] = useState<Ilan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const user = mevcutKullanici();
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.id);
      const temiz = user.phone_number?.replace(/\s/g, '').replace(/[^0-9]/g, '');
      const adminTemiz = ADMIN_TELEFON.replace(/\s/g, '').replace(/[^0-9]/g, '');
      if (temiz === adminTemiz) setIsAdmin(true);
    }
    setYukleniyor(false);
  }, []);

  const handleLogin = () => {
    const user = mevcutKullanici();
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.id);
      const temiz = user.phone_number?.replace(/\s/g, '').replace(/[^0-9]/g, '');
      const adminTemiz = ADMIN_TELEFON.replace(/\s/g, '').replace(/[^0-9]/g, '');
      if (temiz === adminTemiz) {
        setIsAdmin(true);
        setCurrentPage('admin');
        return;
      }
    }
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await cikisYap();
    setIsLoggedIn(false);
    setIsAdmin(false);
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
    isAdmin,
    onGoLogin: () => setCurrentPage('login'),
    onLogout: handleLogout,
    onIlanEkle: handleIlanEkle,
    onGoPanel: () => isAdmin ? setCurrentPage('admin') : setCurrentPage('panel'),
    onNavigate: (page: Page) => setCurrentPage(page),
  };

  const footerProps = {
    onNavigate: (page: Page) => setCurrentPage(page),
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

  const withLayout = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header {...headerProps} />
      {content}
      <Footer {...footerProps} />
    </div>
  );

  if (currentPage === 'detay' && selectedIlan) {
    return withLayout(
      <IlanDetayPage
        ilan={selectedIlan}
        onGoBack={() => setCurrentPage(isAdmin ? 'admin' : 'home')}
        onGoLogin={() => setCurrentPage('login')}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  if (currentPage === 'ilan-ekle') {
    return withLayout(
      <IlanEklePage
        onGoBack={() => setCurrentPage('home')}
        onSuccess={handleIlanSuccess}
        userId={userId || ''}
      />
    );
  }

  if (currentPage === 'panel') {
    return withLayout(
      <PanelPage
        onLogout={handleLogout}
        onIlanEkle={handleIlanEkle}
        onIlanDetay={handleIlanDetay}
        userId={userId || ''}
      />
    );
  }

  if (currentPage === 'admin') {
    return withLayout(
      <AdminPage
        onLogout={handleLogout}
        onIlanDetay={handleIlanDetay}
      />
    );
  }

  if (currentPage === 'hakkimizda') {
    return withLayout(<HakkimizdaPage onGoBack={() => setCurrentPage('home')} />);
  }

  if (currentPage === 'nasil-isliyor') {
    return withLayout(<NasilIsliyorPage onGoBack={() => setCurrentPage('home')} />);
  }

  if (currentPage === 'sss') {
    return withLayout(<SSSPage onGoBack={() => setCurrentPage('home')} />);
  }

  if (currentPage === 'iletisim') {
    return withLayout(<IletisimPage onGoBack={() => setCurrentPage('home')} />);
  }

  if (currentPage === 'kullanim-kosullari') {
    return withLayout(<KullanimKosullariPage onGoBack={() => setCurrentPage('home')} />);
  }

  if (currentPage === 'kisisel-veriler') {
    return withLayout(<KisiselVerilerPage onGoBack={() => setCurrentPage('home')} />);
  }

  if (currentPage === 'kunye') {
    return withLayout(<KunyePage onGoBack={() => setCurrentPage('home')} />);
  }

  return withLayout(
    <>
      {successMsg && (
        <div className="bg-green-500 text-white text-center py-3 text-sm font-medium">
          {successMsg}
        </div>
      )}
      <HomePage
        onGoLogin={() => setCurrentPage('login')}
        onIlanDetay={handleIlanDetay}
      />
    </>
  );
}
