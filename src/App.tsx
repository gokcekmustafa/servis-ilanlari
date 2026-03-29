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
import { mevcutKullanici, cikisYap, girisYap } from './lib/auth';
import { ilanlariGetir } from './lib/ilanlar';
import { supabase } from './lib/supabase';
import { SlidersHorizontal, X } from 'lucide-react';

function ReklamBanner({ konum }: { konum: 'kenar_sol' | 'kenar_sag' }) {
  const [reklam, setReklam] = React.useState<any>(null);

  React.useEffect(() => {
    supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .eq('konum', konum)
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setReklam(data); });
  }, [konum]);

  const taraf = konum === 'kenar_sol' ? 'left' : 'right';

  return (
    <div
      className="hidden xl:block fixed z-0"  // z-0 yaptık
      style={{
        [taraf]: 0,
        top: '10px',
        bottom: 0,
        width: 'calc((98vw - 1024px) / 2)',
      }}
    >
      <div
        onClick={() => reklam?.link_url && window.open(reklam.link_url, '_blank')}
        className={`w-full h-full overflow-hidden bg-white border-gray-200 ${taraf === 'left' ? 'border-r' : 'border-l'} ${reklam?.link_url ? 'cursor-pointer' : ''}`}
      >
        {reklam?.resim_url ? (
          <img
            src={reklam.resim_url}
            alt={reklam.baslik || 'Reklam'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
            <span className="text-gray-200 text-4xl">📢</span>
            <span className="text-gray-300 text-xs text-center px-3 leading-tight">Reklam Alanı</span>
          </div>
        )}
      </div>
    </div>
  );
}

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
          className="w-full h-28 sm:h-36 object-contain"
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

// INLINE GİRİŞ ÇUBUĞU
function InlineGiris({ onLogin, onGoRegister }: { onLogin: () => void; onGoRegister: () => void }) {
  const [telefon, setTelefon] = React.useState('');
  const [sifre, setSifre] = React.useState('');
  const [goster, setGoster] = React.useState(false);
  const [hata, setHata] = React.useState('');
  const [yukleniyor, setYukleniyor] = React.useState(false);
  const [sifrePopup, setSifrePopup] = React.useState(false);
  const [popupTelefon, setPopupTelefon] = React.useState('');
  const [popupGonderildi, setPopupGonderildi] = React.useState(false);

   const handleLogin = async () => {
    if (!telefon || !sifre) { setHata('Telefon ve şifre boş bırakılamaz.'); return; }
    setYukleniyor(true);
    setHata('');
     const { error } = await girisYap(telefon, sifre);
    setYukleniyor(false);
    if (error) { setHata('Telefon veya şifre hatalı.'); return; }
    onLogin();
  };

  return (
    <div className="px-3 py-2">
      {hata && <p className="text-red-500 text-[11px] mb-1.5">{hata}</p>}

      {/* Masaüstü: tek satır */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1">
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2 border-r border-gray-200 whitespace-nowrap">GSM</span>
          <input
            type="tel"
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
            placeholder="GSM numaranızı yazın"
            className="text-xs px-3 py-2 flex-1 min-w-0 focus:outline-none text-gray-700"
          />
          {/* ŞİFREMİ UNUTTUM POPUP */}
{sifrePopup && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    onClick={() => { setSifrePopup(false); setPopupGonderildi(false); setPopupTelefon(''); }}
  >
    <div
      className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-[#f7971e] px-5 py-3">
        <h3 className="text-white font-bold text-sm">Şifremi Unuttum</h3>
      </div>
      <div className="p-5">
        {popupGonderildi ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Talebiniz alındı!</p>
            <p className="text-xs text-gray-500">En kısa sürede sizi arayacağız.</p>
            <button
              onClick={() => { setSifrePopup(false); setPopupGonderildi(false); setPopupTelefon(''); }}
              className="mt-4 bg-[#f7971e] text-white text-xs font-bold px-6 py-2 rounded-lg"
            >
              Tamam
            </button>
            {sifrePopup && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    onClick={() => { setSifrePopup(false); setPopupGonderildi(false); setPopupTelefon(''); }}
  >
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="bg-[#f7971e] px-5 py-3">
        <h3 className="text-white font-bold text-sm">Şifremi Unuttum</h3>
      </div>
      <div className="p-5">
        {popupGonderildi ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Talebiniz alındı!</p>
            <p className="text-xs text-gray-500">En kısa sürede sizi arayacağız.</p>
            <button onClick={() => { setSifrePopup(false); setPopupGonderildi(false); setPopupTelefon(''); }}
              className="mt-4 bg-[#f7971e] text-white text-xs font-bold px-6 py-2 rounded-lg">
              Tamam
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-4">Telefon numaranızı girin, sizi arayarak şifrenizi sıfırlamamıza yardımcı olalım.</p>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-3">
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2.5 border-r border-gray-200">GSM</span>
              <input type="tel" value={popupTelefon} onChange={e => setPopupTelefon(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="text-xs px-3 py-2.5 flex-1 focus:outline-none text-gray-700" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setSifrePopup(false); setPopupTelefon(''); }}
                className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
                İptal
              </button>
              <button onClick={async () => {
  if (!popupTelefon) return;
  await supabase.from('destek').insert({
  konu: 'Şifre Sıfırlama Talebi',
  mesaj: `Şifresini unuttu, aranmak istiyor. Telefon: ${popupTelefon}`,
  durum: 'bekliyor',
});
  setPopupGonderildi(true);
}}
                className="flex-1 bg-[#f7971e] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#e8881a] transition">
                Aranmak İstiyorum
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-4">
              Telefon numaranızı girin, sizi arayarak şifrenizi sıfırlamamıza yardımcı olalım.
            </p>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-3">
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2.5 border-r border-gray-200">GSM</span>
              <input
                type="tel"
                value={popupTelefon}
                onChange={e => setPopupTelefon(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="text-xs px-3 py-2.5 flex-1 focus:outline-none text-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSifrePopup(false); setPopupTelefon(''); }}
                className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={async () => {
  if (!popupTelefon) return;
  await supabase.from('destek').insert({
  konu: 'Şifre Sıfırlama Talebi',
  mesaj: `Şifresini unuttu, aranmak istiyor. Telefon: ${popupTelefon}`,
  durum: 'bekliyor',
});
  setPopupGonderildi(true);
}}
                className="flex-1 bg-[#f7971e] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#e8881a] transition"
              >
                Aranmak İstiyorum
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
        </div>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1">
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2 border-r border-gray-200 whitespace-nowrap">Şifre</span>
          <input
            type={goster ? 'text' : 'password'}
            value={sifre}
            onChange={e => setSifre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Şifrenizi yazın"
            className="text-xs px-3 py-2 flex-1 min-w-0 focus:outline-none text-gray-700"
          />
          <button onClick={() => setGoster(!goster)} className="px-2 text-gray-400 hover:text-gray-600">
            {goster ? '🙈' : '👁️'}
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer flex-shrink-0">
          <input type="checkbox" className="accent-orange-500 w-3.5 h-3.5" />
          Beni Hatırla
        </label>
        <button
          onClick={handleLogin}
          disabled={yukleniyor}
          className="bg-[#f7971e] hover:bg-[#e8881a] text-white text-xs font-bold px-5 py-2 rounded-lg transition disabled:opacity-50 flex-shrink-0"
        >
          {yukleniyor ? '...' : 'Giriş'}
        </button>
        <div className="flex flex-col text-right flex-shrink-0">
          <button onClick={() => setSifrePopup(true)} className="text-[11px] text-gray-500 hover:text-gray-700 transition">Şifremi Unuttum</button>
          <button onClick={onGoRegister} className="text-[11px] text-[#f7971e] hover:underline font-medium">Kayıt Ol</button>
        </div>
      </div>

      {/* Mobil: iki satır */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1 min-w-0">
            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-2 border-r border-gray-200 whitespace-nowrap">GSM</span>
            <input
              type="tel"
              value={telefon}
              onChange={e => setTelefon(e.target.value)}
              placeholder="GSM numaranızı yazın"
              className="text-xs px-2 py-2 flex-1 min-w-0 focus:outline-none text-gray-700"
            />
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-1 min-w-0">
            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-2 border-r border-gray-200 whitespace-nowrap">Şifre</span>
            <input
              type={goster ? 'text' : 'password'}
              value={sifre}
              onChange={e => setSifre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Şifrenizi yazın"
              className="text-xs px-2 py-2 flex-1 min-w-0 focus:outline-none text-gray-700"
            />
            <button onClick={() => setGoster(!goster)} className="px-2 text-gray-400 hover:text-gray-600">
              {goster ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
  <button
    onClick={handleLogin}
    disabled={yukleniyor}
    className="bg-[#f7971e] hover:bg-[#e8881a] text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 flex-1"
  >
    {yukleniyor ? '...' : 'Giriş'}
  </button>
  <button onClick={onGoRegister} className="text-[11px] text-[#f7971e] hover:underline font-medium flex-shrink-0">
    Kayıt Ol
  </button>
  <button onClick={() => setSifrePopup(true)} className="text-[11px] text-gray-500 hover:text-gray-700 flex-shrink-0">
    Unuttum
  </button>
</div>
      </div>
    </div>
  );
}
function HomePage({ onGoLogin, onIlanDetay, onLoginSuccess, isLoggedIn }: { onGoLogin: () => void; onIlanDetay: (ilan: Ilan) => void; onLoginSuccess: () => void; isLoggedIn: boolean }) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifKategori, setAktifKategori] = useState<KategoriType | null>(null);
  const [selectedSehir, setSelectedSehir] = useState('');
  const [selectedKalkisIlce, setSelectedKalkisIlce] = useState('');
  const [selectedKalkisMah, setSelectedKalkisMah] = useState('');
  const [selectedVarisIl, setSelectedVarisIl] = useState('');
  const [selectedVarisIlce, setSelectedVarisIlce] = useState('');
  const [selectedVarisMah, setSelectedVarisMah] = useState('');
  const [siralama, setSiralama] = useState('yeni');
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);
  const [otomatikKapatTimer, setOtomatikKapatTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [kompaktGorunum, setKompaktGorunum] = useState(() => localStorage.getItem('gorunum_tercihi') === 'kompakt');
  const [listeReklam, setListeReklam] = useState<any>(null);
  const [kenarKucukReklam, setKenarKucukReklam] = useState<any>(null);
  const [kenarBuyukReklam, setKenarBuyukReklam] = useState<any>(null);
  const [reklamSiklik, setReklamSiklik] = useState(8);

  useEffect(() => {
    ilanlarYukle();
    setDuyuru(null);
    listeReklamYukle();
    reklamSiklikYukle();
    kenarReklamlariYukle();
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

  const kenarReklamlariYukle = async () => {
    const { data: kucuk } = await supabase.from('reklamlar').select('*').eq('aktif', true).eq('konum', 'kenar_kucuk').limit(1).single();
    if (kucuk) setKenarKucukReklam(kucuk);
    const { data: buyuk } = await supabase.from('reklamlar').select('*').eq('aktif', true).eq('konum', 'kenar_buyuk').limit(1).single();
    if (buyuk) setKenarBuyukReklam(buyuk);
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

  const kalkisIlceler = selectedSehir
    ? Array.from(new Set(
        ilanlar.flatMap(i => i.guzergahlar
          .filter(g => g.kalkis_il === selectedSehir)
          .map(g => g.kalkis_ilce).filter(Boolean))
      )).sort()
    : [];

  const kalkisMahalleler = selectedKalkisIlce
    ? Array.from(new Set(
        ilanlar.flatMap(i => i.guzergahlar
          .filter(g => g.kalkis_ilce === selectedKalkisIlce)
          .map(g => g.kalkis_mah).filter(Boolean))
      )).sort()
    : [];

  const varisSehirleri = Array.from(new Set(
    ilanlar.flatMap(i => i.guzergahlar.map(g => g.varis_il).filter(Boolean))
  )).sort();

  const varisIlceler = selectedVarisIl
    ? Array.from(new Set(
        ilanlar.flatMap(i => i.guzergahlar
          .filter(g => g.varis_il === selectedVarisIl)
          .map(g => g.varis_ilce).filter(Boolean))
      )).sort()
    : [];

  const varisMahalleler = selectedVarisIlce
    ? Array.from(new Set(
        ilanlar.flatMap(i => i.guzergahlar
          .filter(g => g.varis_ilce === selectedVarisIlce)
          .map(g => g.varis_mah).filter(Boolean))
      )).sort()
    : [];

  const handleClear = () => {
    setAktifKategori(null);
    setSelectedSehir('');
    setSelectedKalkisIlce('');
    setSelectedKalkisMah('');
    setSelectedVarisIl('');
    setSelectedVarisIlce('');
    setSelectedVarisMah('');
    setSiralama('yeni');
  };

  const kategoriSayisi = (id: KategoriType) => ilanlar.filter(i => i.kategori === id).length;

  const filtrelenmisIlanlar = ilanlar
    .filter(ilan => {
      if (aktifKategori && ilan.kategori !== aktifKategori) return false;
      if (selectedSehir && !ilan.guzergahlar.some(g => g.kalkis_il === selectedSehir)) return false;
      if (selectedKalkisIlce && !ilan.guzergahlar.some(g => g.kalkis_ilce === selectedKalkisIlce)) return false;
      if (selectedKalkisMah && !ilan.guzergahlar.some(g => g.kalkis_mah === selectedKalkisMah)) return false;
      if (selectedVarisIl && !ilan.guzergahlar.some(g => g.varis_il === selectedVarisIl)) return false;
      if (selectedVarisIlce && !ilan.guzergahlar.some(g => g.varis_ilce === selectedVarisIlce)) return false;
      if (selectedVarisMah && !ilan.guzergahlar.some(g => g.varis_mah === selectedVarisMah)) return false;
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const aktivFiltreVar = !!aktifKategori || !!selectedSehir
    || !!selectedKalkisIlce || !!selectedKalkisMah
    || !!selectedVarisIl || !!selectedVarisIlce || !!selectedVarisMah;

  const ilanListesiWithAds = () => {
    const result: React.ReactNode[] = [];
    filtrelenmisIlanlar.forEach((ilan, index) => {
      result.push(
        <IlanCard key={ilan.id} ilan={ilan} onDetay={() => onIlanDetay(ilan)} isLoggedIn={!!isLoggedIn} onGoLogin={onGoLogin} kompakt={kompaktGorunum} />
      );
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

        {/* GİRİŞ ÇUBUĞU */}
        {!isLoggedIn && (
          <div className="mb-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <InlineGiris onLogin={onLoginSuccess} onGoRegister={onGoLogin} />
          </div>
        )}
        {/* KATEGORİ KARTLARI */}
        <div className="mb-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 bg-[#f7971e]">
              <h2 className="text-sm font-bold text-white tracking-wide">İlan Kategorileri</h2>
              <span className="text-xs text-white/80 font-medium">{ilanlar.length} aktif ilan</span>
            </div>
            <div className="flex overflow-x-auto gap-1.5 p-2 scrollbar-hide">
              {KATEGORILER.map((kat) => {
                const sayi = kategoriSayisi(kat.id);
                const isSelected = aktifKategori === kat.id;
                return (
                  <button
                    key={kat.id}
                    onClick={() => setAktifKategori(isSelected ? null : kat.id)}
                    className={
                      "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-center transition-all flex-shrink-0 w-[calc(12.5%-6px)] min-w-[80px] " +
                      (isSelected
                        ? "border-2 border-[#f7971e] bg-orange-50 shadow-sm shadow-orange-100"
                        : "border-2 border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50")
                    }
                  >
                    <div className={"w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 " + kat.iconBg}
                      style={{ fontSize: '16px' }}>
                      {kat.icon}
                    </div>
                    <div className="text-[10px] font-bold text-gray-800 leading-snug">{kat.label}</div>
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
            <div className="bg-white border border-gray-200 rounded overflow-hidden sticky top-10">
              <div className="px-3 py-2.5 bg-[#f7971e] flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-white" />
                <span className="text-sm font-bold text-white">Filtrele</span>
              </div>

              {/* KATEGORİ */}
              <div className="border-b border-gray-100">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Kategori</span>
                </div>
                <button
                  onClick={() => setAktifKategori(null)}
                  className={"w-full flex items-center justify-between px-3 py-1.5 text-xs transition hover:bg-orange-50 " + (!aktifKategori ? "text-[#f7971e] font-semibold bg-orange-50 border-l-4 border-[#f7971e]" : "text-gray-600")}
                >
                  <span className="truncate">Tüm Kategoriler</span>
                  <span className={"flex-shrink-0 ml-1 text-[10px] px-1.5 py-0.5 rounded " + (!aktifKategori ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500")}>{ilanlar.length}</span>
                </button>
                {KATEGORILER.map(kat => {
                  const sayi = kategoriSayisi(kat.id);
                  const isActive = aktifKategori === kat.id;
                  return (
                    <button
                      key={kat.id}
                      onClick={() => setAktifKategori(isActive ? null : kat.id)}
                      className={"w-full flex items-center justify-between px-3 py-1.5 text-xs transition hover:bg-orange-50 border-t border-gray-50 " + (isActive ? "text-[#f7971e] font-semibold bg-orange-50 border-l-4 border-[#f7971e]" : "text-gray-600")}
                    >
                      <span className="flex items-center gap-1 min-w-0">
                        <span className="flex-shrink-0">{kat.icon}</span>
                        <span className="truncate">{kat.label}</span>
                      </span>
                      <span className={"flex-shrink-0 ml-1 text-[10px] px-1.5 py-0.5 rounded " + (isActive ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500")}>{sayi}</span>
                    </button>
                  );
                })}
              </div>

              {/* KONUMA GÖRE */}
              <div className="border-b border-gray-100">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Konuma Göre</span>
                </div>
                <div className="px-3 pt-1.5 pb-0.5">
  <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">📍 Kalkış</span>
</div>
<div className="px-3 pb-2 space-y-1.5">
                  <select
                    value={selectedSehir}
                    onChange={(e) => { setSelectedSehir(e.target.value); setSelectedKalkisIlce(''); setSelectedKalkisMah(''); }}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                  >
                    <option value="">Şehir</option>
                    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {selectedSehir && kalkisIlceler.length > 0 && (
                    <select
                      value={selectedKalkisIlce}
                      onChange={(e) => { setSelectedKalkisIlce(e.target.value); setSelectedKalkisMah(''); }}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                    >
                      <option value="">İlçe</option>
                      {kalkisIlceler.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  )}
                  {selectedKalkisIlce && kalkisMahalleler.length > 0 && (
                    <select
                      value={selectedKalkisMah}
                      onChange={(e) => setSelectedKalkisMah(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                    >
                      <option value="">Mahalle</option>
                      {kalkisMahalleler.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                </div>
                <div className="px-3 pt-1 pb-1 border-t border-gray-50">
                  <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">🏁 Varış</span>
                </div>
                <div className="px-3 pb-3 space-y-1.5">
                  <select
                    value={selectedVarisIl}
                    onChange={(e) => { setSelectedVarisIl(e.target.value); setSelectedVarisIlce(''); setSelectedVarisMah(''); }}
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                  >
                    <option value="">Şehir</option>
                    {varisSehirleri.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {selectedVarisIl && varisIlceler.length > 0 && (
                    <select
                      value={selectedVarisIlce}
                      onChange={(e) => { setSelectedVarisIlce(e.target.value); setSelectedVarisMah(''); }}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                    >
                      <option value="">İlçe</option>
                      {varisIlceler.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  )}
                  {selectedVarisIlce && varisMahalleler.length > 0 && (
                    <select
                      value={selectedVarisMah}
                      onChange={(e) => setSelectedVarisMah(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                    >
                      <option value="">Mahalle</option>
                      {varisMahalleler.map(m => <option key={m} value={m}>{m}</option>)}
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

            {/* YAN REKLAM ALANLARI */}
            <div className="flex gap-4 mb-3">
              {/* Sol filtreden sağ sona kadar uzanan, alt alta iki reklam */}
              <div className="w-full flex flex-col gap-2">
                {/* Küçük reklam — h-32'nin %150'si = h-48 */}
                <div
                  onClick={() => kenarKucukReklam?.link_url && window.open(kenarKucukReklam.link_url, '_blank')}
                  className={`relative w-full h-48 rounded border border-gray-200 overflow-hidden bg-slate-50 ${kenarKucukReklam?.link_url ? 'cursor-pointer' : ''}`}
                >
                  {kenarKucukReklam?.resim_url ? (
                    <img src={kenarKucukReklam.resim_url} alt={kenarKucukReklam.baslik || 'Reklam'} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200">
                      <span className="text-slate-300 text-xs">Reklam Alanı</span>
                    </div>
                  )}
                  <span className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">Reklam</span>
                </div>
                {/* Büyük reklam — h-48'in %150'si = h-72 */}
                <div
                  onClick={() => kenarBuyukReklam?.link_url && window.open(kenarBuyukReklam.link_url, '_blank')}
                  className={`relative w-full h-72 rounded border border-gray-200 overflow-hidden bg-slate-50 ${kenarBuyukReklam?.link_url ? 'cursor-pointer' : ''}`}
                >
                  {kenarBuyukReklam?.resim_url ? (
                    <img src={kenarBuyukReklam.resim_url} alt={kenarBuyukReklam.baslik || 'Reklam'} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200">
                      <span className="text-slate-300 text-xs">Reklam Alanı</span>
                    </div>
                  )}
                  <span className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">Reklam</span>
                </div>
              </div>
            </div>

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
              <div className="flex items-center gap-2">
                <select
                  value={siralama}
                  onChange={(e) => setSiralama(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#f7971e] bg-white text-gray-700"
                >
                  <option value="yeni">En Yeni</option>
                  <option value="eski">En Eski</option>
                </select>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => { setKompaktGorunum(false); localStorage.setItem('gorunum_tercihi', 'detayli'); }}
                    title="Detaylı görünüm"
                    className={`px-2 py-1.5 text-xs transition ${!kompaktGorunum ? 'bg-[#f7971e] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    ☰☰
                  </button>
                  <button
                    onClick={() => { setKompaktGorunum(true); localStorage.setItem('gorunum_tercihi', 'kompakt'); }}
                    title="Kompakt görünüm"
                    className={`px-2 py-1.5 text-xs transition ${kompaktGorunum ? 'bg-[#f7971e] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    ≡≡≡
                  </button>
                </div>
              </div>
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

              {/* Kategori */}
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

              {/* Konuma Göre */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Konuma Göre</p>
                </div>
                {/* Kalkış */}
                <div className="p-3 pb-2">
                  <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide mb-1.5">📍 Kalkış</p>
                  <div className="space-y-1.5">
                    <select value={selectedSehir} onChange={(e) => { setSelectedSehir(e.target.value); setSelectedKalkisIlce(''); setSelectedKalkisMah(''); }}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                      <option value="">Şehir</option>
                      {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {selectedSehir && kalkisIlceler.length > 0 && (
                      <select value={selectedKalkisIlce} onChange={(e) => { setSelectedKalkisIlce(e.target.value); setSelectedKalkisMah(''); }}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                        <option value="">İlçe</option>
                        {kalkisIlceler.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    )}
                    {selectedKalkisIlce && kalkisMahalleler.length > 0 && (
                      <select value={selectedKalkisMah} onChange={(e) => setSelectedKalkisMah(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                        <option value="">Mahalle</option>
                        {kalkisMahalleler.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                {/* Varış */}
                <div className="px-3 pt-2 pb-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1.5">🏁 Varış</p>
                  <div className="space-y-1.5">
                    <select value={selectedVarisIl} onChange={(e) => { setSelectedVarisIl(e.target.value); setSelectedVarisIlce(''); setSelectedVarisMah(''); }}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                      <option value="">Şehir</option>
                      {varisSehirleri.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {selectedVarisIl && varisIlceler.length > 0 && (
                      <select value={selectedVarisIlce} onChange={(e) => { setSelectedVarisIlce(e.target.value); setSelectedVarisMah(''); }}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                        <option value="">İlçe</option>
                        {varisIlceler.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    )}
                    {selectedVarisIlce && varisMahalleler.length > 0 && (
                      <select value={selectedVarisMah} onChange={(e) => setSelectedVarisMah(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#f7971e] bg-white">
                        <option value="">Mahalle</option>
                        {varisMahalleler.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )}
                  </div>
                </div>
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
  const [prevPanelSekme, setPrevPanelSekme] = useState<string>('profil');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [yetkiler, setYetkiler] = useState<Yetkiler>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedIlan, setSelectedIlan] = useState<Ilan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const scrollPozisyon = useRef(0);

  const setCurrentPage = (page: Page) => {
  setPrevPage(currentPage);
  setCurrentPageState(page);
  window.history.pushState({ page }, '', page === 'home' ? '/' : `/${page}`);
  if (page === 'home') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPozisyon.current);
      });
    });
  } else {
    window.scrollTo(0, 0);
  }
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

  const handleIlanDetay = (ilan: Ilan, sekme?: string) => {
  scrollPozisyon.current = window.scrollY;
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
  const hedef = prevPage || 'home';
  setPrevPage(currentPage);
  setCurrentPageState(hedef);
  window.history.pushState({ page: hedef }, '', hedef === 'home' ? '/' : `/${hedef}`);
  if (hedef === 'home') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPozisyon.current);
      });
    });
  } else {
    window.scrollTo(0, 0);
  }
};

  const headerProps = {
  isLoggedIn,
  isAdmin,
  onGoLogin: () => setCurrentPage('login'),
  onLogout: handleLogout,
  onIlanEkle: handleIlanEkle,
  onGoPanel: () => isAdmin ? setCurrentPage('admin') : setCurrentPage('panel'),
  onNavigate: (page: any) => setCurrentPage(page),
  onGoDestek: () => setCurrentPage('admin'),
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

  const withLayout = (content: React.ReactNode, reklamGoster = true) => (
  <div className="min-h-screen bg-[#f8fafc]">
    <Header {...headerProps} />
    {reklamGoster && <ReklamBanner konum="kenar_sol" />}
    {reklamGoster && <ReklamBanner konum="kenar_sag" />}
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
  if (currentPage === 'panel') return withLayout(<PanelPage
  onLogout={handleLogout}
  onIlanEkle={handleIlanEkle}
  onIlanDetay={(ilan, sekme) => handleIlanDetay(ilan, sekme)}
  userId={userId || ''}
  baslangicSekme={sessionStorage.getItem('panel_aktif_sekme') || 'profil'}
/>);
  if (currentPage === 'admin') {
    if (!isAdmin) { setCurrentPage('home'); return null; }
    return withLayout(<AdminPage onLogout={handleLogout} onIlanDetay={handleIlanDetay} isSuperAdmin={isSuperAdmin} yetkiler={yetkiler} />, false);
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
  onLoginSuccess={handleLogin}
  isLoggedIn={isLoggedIn}
/>
    </>
  );
}
