import React, { useEffect, useState } from 'react';
import { Truck, LogOut, LayoutDashboard, Bell, Menu, X } from 'lucide-react';
import { kullaniciSayisi } from '../../lib/auth';
import { okunmamisMesajSayisi } from '../../lib/ilanlar';
import { mevcutKullanici } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type HeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onGoLogin: () => void;
  onLogout: () => void;
  onIlanEkle: () => void;
  onGoPanel: () => void;
  onNavigate: (page: any) => void;
};

export default function Header({
  isLoggedIn,
  isAdmin,
  onGoLogin,
  onLogout,
  onIlanEkle,
  onGoPanel,
  onNavigate,
}: HeaderProps) {
  const [sayi, setSayi] = useState<number | null>(null);
  const [okunmamis, setOkunmamis] = useState(0);
  const [menuAcik, setMenuAcik] = useState(false);
  const [headerReklam, setHeaderReklam] = useState<any>(null);

  useEffect(() => {
    kullaniciSayisi().then(({ count }) => {
      if (count !== null) setSayi(count);
    });
    headerReklamYukle();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const user = mevcutKullanici();
      if (user) {
        okunmamisMesajSayisi(user.id).then(({ count }) => {
          if (count) setOkunmamis(count);
        });
      }
    }
  }, [isLoggedIn]);

  const headerReklamYukle = async () => {
    const { data } = await supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .eq('konum', 'header')
      .limit(1)
      .single();
    if (data) setHeaderReklam(data);
  };

  const navLinks = [
    { label: 'Anasayfa', page: 'home' },
    { label: 'Hakkimizda', page: 'hakkimizda' },
    { label: 'Nasil Isliyor', page: 'nasil-isliyor' },
    { label: 'S.S.S', page: 'sss' },
    { label: 'Iletisim', page: 'iletisim' },
  ];

  return (
    <header className="bg-slate-100 pt-3 px-4">
      <div className="max-w-5xl mx-auto">

        {/* 1. UST SERIT */}
        <div className="bg-slate-600 rounded-t-lg px-4 py-1.5 flex items-center justify-between">
          <span className="text-slate-300 text-xs">
            Sistemde Kayitli Kisi Sayisi:{' '}
            <span className="text-white font-bold">
              {sayi !== null ? sayi.toLocaleString('tr-TR') : '...'}
            </span>
          </span>
          <button
            onClick={onIlanEkle}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded transition"
          >
            Ucretsiz Ilan Ver
          </button>
        </div>

        {/* 2. LOGO + REKLAM ALANI */}
        <div className="bg-white border-x border-slate-200 px-4 py-4">
          <div className="flex items-center gap-4">

            {/* LOGO */}
            <div
              className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => onNavigate('home')}
            >
              <div className="bg-orange-500 rounded-lg p-2">
                <Truck className="text-white" size={26} />
              </div>
              <div className="leading-tight">
                <div className="text-slate-800 font-bold text-2xl tracking-tight">
                  salonum<span className="text-orange-500">.site</span>
                </div>
                <div className="text-slate-400 text-xs">
                  Servis Ilanlari Platformu
                </div>
              </div>
            </div>

            {/* REKLAM GORSELI - logo saginda kalan alani doldurur */}
            <div className="flex-1 h-16 ml-2">
              {headerReklam ? (
                <div
                  onClick={() => headerReklam.link_url && window.open(headerReklam.link_url, '_blank')}
                  className="cursor-pointer w-full h-full rounded-lg overflow-hidden relative"
                >
                  <img
                    src={headerReklam.resim_url}
                    alt={headerReklam.baslik || 'Reklam'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <span className="absolute top-1 right-1 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
                    Reklam
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                  <span className="text-slate-300 text-xs">Reklam Alani</span>
                </div>
              )}
            </div>

            {/* SAG BUTONLAR */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={onIlanEkle}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Ilan Ver
                  </button>
                  <button
                    onClick={onGoPanel}
                    className="relative p-2 text-slate-400 hover:text-slate-600 transition"
                  >
                    <Bell size={20} />
                    {okunmamis > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {okunmamis}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={onGoPanel}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 text-sm font-medium px-3 py-2 rounded-lg transition"
                  >
                    <LayoutDashboard size={15} />
                    {isAdmin ? 'Admin' : 'Panelim'}
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm px-3 py-2 rounded-lg transition"
                  >
                    <LogOut size={15} />
                    Cikis
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onGoLogin}
                    className="text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    Giris Yap
                  </button>
                  <button
                    onClick={onIlanEkle}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
                  >
                    Kayit Ol
                  </button>
                </>
              )}
            </div>

            {/* MOBIL MENU BUTONU */}
            <div className="flex md:hidden items-center gap-1 flex-shrink-0">
              {isLoggedIn && (
                <button onClick={onGoPanel} className="relative p-2 text-slate-400">
                  <Bell size={20} />
                  {okunmamis > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {okunmamis}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setMenuAcik(!menuAcik)}
                className="p-2 text-slate-500"
              >
                {menuAcik ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>

        {/* 3. NAV SERIDI */}
        <nav className="bg-slate-500 rounded-b-lg hidden md:flex items-center px-2">
          {navLinks.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className="text-slate-200 hover:text-white hover:bg-slate-400 text-sm font-medium px-4 py-2.5 rounded transition"
            >
              {item.label}
            </button>
          ))}
          {isLoggedIn && (
            <button
              onClick={onIlanEkle}
              className="ml-auto text-orange-300 hover:text-orange-200 text-sm font-medium px-4 py-2.5 transition"
            >
              + Ilan Ver
            </button>
          )}
        </nav>

        {/* MOBIL MENU */}
        {menuAcik && (
          <div className="md:hidden bg-white border-x border-b border-slate-200 rounded-b-lg px-4 py-3 flex flex-col gap-2">
            <div className="flex flex-wrap gap-1 mb-1">
              {navLinks.map((item) => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMenuAcik(false); }}
                  className="text-slate-500 text-sm py-1.5 px-3 rounded-lg hover:bg-slate-50 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => { onIlanEkle(); setMenuAcik(false); }}
                    className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold text-sm"
                  >
                    Ilan Ver
                  </button>
                  <button
                    onClick={() => { onGoPanel(); setMenuAcik(false); }}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm"
                  >
                    <LayoutDashboard size={15} />
                    {isAdmin ? 'Admin Panel' : 'Panelim'}
                  </button>
                  <button
                    onClick={() => { onLogout(); setMenuAcik(false); }}
                    className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-100 py-2.5 rounded-lg text-sm"
                  >
                    <LogOut size={15} /> Cikis Yap
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onGoLogin(); setMenuAcik(false); }}
                    className="w-full border border-slate-200 text-slate-600 py-2.5 rounded-lg font-medium text-sm"
                  >
                    Giris Yap
                  </button>
                  <button
                    onClick={() => { onIlanEkle(); setMenuAcik(false); }}
                    className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold text-sm"
                  >
                    Ucretsiz Ilan Ver
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
