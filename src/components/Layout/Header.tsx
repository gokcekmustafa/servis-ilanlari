import React, { useEffect, useState } from 'react';
import { Truck, LogOut, LayoutDashboard, Bell } from 'lucide-react';
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
      <div className="bg-[#1a3c6e] text-white text-center py-2 text-sm font-medium">
        Sistemde Kayitli Kisi Sayisi:{' '}
        <span className="font-bold text-lg ml-1">
          {sayi !== null ? sayi.toLocaleString('tr-TR') : '...'}
        </span>
      </div>

      <div className="bg-white shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Truck className="text-[#1a3c6e]" size={32} />
            <span className="text-[#1a3c6e] font-bold text-xl">Servis İlanları</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onIlanEkle}
                  className="bg-[#f97316] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
                >
                  Ilan Ver
                </button>

                <button
                  onClick={onGoPanel}
                  className="relative flex items-center gap-2 border-2 border-[#1a3c6e] text-[#1a3c6e] px-4 py-2 rounded-lg font-medium hover:bg-[#1a3c6e] hover:text-white transition"
                >
                  <LayoutDashboard size={16} />
                  {isAdmin ? 'Admin Panel' : 'Panelim'}
                </button>

                <button
                  onClick={onGoPanel}
                  className="relative p-2 text-gray-500 hover:text-[#1a3c6e] transition"
                  title="Bildirimler"
                >
                  <Bell size={22} />
                  {okunmamis > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {okunmamis}
                    </span>
                  )}
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                >
                  <LogOut size={16} />
                  Cikis
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onGoLogin}
                  className="border-2 border-[#1a3c6e] text-[#1a3c6e] px-4 py-2 rounded-lg font-medium hover:bg-[#1a3c6e] hover:text-white transition"
                >
                  Giris Yap
                </button>
                <button
                  onClick={onIlanEkle}
                  className="bg-[#f97316] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
                >
                  Ucretsiz Ilan Ver
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="bg-[#1a3c6e] px-4">
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
