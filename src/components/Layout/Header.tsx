import React, { useEffect, useState } from 'react';
import { Truck, LogOut, LayoutDashboard, Bell, Menu, X } from 'lucide-react';
import { kullaniciSayisi } from '../../lib/auth';
import { okunmamisMesajSayisi, okunmamisDestekSayisi } from '../../lib/ilanlar';
import { mevcutKullanici } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type HeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onGoNotifications: () => void;
  onLogout: () => void;
  onIlanEkle: () => void;
  onGoPanel: () => void;
  onNavigate: (page: any) => void;
};

export default function Header({
  isLoggedIn, isAdmin, onGoLogin, onGoRegister, onGoNotifications, onLogout, onIlanEkle, onGoPanel, onNavigate,
}: HeaderProps) {
  const [sayi, setSayi] = useState<number | null>(null);
  const [okunmamis, setOkunmamis] = useState(0);
  const [bekleyenDestek, setBekleyenDestek] = useState(0);
  const [menuAcik, setMenuAcik] = useState(false);
  const [headerReklam, setHeaderReklam] = useState<any>(null);
  const [platformLogo, setPlatformLogo] = useState<string>('');

  const bildirimleriYukle = () => {
    if (!isLoggedIn) return;
    const user = mevcutKullanici();
    if (!user) return;
    okunmamisMesajSayisi(user.id).then(({ count }) => { setOkunmamis(count ?? 0); });
    if (isAdmin) {
      okunmamisDestekSayisi().then(({ count }) => { setBekleyenDestek(count ?? 0); });
    }
  };

  useEffect(() => {
  kullaniciSayisi().then(({ count }) => { if (count !== null) setSayi(count); });
  headerReklamYukle();
  platformLogoYukle();
}, []);

  useEffect(() => {
    bildirimleriYukle();
    const interval = setInterval(bildirimleriYukle, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    const handleBildirimDegisti = () => {
      bildirimleriYukle();
    };
    window.addEventListener('bildirimler:degisti', handleBildirimDegisti);
    return () => window.removeEventListener('bildirimler:degisti', handleBildirimDegisti);
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    document.body.style.overflow = menuAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAcik]);

  const headerReklamYukle = async () => {
    const { data } = await supabase.from('reklamlar').select('*').eq('aktif', true).eq('konum', 'header').limit(1).single();
    if (data) setHeaderReklam(data);
  };

  const platformLogoYukle = async () => {
  const { data } = await supabase.from('ayarlar').select('deger').eq('anahtar', 'platform_logo').single();
  if (data?.deger) setPlatformLogo(data.deger);
};

  const handleZilTikla = () => {
    onGoNotifications();
};

  const toplamBildirim = okunmamis + bekleyenDestek;

  const navLinks = [
    { label: 'Anasayfa', page: 'home' },
    { label: 'Hakkımızda', page: 'hakkimizda' },
    { label: 'Nasıl İşliyor', page: 'nasil-isliyor' },
    { label: 'S.S.S', page: 'sss' },
    { label: 'İletişim', page: 'iletisim' },
  ];

  return (
    <header className="bg-slate-100 pt-3 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">

        {/* 1. ÜST ŞERİT */}
        <div className="bg-slate-600 rounded-t-lg px-3 sm:px-4 py-1.5 flex items-center gap-2">
          <span className="text-slate-300 text-xs truncate flex-shrink-0">
            Kayıtlı Kişi:{' '}
            <span className="text-white font-bold">
              {sayi !== null ? sayi.toLocaleString('tr-TR') : '...'}
            </span>
          </span>

          <div className="flex-1 flex justify-end pr-2">
            <button
              onClick={onIlanEkle}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded transition whitespace-nowrap"
            >
              Ücretsiz İlan Ver
            </button>
          </div>

          {/* Masaüstü: kullanıcı butonları */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <button
  onClick={(e) => { e.stopPropagation(); handleZilTikla(); }}
  className="relative p-1.5 text-slate-300 hover:text-white transition"
  type="button"
>
                  <Bell size={17} />
                  {toplamBildirim > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {toplamBildirim}
                    </span>
                  )}
                </button>
                <button
                  onClick={onGoPanel}
                  className="flex items-center gap-1 text-slate-200 hover:text-white border border-slate-400 hover:border-slate-200 text-xs font-medium px-2.5 py-1 rounded transition"
                >
                  <LayoutDashboard size={13} />
                  {isAdmin ? 'Admin' : 'Panelim'}
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-slate-300 hover:text-red-400 text-xs px-2.5 py-1 rounded transition hover:bg-slate-700"
                >
                  <LogOut size={13} /> Çıkış
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onGoLogin}
                  className="text-slate-200 hover:text-white border border-slate-400 hover:border-slate-200 text-xs font-medium px-2.5 py-1 rounded transition"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={onGoRegister}
                  className="text-slate-200 hover:text-white border border-slate-400 hover:border-slate-200 text-xs font-medium px-2.5 py-1 rounded transition"
                >
                  Kayıt Ol
                </button>
              </>
            )}
          </div>

          {/* Mobil: hamburger */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            {isLoggedIn && (
              <button onClick={(e) => { e.stopPropagation(); handleZilTikla(); }} className="relative p-1.5 text-slate-300 hover:text-white transition" type="button">
                <Bell size={18} />
                {toplamBildirim > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {toplamBildirim}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMenuAcik(!menuAcik)}
              className="p-1.5 text-slate-300 hover:text-white transition"
              aria-label="Menü"
            >
              {menuAcik ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 2. LOGO + REKLAM */}
        <div className="bg-white border-x border-slate-200 px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start"
              onClick={() => onNavigate('home')}
            >
              <div className="rounded-lg overflow-hidden flex-shrink-0">
  {platformLogo ? (
    <img src={platformLogo} alt="Logo" className="h-8 w-auto object-contain" />
  ) : (
    <div className="bg-orange-500 rounded-lg p-1 sm:p-1.5">
      <Truck className="text-white" size={16} />
    </div>
  )}
</div>
              <div className="leading-tight">
                <div className="text-slate-800 font-bold text-base sm:text-xl tracking-tight">
                  salonum<span className="text-orange-500">.site</span>
                </div>
                <div className="text-slate-400 text-[10px] sm:text-xs hidden sm:block">
                  Servis İlanları Platformu
                </div>
              </div>
            </div>

            <div className="w-full sm:flex-1 h-32 sm:h-48">
              {headerReklam ? (
                <div
                  onClick={() => headerReklam.link_url && window.open(headerReklam.link_url, '_blank')}
                  className="cursor-pointer w-full h-full rounded-lg overflow-hidden relative"
                >
                  <img
                    src={headerReklam.resim_url}
                    alt={headerReklam.baslik || 'Reklam'}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <span className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Reklam
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                  <span className="text-slate-300 text-xs">Reklam Alanı</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. NAV — masaüstü */}
        <nav className="bg-slate-500 rounded-b-lg hidden md:flex items-center px-2">
          {navLinks.map((item) => (
            <button key={item.page} onClick={() => onNavigate(item.page)}
              className="text-slate-200 hover:text-white hover:bg-slate-400 text-sm font-medium px-4 py-2.5 rounded transition">
              {item.label}
            </button>
          ))}
        </nav>

        {/* MOBİL MENÜ */}
        {menuAcik && (
          <div className="md:hidden fixed inset-0 top-0 z-50 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg overflow-hidden flex-shrink-0">
  {platformLogo ? (
    <img src={platformLogo} alt="Logo" className="h-8 w-auto object-contain" />
  ) : (
    <div className="bg-orange-500 rounded-lg p-1.5">
      <Truck className="text-white" size={18} />
    </div>
  )}
</div>
                <span className="text-white font-bold text-base">salonum<span className="text-orange-400">.site</span></span>
              </div>
              <button onClick={() => setMenuAcik(false)} className="p-2 text-slate-300 hover:text-white">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Sayfalar</p>
                <div className="flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <button key={item.page}
                      onClick={() => { onNavigate(item.page); setMenuAcik(false); }}
                      className="w-full text-left text-slate-700 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition text-sm">
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Hesap</p>
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { onIlanEkle(); setMenuAcik(false); }}
                      className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm active:bg-orange-600 transition">
                      + Ücretsiz İlan Ver
                    </button>
                    <button onClick={() => { onGoPanel(); setMenuAcik(false); }}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-3.5 rounded-xl text-sm font-medium active:bg-slate-50 transition">
                      <LayoutDashboard size={15} />
                      {isAdmin ? 'Admin Panel' : 'Panelim'}
                    </button>
                    <button onClick={() => { onLogout(); setMenuAcik(false); }}
                      className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-100 bg-red-50 py-3.5 rounded-xl text-sm font-medium active:bg-red-100 transition">
                      <LogOut size={15} /> Çıkış Yap
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { onGoLogin(); setMenuAcik(false); }}
                      className="w-full border border-slate-200 text-slate-600 py-3.5 rounded-xl font-medium text-sm active:bg-slate-50 transition">
                      Giriş Yap
                    </button>
                    <button onClick={() => { onGoRegister(); setMenuAcik(false); }}
                      className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm active:bg-orange-600 transition">
                      Ücretsiz İlan Ver / Kayıt Ol
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
