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

  return (
    <header>
      <div className="bg-[#1a3c6e] text-white text-center py-2 text-xs md:text-sm font-medium px-4">
        Sistemde Kayitli Kisi Sayisi:{' '}
        <span className="font-bold text-base md:text-lg ml-1">
          {sayi !== null ? sayi.toLocaleString('tr-TR') : '...'}
        </span>
      </div>

      <div className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <Truck className="text-[#1a3c6e]" size={28} />
            <span className="text-[#1a3c6e] font-bold text-lg md:text-xl">Servis İlanları</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button onClick={onIlanEkle} className="bg-[#f97316] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition text-sm">
                  Ilan Ver
                </button>
                <button onClick={onGoPanel} className="flex items-center gap-2 border-2 border-[#1a3c6e] text-[#1a3c6e] px-4 py-2 rounded-lg font-medium hover:bg-[#1a3c6e] hover:text-white transition text-sm">
                  <LayoutDashboard size={16} />
                  {isAdmin ? 'Admin Panel' : 'Panelim'}
                </button>
                <button onClick={onGoPanel} className="relative p-2 text-gray-500 hover:text-[#1a3c6e] transition">
                  <Bell size={22} />
                  {okunmamis > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{okunmamis}</span>
                  )}
                </button>
                <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition text-sm">
                  <LogOut size={16} /> Cikis
                </button>
              </>
            ) : (
              <>
                <button onClick={onGoLogin} className="border-2 border-[#1a3c6e] text-[#1a3c6e] px-4 py-2 rounded-lg font-medium hover:bg-[#1a3c6e] hover:text-white transition text-sm">
                  Giris Yap
                </button>
                <button onClick={onIlanEkle} className="bg-[#f97316] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition text-sm">
                  Ucretsiz Ilan Ver
                </button>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && (
              <button onClick={onGoPanel} className="relative p-2 text-gray-500 hover:text-[#1a3c6e] transition">
                <Bell size={20} />
                {okunmamis > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{okunmamis}</span>
                )}
              </button>
            )}
            <button onClick={() => setMenuAcik(!menuAcik)} className="p-2 text-gray-600 hover:text-[#1a3c6e] transition">
              {menuAcik ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuAcik && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <button onClick={() => { onIlanEkle(); setMenuAcik(false); }} className="w-full bg-[#f97316] text-white px-4 py-2.5 rounded-lg font-medium text-sm">
                  Ilan Ver
                </button>
                <button onClick={() => { onGoPanel(); setMenuAcik(false); }} className="w-full flex items-center justify-center gap-2 border-2 border-[#1a3c6e] text-[#1a3c6e] px-4 py-2.5 rounded-lg font-medium text-sm">
                  <LayoutDashboard size={16} />
                  {isAdmin ? 'Admin Panel' : 'Panelim'}
                </button>
                <button onClick={() => { onLogout(); setMenuAcik(false); }} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm">
                  <LogOut size={16} /> Cikis Yap
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { onGoLogin(); setMenuAcik(false); }} className="w-full border-2 border-[#1a3c6e] text-[#1a3c6e] px-4 py-2.5 rounded-lg font-medium text-sm">
                  Giris Yap
                </button>
                <button onClick={() => { onIlanEkle(); setMenuAcik(false); }} className="w-full bg-[#f97316] text-white px-4 py-2.5 rounded-lg font-medium text-sm">
                  Ucretsiz Ilan Ver
                </button>
              </>
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {[
                { label: 'Anasayfa', page: 'home' },
                { label: 'Hakkimizda', page: 'hakkimizda' },
                { label: 'Nasil Isliyor', page: 'nasil-isliyor' },
                { label: 'S.S.S', page: 'sss' },
                { label: 'Iletisim', page: 'iletisim' },
              ].map((item) => (
                <button key={item.page} onClick={() => { onNavigate(item.page); setMenuAcik(false); }}
                  className="text-gray-600 text-sm py-1.5 px-3 rounded-lg hover:bg-gray-100 transition">
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <nav className="bg-[#1a3c6e] px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          <button onClick={() => onNavigate('home')} className="text-white text-sm py-3 hover:underline transition">Anasayfa</button>
          <button onClick={() => onNavigate('hakkimizda')} className="text-white text-sm py-3 hover:underline transition">Hakkimizda</button>
          <button onClick={() => onNavigate('nasil-isliyor')} className="text-white text-sm py-3 hover:underline transition">Nasil Isliyor</button>
          <button onClick={() => onNavigate('sss')} className="text-white text-sm py-3 hover:underline transition">S.S.S</button>
          <button onClick={() => onNavigate('iletisim')} className="text-white text-sm py-3 hover:underline transition">Iletisim</button>
        </div>
      </nav>
    </header>
  );
}
