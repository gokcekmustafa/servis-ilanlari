import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
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
import IlanCard from './components/IlanCard';
import { Ilan, KategoriType } from './types';
import { mevcutKullanici, cikisYap } from './lib/auth';
import { ilanlariGetir } from './lib/ilanlar';
import { supabase } from './lib/supabase';
import { SlidersHorizontal, X } from 'lucide-react';

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

// HOME PAGE COMPONENT - İçine entegre edildi
function HomePage({ onGoLogin, onIlanDetay }: { onGoLogin: () => void; onIlanDetay: (ilan: Ilan) => void }) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);
  const [aktifKategori, setAktifKategori] = useState<KategoriType | null>(null);
  const [selectedSehir, setSelectedSehir] = useState('');
  const [aktifSehir, setAktifSehir] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [aktifIlce, setAktifIlce] = useState('');
  const [siralama, setSiralama] = useState('yeni');
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);
  const [otomatikKapatTimer, setOtomatikKapatTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filtreAcik, setFiltreAcik] = useState(false);

  useEffect(() => {
    ilanlarYukle();
    reklamlariYukle();
    duyuruYukle();
  }, []);

  useEffect(() => {
    document.body.style.overflow = filtreAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtreAcik]);

  const ilanlarYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await ilanlariGetir();
    if (!error && data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const reklamlariYukle = async () => {
    const { data } = await supabase.from('reklamlar').select('*').eq('aktif', true).order('id', { ascending: false });
    if (data) setReklamlar(data);
  };

  const duyuruYukle = async () => {
    const { data } = await supabase.from('duyurular').select('*').eq('aktif', true).limit(1).single();
    if (data) {
      const kapatildi = sessionStorage.getItem('duyuru_kapatildi_' + data.id);
      if (!kapatildi) {
        setDuyuru(data);
        setTimeout(() => setPopupAcik(true), (data.saniye || 2) * 1000);
      }
    }
  };

  useEffect(() => {
    if (!popupAcik || !duyuru) return;
    const sure = (duyuru.goster_sure || 8) * 1000;
    const timer = setTimeout(() => {
      setPopupAcik(false);
      sessionStorage.setItem('duyuru_kapatildi_' + duyuru.id, '1');
    }, sure);
    setOtomatikKapatTimer(timer);
    return () => clearTimeout(timer);
  }, [popupAcik, duyuru]);

  const sehirler = Array.from(new Set(
    ilanlar.flatMap(i => i.guzergahlar.map(g => g.kalkis_il).filter(Boolean))
  )).sort();

  const ilceler = selectedSehir 
    ? Array.from(new Set(
        ilanlar.flatMap(i => i.guzergahlar.filter(g => g.kalkis_il === selectedSehir).map(g => g.kalkis_ilce)).filter(Boolean)
      )).sort()
    : [];

  const handleFilter = () => {
    setAktifKategori(selectedKategori);
    setAktifSehir(selectedSehir);
    setAktifIlce(selectedIlce);
    setFiltreAcik(false);
  };

  const handleClear = () => {
    setSelectedKategori(null);
    setAktifKategori(null);
    setSelectedSehir('');
    setAktifSehir('');
    setSelectedIlce('');
    setAktifIlce('');
    setSiralama('yeni');
  };

  const kategoriSayilari = (kategori: KategoriType) => ilanlar.filter(i => i.kategori === kategori).length;

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      if (aktifKategori && ilan.kategori !== aktifKategori) return false;
      if (aktifSehir) {
        const sehirVar = ilan.guzergahlar.some((g) => g.kalkis_il === aktifSehir);
        if (!sehirVar) return false;
      }
      if (aktifIlce) {
        const ilceVar = ilan.guzergahlar.some((g) => g.kalkis_ilce === aktifIlce);
        if (!ilceVar) return false;
      }
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const aktivFiltreVar = !!aktifKategori || !!aktifSehir || !!aktifIlce;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        
        {/* KATEGORİ KARTLARI */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">İlan Kategorileri</h2>
          <p className="text-sm text-gray-500 mb-4">Toplam {ilanlar.length} aktif ilan</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {([
              { id: 'isim_var_arac' as KategoriType, label: 'İşim Var\nAraç Arıyorum', bg: 'bg-blue-50', border: 'border-blue-300', num: 'text-blue-700' },
              { id: 'aracim_var_is' as KategoriType, label: 'Aracım Var\nİş Arıyorum', bg: 'bg-yellow-50', border: 'border-yellow-300', num: 'text-yellow-700' },
              { id: 'sofor_ariyorum' as KategoriType, label: 'Şoför\nArıyorum', bg: 'bg-green-50', border: 'border-green-300', num: 'text-green-700' },
              { id: 'hostes_ariyorum' as KategoriType, label: 'Hostes\nArıyorum', bg: 'bg-purple-50', border: 'border-purple-300', num: 'text-purple-700' },
            ] as const).map((kat) => {
              const sayi = kategoriSayilari(kat.id);
              const isSelected = selectedKategori === kat.id;
              
              return (
                <button
                  key={kat.id}
                  onClick={() => setSelectedKategori(isSelected ? null : kat.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${kat.bg} ${isSelected ? `border-blue-500 shadow-lg` : `${kat.border} hover:border-blue-400`}`}
                  disabled={sayi === 0}
                  style={{ opacity: sayi === 0 ? 0.5 : 1 }}
                >
                  <div className={`text-3xl font-bold ${kat.num} mb-1`}>{sayi}</div>
                  <div className="text-xs font-bold text-gray-700 leading-tight whitespace-pre-line">{kat.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobil Filtre Butonu */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button
            onClick={() => setFiltreAcik(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm transition"
          >
            <SlidersHorizontal size={16} /> Filtrele
          </button>
          {aktivFiltreVar && (
            <button
              onClick={handleClear}
              className="px-4 flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-bold text-sm"
            >
              <X size={16} /> Temizle
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* SOL: FİLTRELER */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Filtrele</h3>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-800 mb-2">ŞEHİR</label>
                <select
                  value={selectedSehir}
                  onChange={(e) => {
                    setSelectedSehir(e.target.value);
                    setSelectedIlce('');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map((sehir) => (
                    <option key={sehir} value={sehir}>{sehir}</option>
                  ))}
                </select>
              </div>

              {selectedSehir && ilceler.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-800 mb-2">İLÇE</label>
                  <select
                    value={selectedIlce}
                    onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleFilter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm"
              >
                Aramayı Daralt
              </button>
            </div>
          </div>

          {/* SAĞ: ANA İÇERİK */}
          <div className="flex-1 min-w-0">
            
            {/* AKTİF FİLTRELER */}
            {aktivFiltreVar && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 flex-wrap">
                {aktifKategori && (
                  <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
                    <span className="text-gray-800 font-medium">{aktifKategori}</span>
                    <button
                      onClick={() => setAktifKategori(null)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {(aktifSehir || aktifIlce) && (
                  <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
                    <span className="text-gray-800 font-medium">{aktifIlce || aktifSehir}</span>
                    <button
                      onClick={() => {
                        setAktifSehir('');
                        setAktifIlce('');
                      }}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SIRALAMA & İLAN SAYISI */}
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                İlanlar: <span className="text-blue-600">{filtrelenmisIlanlar.length}</span>
              </span>
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                <option value="yeni">Önce En Yeni</option>
                <option value="eski">Önce En Eski</option>
              </select>
            </div>

            {/* İLAN LİSTESİ */}
            {yukleniyor ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="space-y-3">
                {filtrelenmisIlanlar.map((ilan) => (
                  <IlanCard key={ilan.id} ilan={ilan} onDetay={() => onIlanDetay(ilan)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                <div className="text-6xl mb-4">🚌</div>
                <p className="text-lg font-bold text-gray-900">Uygun ilan bulunamadı</p>
                <p className="text-sm text-gray-600 mt-2">Filtrelerinizi değiştirerek tekrar deneyin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBİL FİLTRE DRAWER */}
      {filtreAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setFiltreAcik(false)} />
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Filtreleri Ayarla</h3>
              <button onClick={() => setFiltreAcik(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">ŞEHİR</label>
                <select
                  value={selectedSehir}
                  onChange={(e) => {
                    setSelectedSehir(e.target.value);
                    setSelectedIlce('');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map((sehir) => (
                    <option key={sehir} value={sehir}>{sehir}</option>
                  ))}
                </select>
              </div>

              {selectedSehir && ilceler.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">İLÇE</label>
                  <select
                    value={selectedIlce}
                    onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <button
                  onClick={handleFilter}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Aramayı Daralt
                </button>
                {aktivFiltreVar && (
                  <button
                    onClick={handleClear}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUYURU POPUP */}
      {popupAcik && duyuru && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
          onClick={() => {
            setPopupAcik(false);
            if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer);
          }}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md relative shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {duyuru.resim_url && (
              <img src={duyuru.resim_url} alt={duyuru.baslik || 'Duyuru'} className="w-full h-48 sm:h-56 object-cover" />
            )}
            <div className="p-5 sm:p-6">
              {duyuru.baslik && <h2 className="text-lg font-bold text-gray-900 mb-2">{duyuru.baslik}</h2>}
              {duyuru.mesaj && <p className="text-sm text-gray-600 leading-relaxed mb-4">{duyuru.mesaj}</p>}
              <button 
                onClick={() => {
                  setPopupAcik(false);
                  if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    sessionStorage.clear();
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

  if (currentPage === 'login') return <LoginPage onLogin={handleLogin} onGoRegister={() => setCurrentPage('register')} onGoHome={() => setCurrentPage('home')} />;
  if (currentPage === 'register') return <RegisterPage onRegister={handleLogin} onGoLogin={() => setCurrentPage('login')} onGoHome={() => setCurrentPage('home')} />;

  const withLayout = (content: React.ReactNode) => (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header {...headerProps} />
      {content}
      <Footer {...footerProps} />
    </div>
  );

  if (currentPage === 'detay' && selectedIlan) return withLayout(<IlanDetayPage ilan={selectedIlan} onGoBack={goBack} onGoLogin={() => setCurrentPage('login')} isLoggedIn={isLoggedIn} />);
  if (currentPage === 'ilan-ekle') return withLayout(<IlanEklePage onGoBack={goBack} onSuccess={handleIlanSuccess} userId={userId || ''} />);
  if (currentPage === 'panel') return withLayout(<PanelPage onLogout={handleLogout} onIlanEkle={handleIlanEkle} onIlanDetay={handleIlanDetay} userId={userId || ''} />);
  if (currentPage === 'admin') {
    if (!isAdmin) { setCurrentPage('home'); return null; }
    return withLayout(<AdminPage onLogout={handleLogout} onIlanDetay={handleIlanDetay} isSuperAdmin={isSuperAdmin} yetkiler={yetkiler} />);
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
