import React from 'react';
import { Calendar, User, Bus, ArrowLeft, Phone } from 'lucide-react';
import { Ilan, KategoriType } from '../types';

const kategoriBadge: Record<KategoriType, { label: string; color: string }> = {
  isim_var_arac: {
    label: 'ISIM VAR ARAC ARIYORUM',
    color: 'bg-blue-100 text-blue-800',
  },
  aracim_var_is: {
    label: 'ARACIM VAR IS ARIYORUM',
    color: 'bg-green-100 text-green-800',
  },
  sofor_ariyorum: {
    label: 'SOFOR ARIYORUM',
    color: 'bg-orange-100 text-orange-800',
  },
  hostes_ariyorum: {
    label: 'HOSTES ARIYORUM',
    color: 'bg-purple-100 text-purple-800',
  },
  hostesim_is: {
    label: 'HOSTESIM IS ARIYORUM',
    color: 'bg-pink-100 text-pink-800',
  },
  soforum_is: {
    label: 'SOFORUM IS ARIYORUM',
    color: 'bg-yellow-100 text-yellow-800',
  },
  plaka_satiyorum: {
    label: 'PLAKAM SATIYORUM',
    color: 'bg-red-100 text-red-800',
  },
};

export default function IlanDetayPage({
  ilan,
  onGoBack,
  onGoLogin,
  isLoggedIn,
}: {
  ilan: Ilan;
  onGoBack: () => void;
  onGoLogin: () => void;
  isLoggedIn: boolean;
}) {
  const badge = kategoriBadge[ilan.kategori];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition"
      >
        <ArrowLeft size={16} />
        Ilanlara Geri Don
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <span
            className={`${badge.color} text-xs font-bold px-3 py-1 rounded-full uppercase`}
          >
            {badge.label}
          </span>
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-6">
          {ilan.aciklama}
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#1a3c6e] text-white">
                <th className="px-4 py-3 text-left font-medium">Giris Saati</th>
                <th className="px-4 py-3 text-left font-medium">Nereden</th>
                <th className="px-4 py-3 text-left font-medium">Nereye</th>
                <th className="px-4 py-3 text-left font-medium">Cikis Saati</th>
              </tr>
            </thead>
            <tbody>
              {ilan.guzergahlar.map((g, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-[#1a3c6e]">
                    {g.giris_saati}
                  </td>
                  <td className="px-4 py-3">
                    {g.kalkis_mah} {g.kalkis_ilce} / {g.kalkis_il}
                  </td>
                  <td className="px-4 py-3">
                    {g.varis_mah} {g.varis_ilce} / {g.varis_il}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1a3c6e]">
                    {g.cikis_saati}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-[#1a3c6e]" />
            <div>
              <p className="text-xs text-gray-400">Ilan Tarihi</p>
              <p className="font-medium">{ilan.created_at}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} className="text-[#1a3c6e]" />
            <div>
              <p className="text-xs text-gray-400">Ilan Veren</p>
              <p className="font-medium">{ilan.ilan_veren}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bus size={16} className="text-[#1a3c6e]" />
            <div>
              <p className="text-xs text-gray-400">Servis Turu</p>
              <p className="font-medium">{ilan.servis_turu.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-700 mb-4">Iletisim</h3>
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Phone size={20} className="text-green-600" />
              <div>
                <p className="text-xs text-gray-400">Telefon</p>
                <p className="font-bold text-gray-700">0532 XXX XX XX</p>
              </div>
            </div>
            <button className="bg-[#1a3c6e] text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-900 transition">
              Hemen Ara
            </button>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Iletisim bilgilerini görmek icin giris yapmaniz gerekiyor.
            </p>
            <button
              onClick={onGoLogin}
              className="bg-[#f97316] text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              Giris Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
