import React, { useEffect, useState } from 'react';
import { Truck, LogOut, LayoutDashboard, Bell, Menu, X } from 'lucide-react';
import { kullaniciSayisi } from '../../lib/auth';
import { okunmamisMesajSayisi } from '../../lib/ilanlar';
import { mevcutKullanici } from '../../lib/auth';

interface HeaderProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onGoLogin: () => void;
  onLogout: () => void;
  onIlanEkle: () => void;
  onGoPanel: () => void;
  onNavigate: (page: any) => void;
}

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

  useEffect(() => {
    kullaniciSayisi().then(({ count }) => {
      if (count !== null) setSayi(count);
    });
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

  const navLinks = [
    { label: 'Anasayfa', page: 'home' },
    { label: 'Hakkimizda', page: 'hakkimizda' },
    { label: 'Nasil Isliyor', page: 'nasil-isliyor' },
    { label: 'S.S.S', page: 'sss' },
    { label: 'Iletisim', page: 'iletisim' },
  ];

  return (
    <header>

      {/* UST SERIT - ince bilgi bandi */}
      <div className="bg-slate-700 text-slate-300 text-xs py-1.5">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <span>
            Sistemde Kayitli:{' '}
            <span className="text-white font-semibold">
              {sayi !== null ? sayi.toLocaleString('tr-TR') : '...'}
            </span>{' '}
            uye
          </span>
          <button
            onClick={onIlanEkle}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded transition"
          >
            Ucretsiz Ilan Ver
          </button>
        </div>
      </div>

      {/* ANA HEADER - beyaz, logo + nav */}
      <div className="bg-white border-b-2 border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-slate-800 rounded-lg p-1.5">
              <Truck className="text-orange-400" size={22} />
            </div>
            <div className="leading-tight">
              <span className="text-slate-800 font-bold text-lg tracking-tight">salonum</span>
              <span className="text-orange-500 font-bold text-lg">.site</span>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="text-slate-500 hover:text-slate-800 text-sm px-3 py-2 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* DESKTOP BUTONLAR */}
          <div className="hidden md:flex items-center gap-2">
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
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 text-sm px-3 py-2 rounded-lg transition"
                >
                  <LayoutDashboard size={15} />
                  {isAdmin ? 'Admin' : 'Panelim'}
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
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 text-sm px-3 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  <LogOut size={15} />
                  Cikis
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onGoLogin}
                  className="text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 text-sm px-4 py-2 rounded-lg transition font-medium"
                >
                  Giris Yap
                </button>
                <button
                  onClick={onIlanEkle}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Ilan Ver
                </button>
              </>
            )}
          </div>

          {/* MOBIL MENU BUTONU */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={onGoPanel}
                className="relative p-2 text-slate-400"
              >
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
              className="p-2 text-slate-500 hover:text-slate-800 transition"
            >
              {menuAcik ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBIL MENU */}
        {menuAcik && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 flex flex-col gap-2">
            <div className="flex flex-wrap gap-1 mb-2">
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
