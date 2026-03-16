import React from 'react';
import { Calendar, User, Bus } from 'lucide-react';
import { Ilan, KategoriType } from '../types';

interface IlanCardProps {
  ilan: Ilan;
  onDetay: (ilan: Ilan) => void;
}

type BadgeInfo = {
  label: string;
  color: string;
};

const badges: Record<KategoriType, BadgeInfo> = {
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

export default function IlanCard({ ilan, onDetay }: IlanCardProps) {
  const badge = badges[ilan.kategori];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition p-4">
      <div className="mb-3">
        <span
          className={
            badge.color + ' text-xs font-bold px-3 py-1 rounded-full uppercase'
          }
        >
          {badge.label}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{ilan.aciklama}</p>
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-xs border border-gray-200">
          <thead>
            <tr className="bg-[#1a3c6e] text-white">
              <th className="px-2 py-1 text-left">Giris</th>
              <th className="px-2 py-1 text-left">Nereden</th>
              <th className="px-2 py-1 text-left">Nereye</th>
              <th className="px-2 py-1 text-left">Cikis</th>
            </tr>
          </thead>
          <tbody>
            {ilan.guzergahlar.map((g, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-1 text-[#1a3c6e] font-medium">
                  {g.giris_saati}
                </td>
                <td className="px-2 py-1">
                  {g.kalkis_mah} {g.kalkis_ilce}
                </td>
                <td className="px-2 py-1">
                  {g.varis_mah} {g.varis_ilce}
                </td>
                <td className="px-2 py-1 text-[#1a3c6e] font-medium">
                  {g.cikis_saati}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {ilan.created_at}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} />
            {ilan.ilan_veren}
          </span>
          <span className="flex items-center gap-1">
            <Bus size={12} />
            {ilan.servis_turu.join(', ')}
          </span>
        </div>
        <button
          onClick={() => onDetay(ilan)}
          className="text-xs font-medium text-[#f97316] hover:text-orange-600 transition"
        >
          Ilan Detayi
        </button>
      </div>
    </div>
  );
}
