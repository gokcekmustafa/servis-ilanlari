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

export type Yetkiler = {
  ilan_onay?: boolean;
  kullanici_yonetimi?: boolean;
  destek_yonetimi?: boolean;
  reklam_yonetimi?: boolean;
  duyuru_yonetimi?: boolean;
  ilan_sil?: boolean;
};

const SUPERADMIN_TELEFON = '05369500280';

const validPages: Page[] = [
  'home', 'login', 'register', 'detay', 'ilan-ekle',
  'panel', 'admin', 'hakkimizda', 'nasil-isliyor',
  'sss', 'iletisim', 'kullanim-kosullari',
  'kisisel-veriler', 'kunye',
];

export default function App() {
  const [currentPage, setCurrentPageState] = useState<Page>('home');
  const [prevPage, setPrevPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [yetkiler, setYetkiler] = useState<Yetkiler>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedIlan, setSelectedIlan] = useState<Ilan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  const setCurrentPage = (page: Page) => {
    setPrevPage(currentPage);
    setCurrentPageState(page);
    window.history.pushState({ page }, '', page === 'home' ? '/' : `/${page}`);
    window.scrollTo(0, 0);
  };

  const kullaniciyiIsle = (user: any) => {
    if (!user) return;
    setIsLoggedIn(true);
    setUserId(user.id);

    const temiz = user.phone_number?.replace(/\s/g, '').replace(/[^0-9]/g, '');
    const superTemiz = SUPERADMIN_TELEFON.replace(/\s/g, '').replace(/[^0-9]/g, '');
    const superAdmin = temiz === superTemiz || user.type === 'superadmin';
    const adminKullanici = superAdmin || user.type === 'admin';

    setIsSuperAdmin(superAdmin);
    setIsAdmin(adminKullanici);

    if (superAdmin) {
      setYetkiler({
        ilan_onay: true,
        kullanici_yonetimi: true,
        destek_yonetimi: true,
        reklam_yonetimi: true,
        duyuru_yonetimi: true,
        ilan_sil: true,
      });
    } else if (user.type === 'admin') {
      if (user.aktif === false) {
        setIsAdmin(false);
        return;
      }
      setYetkiler(user.yetkiler || {});
    }
  };

  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    if (path && validPages.includes(path as Page)) {
      setCurrentPageState(path as Page);
    }
    const user = mevcutKullanici();
    if (user) kullaniciyiIsle(user);
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '');
      if (!path || path === 'home') {
        setCurrentPageState('home');
      } else if (validPages.includes(path as Page)) {
        setCurrentPageState(path as Page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogin = () => {
    const user = mevcutKullanici();
    if (user) {
      kullaniciyiIsle(user);

      const temiz = user.phone_number?.replace(/\s/g, '').replace(/[^0-9]/g, '');
      const superTemiz = SUPERADMIN_TELEFON.replace(/\s/g, '').replace(/[^0-9]/g, '');
      const superAdmin = temiz === superTemiz || user.type === 'superadmin';
      const adminKullanici = superAdmin || (user.type === 'admin' && user.aktif !== false);

      if (adminKullanici) {
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
    setIsSuperAdmin(false);
    setYetkiler({});
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
    setSuccessMsg('İlanınız başarıyla yayınlandı!');
    setCurrentPage('home');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const goBack = () => {
    setCurrentPage(prevPage || 'home');
  };

  const headerProps = {
    isLoggedIn,
    isAdmin,
    onGoLogin: () => setCurrentPage('login'),
    onLogout: handleLogout,
    onIlanEkle: handleIlanEkle,
    onGoPanel: () => isAdmin ? setCurrentPage('admin') : setCurrentPage('panel'),
    onNavigate: (page: any) => setCurrentPage(page),
  };

  const footerProps = {
    onNavigate: (page: any) => setCurrentPage(page),
  };

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
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
        onGoBack={goBack}
        onGoLogin={() => setCurrentPage('login')}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  if (currentPage === 'ilan-ekle') {
    return withLayout(
      <IlanEklePage
        onGoBack={goBack}
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
    if (!isAdmin) {
      setCurrentPage('home');
      return null;
    }
    return withLayout(
      <AdminPage
        onLogout={handleLogout}
        onIlanDetay={handleIlanDetay}
        isSuperAdmin={isSuperAdmin}
        yetkiler={yetkiler}
      />
    );
  }

  if (currentPage === 'hakkimizda') return withLayout(<HakkimizdaPage onGoBack={goBack} />);
  if (currentPage === 'nasil-isliyor') return withLayout(<NasilIsliyorPage onGoBack={goBack} />);
  if (currentPage === 'sss') return withLayout(<SSSPage onGoBack={goBack} />);
  if (currentPage === 'iletisim') return withLayout(<IletisimPage onGoBack={goBack} />);
  if (currentPage === 'kullanim-kosullari') return withLayout(<KullanimKosullariPage onGoBack={goBack} />);
  if (currentPage === 'kisisel-veriler') return withLayout(<KisiselVerilerPage onGoBack={goBack} />);
  if (currentPage === 'kunye') return withLayout(<KunyePage onGoBack={goBack} />);

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
