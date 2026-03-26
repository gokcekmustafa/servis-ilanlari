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

// Kategori yapılandırması
const KATEGORILER = [
  {
    id: 'isim_var_arac' as KategoriType,
    label: 'Araç Arıyorum',
    aciklama: 'Personel, öğrenci veya yük taşımacılığı için araç ilanları',
    icon: '🔍',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    numColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'aracim_var_is' as KategoriType,
    label: 'İş Arıyorum',
    aciklama: 'Aracıyla birlikte iş arayan taşımacı ilanları',
    icon: '🚌',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    numColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'sofor_ariyorum' as KategoriType,
    label: 'Şoför Aranıyor',
    aciklama: 'Firmalar ve araç sahipleri profesyonel şoför arıyor',
    icon: '👤',
    bg: 'bg-green-50',
    border: 'border-green-200',
    numColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    id: 'hostes_ariyorum' as KategoriType,
    label: 'Şoför İş Arıyor',
    aciklama: 'Deneyimli şoförler iş fırsatı arıyor',
    icon: '👷',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    numColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
] as const;

// HOME PAGE COMPONENT - Resmdeki tasarıma göre yeniden yazıldı
function HomePage({ onGoLogin, onIlanDetay }: { onGoLogin: () => void; onIlanDetay: (ilan: Ilan) => void }) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifKategori, setAktifKategori] = useState<KategoriType | null>(null);
  const [selectedSehir, setSelectedSehir] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [siralama, setSiralama] = useState('yeni');
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);
  const [otomatikKapatTimer, setOtomatikKapatTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [gorunumModu, setGorunumModu] = useState<'liste' | 'grid'>('liste');

  useEffect(() => {
    ilanlarYukle();
    setDuyuru(null);
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

  const handleClear = () => {
    setAktifKategori(null);
    setSelectedSehir('');
    setSelectedIlce('');
    setSiralama('yeni');
  };

  const kategoriSayilari = (kategori: KategoriType) => ilanlar.filter(i => i.kategori === kategori).length;

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      if (aktifKategori && ilan.kategori !== aktifKategori) return false;
      if (selectedSehir) {
        const sehirVar = ilan.guzergahlar.some((g) => g.kalkis_il === selectedSehir);
        if (!sehirVar) return false;
      }
      if (selectedIlce) {
        const ilceVar = ilan.guzergahlar.some((g) => g.kalkis_ilce === selectedIlce);
        if (!ilceVar) return false;
      }
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const aktivFiltreVar = !!aktifKategori || !!selectedSehir || !!selectedIlce;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">

        {/* KATEGORİ KARTLARI */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">İlan Kategorileri</h2>
              <p className="text-sm text-gray-500">Toplam {ilanlar.length} aktif ilan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {KATEGORILER.map((kat) => {
              const sayi = kategoriSayilari(kat.id);
              const isSelected = aktifKategori === kat.id;

              return (
                <button
                  key={kat.id}
                  onClick={() => setAktifKategori(isSelected ? null : kat.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${kat.bg} ${
                    isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-100' : `${kat.border} hover:shadow-sm`
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg ${kat.iconBg} flex items-center justify-center text-lg mb-3`}>
                    {kat.icon}
                  </div>
                  <div className={`text-2xl font-bold ${kat.numColor} mb-1`}>{sayi}</div>
                  <div className="text-sm font-semibold text-gray-800 leading-tight mb-1">{kat.label}</div>
                  <div className="text-xs text-gray-500 leading-tight hidden sm:block">{kat.aciklama}</div>
                  <div className="mt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
                    İlanları Gör <span>→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobil Filtre Butonu */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button
            onClick={() => setFiltreAcik(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm"
          >
            <SlidersHorizontal size={15} /> Filtrele
          </button>
          {aktivFiltreVar && (
            <button
              onClick={handleClear}
              className="px-4 flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-semibold text-sm"
            >
              <X size={15} /> Temizle
            </button>
          )}
        </div>

        <div className="flex gap-5">
          {/* SOL: FİLTRELER */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6 shadow-sm">
              <div className="flex items-center gap-1.5 mb-4">
                <SlidersHorizontal size={15} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Filtrele</h3>
              </div>

              {/* Kategori Listesi */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Kategori</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setAktifKategori(null)}
                    className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition ${
                      !aktifKategori ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>Tüm Kategoriler</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${!aktifKategori ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ilanlar.length}
                    </span>
                  </button>
                  {KATEGORILER.map((kat) => {
                    const sayi = kategoriSayilari(kat.id);
                    const isActive = aktifKategori === kat.id;
                    return (
                      <button
                        key={kat.id}
                        onClick={() => setAktifKategori(isActive ? null : kat.id)}
                        className={`w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition ${
                          isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{kat.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {sayi}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Konum */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Konum</label>
                <select
                  value={selectedSehir}
                  onChange={(e) => { setSelectedSehir(e.target.value); setSelectedIlce(''); }}
                  className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                >
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map((sehir) => (
                    <option key={sehir} value={sehir}>{sehir}</option>
                  ))}
                </select>
                {selectedSehir && ilceler.length > 0 && (
                  <select
                    value={selectedIlce}
                    onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full mt-2 px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                  >
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Ek Filtreler başlık (görseldeki gibi) */}
              <div className="border-t border-gray-100 pt-3">
                <button className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-800">
                  <span className="font-semibold text-[11px] uppercase tracking-wide text-gray-500">Ek Filtreler</span>
                  <span className="text-gray-400">∨</span>
                </button>
              </div>

              {aktivFiltreVar && (
                <button
                  onClick={handleClear}
                  className="w-full mt-3 text-sm text-red-500 hover:text-red-700 font-medium py-1.5 transition"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </div>

          {/* SAĞ: ANA İÇERİK */}
          <div className="flex-1 min-w-0">

            {/* SIRALAMA & İLAN SAYISI & GÖRÜNÜM */}
            <div className="mb-4 bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">Aktif İlanlar</span>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filtrelenmisIlanlar.length} ilan bulundu
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={siralama}
                  onChange={(e) => setSiralama(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium text-gray-700"
                >
                  <option value="yeni">↑ En Yeni</option>
                  <option value="eski">↓ En Eski</option>
                </select>
                {/* Liste / Grid geçiş */}
                <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGorunumModu('liste')}
                    className={`p-1.5 transition ${gorunumModu === 'liste' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    title="Liste görünümü"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setGorunumModu('grid')}
                    className={`p-1.5 transition ${gorunumModu === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    title="Izgara görünümü"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* İLAN LİSTESİ */}
            {yukleniyor ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
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
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="text-5xl mb-3">🚌</div>
                <p className="text-base font-bold text-gray-900">Uygun ilan bulunamadı</p>
                <p className="text-sm text-gray-500 mt-1">Filtrelerinizi değiştirerek tekrar deneyin</p>
                {aktivFiltreVar && (
                  <button onClick={handleClear} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
                    Filtreleri temizle
                  </button>
                )}
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
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Filtreleri Ayarla</h3>
              <button onClick={() => setFiltreAcik(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Kategori</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setAktifKategori(null)}
                    className={`w-full text-left flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${!aktifKategori ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>Tüm Kategoriler</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{ilanlar.length}</span>
                  </button>
                  {KATEGORILER.map(kat => (
                    <button
                      key={kat.id}
                      onClick={() => setAktifKategori(aktifKategori === kat.id ? null : kat.id)}
                      className={`w-full text-left flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${aktifKategori === kat.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span>{kat.label}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{kategoriSayilari(kat.id)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Şehir</label>
                <select
                  value={selectedSehir}
                  onChange={(e) => { setSelectedSehir(e.target.value); setSelectedIlce(''); }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map((sehir) => <option key={sehir} value={sehir}>{sehir}</option>)}
                </select>
              </div>
              {selectedSehir && ilceler.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">İlçe</label>
                  <select
                    value={selectedIlce}
                    onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setFiltreAcik(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
                >
                  Uygula
                </button>
                {aktivFiltreVar && (
                  <button
                    onClick={handleClear}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm"
                  >
                    Filtreleri Temizle
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
