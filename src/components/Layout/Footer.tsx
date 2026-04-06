import React from 'react';
import { Truck } from 'lucide-react';

type FooterProps = {
  onNavigate: (page: any) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-100 px-4 pb-2 mt-4">
      <div className="max-w-5xl mx-auto">

        {/* ANA FOOTER */}
        <div className="bg-slate-700 rounded-t-lg px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-0">

            {/* LOGO + ACIKLAMA */}
            <div className="md:col-span-1">
              <div
                className="flex items-center gap-2 cursor-pointer mb-3"
                onClick={() => onNavigate('home')}
              >
                <div className="bg-orange-500 rounded-lg p-1.5">
                  <Truck className="text-white" size={18} />
                </div>
                <span className="text-white font-bold text-base">
                  ilanhemen<span className="text-orange-400">.com</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-snug">
                Servis araci ve sofor ilanlari platformu. Turkiye genelinde
                binlerce ilan ile hizmetinizdeyiz.
              </p>
            </div>

            {/* GIZLILIK */}
            <div>
              <h3 className="text-orange-400 font-semibold text-xs uppercase tracking-wider mb-3">
                Gizlilik ve Kullanim
              </h3>
              <ul className="space-y-1">
                {[
                  { label: 'Sozlesmeler ve Kurallar', page: 'kullanim-kosullari' },
                  { label: 'Uyelik Sozlesmeleri', page: 'kullanim-kosullari' },
                  { label: 'Kullanim Kosullari', page: 'kullanim-kosullari' },
                  { label: 'Kisisel Verilerin Korunmasi', page: 'kisisel-veriler' },
                  { label: 'Yardim', page: 'sss' },
                  { label: 'Hakkimizda', page: 'hakkimizda' },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-slate-400 hover:text-white text-xs transition"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* KURUMSAL */}
            <div>
              <h3 className="text-orange-400 font-semibold text-xs uppercase tracking-wider mb-3">
                Kurumsal
              </h3>
              <ul className="space-y-2">
                {[
                  { label: 'Hakkimizda', page: 'hakkimizda' },
                  { label: 'Nasil Isliyor', page: 'nasil-isliyor' },
                  { label: 'Sikca Sorulan Sorular', page: 'sss' },
                  { label: 'Iletisim', page: 'iletisim' },
                  { label: 'Kunye', page: 'kunye' },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.page)}
                      className="text-slate-400 hover:text-white text-xs transition"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ALT SERIT */}
        <div className="bg-slate-800 rounded-b-lg px-6 py-2 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            2026 ilanhemen.com — Tum haklari saklidir
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('kullanim-kosullari')}
              className="text-slate-500 hover:text-slate-300 text-xs transition"
            >
              Kullanim Kosullari
            </button>
            <button
              onClick={() => onNavigate('kisisel-veriler')}
              className="text-slate-500 hover:text-slate-300 text-xs transition"
            >
              Gizlilik
            </button>
            <button
              onClick={() => onNavigate('iletisim')}
              className="text-slate-500 hover:text-slate-300 text-xs transition"
            >
              Iletisim
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
