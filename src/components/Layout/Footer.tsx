import React from 'react';

interface FooterProps {
  onNavigate: (page: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">Arac Durumuna Gore</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition">İsime Arac Ariyorum</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition">Aracima İs Ariyorum</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition">Sofor Ariyorum</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition">Soforum İs Ariyorum</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition">Hostesim İs Ariyorum</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition">Hostes Ariyorum</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">Hizmetlerimiz</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => onNavigate('nasil-isliyor')} className="hover:text-white transition">Servis Aracina İs Arayanlar</button></li>
              <li><button onClick={() => onNavigate('nasil-isliyor')} className="hover:text-white transition">Sofor Arayanlar</button></li>
              <li><button onClick={() => onNavigate('nasil-isliyor')} className="hover:text-white transition">Otobus Arayan Firmalar</button></li>
              <li><button onClick={() => onNavigate('nasil-isliyor')} className="hover:text-white transition">Servis Hostesi Arayanlar</button></li>
              <li><button onClick={() => onNavigate('nasil-isliyor')} className="hover:text-white transition">Ogrenci Servisi Araclari</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">Gizlilik ve Kullanim</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => onNavigate('kullanim-kosullari')} className="hover:text-white transition">Sozlesmeler ve Kurallar</button></li>
              <li><button onClick={() => onNavigate('kullanim-kosullari')} className="hover:text-white transition">Uyelik Sozlesmeleri</button></li>
              <li><button onClick={() => onNavigate('kullanim-kosullari')} className="hover:text-white transition">Kullanim Kosullari</button></li>
              <li><button onClick={() => onNavigate('kisisel-veriler')} className="hover:text-white transition">Kisisel Verilerin Korunmasi</button></li>
              <li><button onClick={() => onNavigate('sss')} className="hover:text-white transition">Yardim</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">Kurumsal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => onNavigate('hakkimizda')} className="hover:text-white transition">Hakkimizda</button></li>
              <li><button onClick={() => onNavigate('nasil-isliyor')} className="hover:text-white transition">Nasil İsliyor</button></li>
              <li><button onClick={() => onNavigate('sss')} className="hover:text-white transition">Sikca Sorulan Sorular</button></li>
              <li><button onClick={() => onNavigate('iletisim')} className="hover:text-white transition">İletisim</button></li>
              <li><button onClick={() => onNavigate('kunye')} className="hover:text-white transition">Kunye</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
          2026 Servis İlanları — Tum haklari saklidir.
        </div>
      </div>
    </footer>
  );
}
