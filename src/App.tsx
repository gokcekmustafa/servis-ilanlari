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

const KATEGORILER = [
  {
    id: 'isim_var_arac' as KategoriType,
    label: 'İşim Var Araç Arıyorum',
    aciklama: 'Personel veya öğrenci servisi için araç',
    icon: '🔍',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    numColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    serit: 'bg-blue-500',
  },
  {
    id: 'aracim_var_is' as KategoriType,
    label: 'Aracım Var İş Arıyorum',
    aciklama: 'Aracıyla birlikte iş arayan taşımacılar',
    icon: '🚌',
    bg: 'bg-green-50',
    border: 'border-green-200',
    numColor: 'text-green-600',
    iconBg: 'bg-green-100',
    serit: 'bg-green-500',
  },
  {
    id: 'sofor_ariyorum' as KategoriType,
    label: 'Aracım Var Şoför Arıyorum',
    aciklama: 'Profesyonel şoför arayan firmalar',
    icon: '👤',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    numColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    serit: 'bg-orange-500',
  },
  {
    id: 'hostes_ariyorum' as KategoriType,
    label: 'Aracım Var Hostes Arıyorum',
    aciklama: 'Servis hostesi arayan ilanlar',
    icon: '👩',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    numColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    serit: 'bg-purple-500',
  },
  {
    id: 'soforum_is' as KategoriType,
    label: 'Şoförüm İş Arıyorum',
    aciklama: 'Deneyimli şoförler iş arıyor',
    icon: '🚗',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    numColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    serit: 'bg-yellow-500',
  },
  {
    id: 'hostesim_is' as KategoriType,
    label: 'Hostesim İş Arıyorum',
    aciklama: 'Hostes iş ilanları',
    icon: '💼',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    numColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
    serit: 'bg-pink-500',
  },
  {
    id: 'plaka_satiyorum' as KategoriType,
    label: 'Plakamı Satıyorum',
    aciklama: 'Satılık servis plaka ilanları',
    icon: '🪧',
    bg: 'bg-red-50',
    border: 'border-red-200',
    numColor: 'text-red-600',
    iconBg: 'bg-red-100',
    serit: 'bg-red-500',
  },
  {
    id: 'aracimi_satiyorum' as KategoriType,
    label: 'Aracımı Satıyorum',
    aciklama: 'Satılık servis araçları',
    icon: '🚐',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    numColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
    serit: 'bg-teal-500',
  },
] as const;

// Her 8 ilandan sonra gösterilecek reklam kartı
function ListeReklamKarti({ reklam }: { reklam: any }) {
  return (
    <div
      onClick={() => reklam.link_url && window.open(reklam.link_url, '_blank')}
      className={`relative overflow-hidden rounded border border-slate-200 bg-white ${reklam.link_url ? 'cursor-pointer' : ''}`}
    >
      {reklam.resim_url ? (
        <img
          src={reklam.resim_url}
          alt={reklam.baslik || 'Reklam'}
          className="w-full h-28 sm:h-36 object-cover"
        />
      ) : (
        <div className="w-full h-28 sm:h-36 bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-slate-300 text-xs">Reklam Alanı</span>
        </div>
      )}
      <span className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">
        Reklam
      </span>
    </div>
  );
}

// HOME PAGE COMPONENT
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
  const [listeReklam, setListeReklam] = useState<any>(null);
  const [reklamSiklik, setReklamSiklik] = useState(8);

  useEffect(() => {
    ilanlarYukle();
    setDuyuru(null);
    listeReklamYukle();
    reklamSiklikYukle();
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

  const listeReklamYukle = async () => {
    const { data } = await supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .eq('konum', 'liste')
      .limit(1)
      .single();
    if (data) setListeReklam(data);
  };

  const reklamSiklikYukle = async () => {
    const { data } = await supabase
      .from('ayarlar')
      .select('deger')
      .eq('anahtar', 'reklam_siklik')
      .single();
    if (data?.deger) setReklamSiklik(Number(data.deger));
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

  const kategoriSayisi = (id: KategoriType) => ilanlar.filter(i => i.kategori === id).length;

  const filtrelenmisIlanlar = ilanlar
    .filter(ilan => {
      if (aktifKategori && ilan.kategori !== aktifKategori) return false;
      if (selectedSehir && !ilan.guzergahlar.some(g => g.kalkis_il === selectedSehir)) return false;
      if (selectedIlce && !ilan.guzergahlar.some(g => g.kalkis_ilce === selectedIlce)) return false;
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const aktivFiltreVar = !!aktifKategori || !!selectedSehir || !!selectedIlce;

  // İlan listesini her 8 elemandan sonra reklam ekleyerek oluştur
  const ilanListesiWithAds = () => {
    const result: React.ReactNode[] = [];
    filtrelenmisIlanlar.forEach((ilan, index) => {
      result.push(
        <IlanCard key={ilan.id} ilan={ilan} onDetay={() => onIlanDetay(ilan)} />
      );
      // Her 8 ilandan sonra (ve son eleman değilse) reklam ekle
      if ((index + 1) % reklamSiklik === 5 && index < filtrelenmisIlanlar.length - 1) {
        result.push(
          <ListeReklamKarti key={`reklam-${index}`} reklam={listeReklam || {}} />
        );
      }
    });
    return result;
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen">
  <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">

        {/* KATEGORİ KARTLARI */}
        <div className="mb-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 bg-[#f7971e]">
              <h2 className="text-sm font-bold text-white tracking-wide">İlan Kategorileri</h2>
              <span className="text-xs text-white/80 font-medium">{ilanlar.length} aktif ilan</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:gap-3 sm:p-3">
              {KATEGORILER.map((kat) => {
                const sayi = kategoriSayisi(kat.id);
                const isSelected = aktifKategori === kat.id;
                return (
                  <button
  key={kat.id}
  onClick={() => setAktifKategori(isSelected ? null : kat.id)}
  className={
    "flex flex-col items-center gap-1.5 px-2 py-1.5 sm:py-2.5 rounded-lg text-center transition-all " +
    (isSelected
      ? "border-2 border-[#f7971e] bg-orange-50 shadow-sm shadow-orange-100"
      : "border-2 border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50")
  }
>
  {/* İkon — w-10 h-10, text-[22px] */}
  <div className={"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 " + kat.iconBg}
    style={{ fontSize: '22px' }}>
    {kat.icon}
  </div>
  {/* Başlık — font büyütüldü, koyu renk */}
  <div className="text-[11.5px] font-bold text-gray-800 leading-snug">{kat.label}</div>
  {/* Sayı badge */}
  <div className={"inline-flex items-center justify-center text-[11px] font-bold px-2.5 py-0.5 rounded-full " +
    (isSelected ? "bg-[#f7971e] text-white" : kat.iconBg + " " + kat.numColor)}>
    {sayi}
  </div>
</button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobil Filtre Butonu */}
        <div className="lg:hidden mb-3 flex gap-2">
          <button
            onClick={() => setFiltreAcik(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:border-[#f7971e] text-gray-700 py-2 rounded text-sm font-medium transition"
          >
            <SlidersHorizontal size={14} /> Filtrele
          </button>
          {aktivFiltreVar && (
            <button onClick={handleClear} className="px-3 flex items-center gap-1 bg-white border border-gray-300 hover:border-red-300 text-gray-600 rounded transition text-sm">
              <X size={14} /> Temizle
            </button>
          )}
        </div>

        <div className="flex gap-4">
          {/* SOL: FİLTRELER */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded overflow-hidden sticky top-20">
              <div className="px-3 py-2.5 bg-[#f7971e] flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-white" />
                <span className="text-sm font-bold text-white">Filtrele</span>
              </div>

              <div className="border-b border-gray-100">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Kategori</span>
                </div>
                <button
                  onClick={() => setAktifKategori(null)}
                  className={"w-full flex items-center justify-between px-3 py-2 text-xs transition hover:bg-orange-50 " + (!aktifKategori ? "text-[#f7971e] font-semibold bg-orange-50 border-l-4 border-[#f7971e]" : "text-gray-600")}
                >
                  <span>Tüm Kategoriler</span>
                  <span className={"text-[10px] px-1.5 py-0.5 rounded " + (!aktifKategori ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500")}>{ilanlar.length}</span>
                </button>
                {KATEGORILER.map(kat => {
                  const sayi = kategoriSayisi(kat.id);
                  const isActive = aktifKategori === kat.id;
                  return (
                    <button
                      key={kat.id}
                      onClick={() => setAktifKategori(isActive ? null : kat.id)}
                      className={"w-full flex items-center justify-between px-3 py-2 text-xs transition hover:bg-orange-50 border-t border-gray-50 " + (isActive ? "text-[#f7971e] font-semibold bg-orange-50 border-l-4 border-[#f7971e]" : "text-gray-600")}
                    >
                      <span className="flex items-center gap-1.5"><span>{kat.icon}</span>{kat.label}</span>
                      <span className={"text-[10px] px-1.5 py-0.5 rounded " + (isActive ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500")}>{sayi}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Konum</span>
                </div>
                <div className="p-3 space-y-2">
                  <select
                    value={selectedSehir}
                    onChange={(e) => { setSelectedSehir(e.target.value); setSelectedIlce(''); }}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                  >
                    <option value="">Tüm Şehirler</option>
                    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {selectedSehir && ilceler.length > 0 && (
                    <select
                      value={selectedIlce}
                      onChange={(e) => setSelectedIlce(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                    >
                      <option value="">Tüm İlçeler</option>
                      {ilceler.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {aktivFiltreVar && (
                <div className="p-3 border-t border-gray-100">
                  <button onClick={handleClear} className="w-full text-xs text-red-500 hover:text-red-700 font-medium py-1.5 border border-red-200 hover:border-red-300 rounded transition">
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SAĞ: İLAN LİSTESİ */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded px-3 py-2 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {aktifKategori && (
                  <span className="flex items-center gap-1 text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded font-medium">
                    {KATEGORILER.find(k => k.id === aktifKategori)?.label}
                    <button onClick={() => setAktifKategori(null)} className="ml-1 hover:text-orange-900"><X size={11} /></button>
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-800">{filtrelenmisIlanlar.length}</span> ilan bulundu
                </span>
              </div>
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
              >
                <option value="yeni">En Yeni</option>
                <option value="eski">En Eski</option>
              </select>
            </div>

            {yukleniyor ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white border border-gray-200 rounded p-4 animate-pulse">
                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="space-y-2">
                {ilanListesiWithAds()}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm font-semibold text-gray-700">Uygun ilan bulunamadı</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Filtrelerinizi değiştirerek tekrar deneyin</p>
                {aktivFiltreVar && (
                  <button onClick={handleClear} className="text-xs text-[#f7971e] hover:underline font-medium">Filtreleri temizle</button>
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
          <div className="bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#f7971e] px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Filtrele</h3>
              <button onClick={() => setFiltreAcik(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Kategori</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setAktifKategori(null)}
                    className={"w-full text-left flex justify-between items-center px-3 py-2 rounded text-xs font-medium transition border " + (!aktifKategori ? "bg-orange-50 text-[#f7971e] border-orange-200" : "text-gray-600 hover:bg-gray-50 border-transparent")}
                  >
                    <span>Tüm Kategoriler</span>
                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">{ilanlar.length}</span>
                  </button>
                  {KATEGORILER.map(kat => (
                    <button
                      key={kat.id}
                      onClick={() => setAktifKategori(aktifKategori === kat.id ? null : kat.id)}
                      className={"w-full text-left flex justify-between items-center px-3 py-2 rounded text-xs font-medium transition border " + (aktifKategori === kat.id ? "bg-orange-50 text-[#f7971e] border-orange-200" : "text-gray-600 hover:bg-gray-50 border-transparent")}
                    >
                      <span className="flex items-center gap-1.5"><span>{kat.icon}</span>{kat.label}</span>
                      <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">{kategoriSayisi(kat.id)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Şehir</p>
                <select value={selectedSehir} onChange={(e) => { setSelectedSehir(e.target.value); setSelectedIlce(''); }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {selectedSehir && ilceler.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">İlçe</p>
                  <select value={selectedIlce} onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              )}
              <div>
  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Varış Şehri</p>
  <select
    value={selectedVaris}
    onChange={(e) => setSelectedVaris(e.target.value)}
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white"
  >
    <option value="">Tümü</option>
    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
  </select>
</div>
              <div className="pt-2 space-y-2">
                <button onClick={() => setFiltreAcik(false)} className="w-full bg-[#f7971e] hover:bg-[#e8881a] text-white font-bold py-2.5 rounded transition text-sm">Uygula</button>
                {aktivFiltreVar && (
                  <button onClick={handleClear} className="w-full bg-gray-100 text-gray-600 py-2 rounded text-sm font-medium transition hover:bg-gray-200">Temizle</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUYURU POPUP */}
      {popupAcik && duyuru && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
          onClick={() => { setPopupAcik(false); if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {duyuru.resim_url && <img src={duyuru.resim_url} alt={duyuru.baslik || 'Duyuru'} className="w-full h-48 object-cover" />}
            <div className="p-5">
              {duyuru.baslik && <h2 className="text-base font-bold text-gray-900 mb-2">{duyuru.baslik}</h2>}
              {duyuru.mesaj && <p className="text-sm text-gray-600 mb-4">{duyuru.mesaj}</p>}
              <button onClick={() => { setPopupAcik(false); if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer); }}
                className="w-full bg-[#f7971e] hover:bg-[#e8881a] text-white py-2.5 rounded font-bold transition">Kapat</button>
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
  if (currentPage === 'ilan-ekle') return withLayout(<IlanEklePage
    userId={userId || ''}
    onGoBack={() => setCurrentPage('home')}
    onSuccess={() => setCurrentPage('home')}
  />);
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
