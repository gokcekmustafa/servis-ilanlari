import React from 'react';
import { Calendar, User, Bus, Tag } from 'lucide-react';
import { Ilan, KategoriType } from '../types';

type IlanCardProps = {
  ilan: Ilan;
  onDetay: (ilan: Ilan) => void;
};

type BadgeInfo = {
  label: string;
  color: string;
};

const badges: Record<KategoriType, BadgeInfo> = {
  isim_var_arac:   { label: 'ISIM VAR ARAC ARIYORUM', color: 'bg-blue-100 text-blue-800' },
  aracim_var_is:   { label: 'ARACIM VAR IS ARIYORUM', color: 'bg-green-100 text-green-800' },
  sofor_ariyorum:  { label: 'SOFOR ARIYORUM',          color: 'bg-orange-100 text-orange-900' },
  hostes_ariyorum: { label: 'HOSTES ARIYORUM',         color: 'bg-purple-100 text-purple-800' },
  hostesim_is:     { label: 'HOSTESIM IS ARIYORUM',    color: 'bg-pink-100 text-pink-800' },
  soforum_is:      { label: 'SOFORUM IS ARIYORUM',     color: 'bg-yellow-100 text-yellow-800' },
  plaka_satiyorum: { label: 'PLAKAM SATIYORUM',        color: 'bg-red-100 text-red-800' },
};

const plakaSatiyormu = (ilan: Ilan) => ilan.kategori === 'plaka_satiyorum';

export default function IlanCard({ ilan, onDetay }: IlanCardProps) {
  const badge = badges[ilan.kategori];
  const ucret = ilan.ekbilgiler?.ucret;
  const gosterGuzergah = !plakaSatiyormu(ilan);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden">

      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <span className={badge.color + ' text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'}>
          {badge.label}
        </span>
        {ucret && (
          <span className="flex items-center gap-1 text-blue-600 font-bold text-sm whitespace-nowrap flex-shrink-0">
            <Tag size={12} />
            {Number(ucret).toLocaleString('tr-TR')} TL
          </span>
        )}
      </div>

      {ilan.aciklama && (
        <p className="text-sm text-slate-500 px-4 pb-3 leading-relaxed line-clamp-2">
          {ilan.aciklama}
        </p>
      )}

      {gosterGuzergah && ilan.guzergahlar.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-400 text-white">
                <th className="px-3 py-2 text-left font-medium">Giris</th>
                <th className="px-3 py-2 text-left font-medium">Nereden</th>
                <th className="px-3 py-2 text-left font-medium">Nereye</th>
                <th className="px-3 py-2 text-left font-medium">Cikis</th>
              </tr>
            </thead>
            <tbody>
              {ilan.guzergahlar.map((g, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 text-orange-600 font-bold">{g.giris_saati}</td>
                  <td className="px-3 py-2 text-slate-600">{g.kalkis_mah} {g.kalkis_ilce}</td>
                  <td className="px-3 py-2 text-slate-600">{g.varis_mah} {g.varis_ilce}</td>
                  <td className="px-3 py-2 text-orange-600 font-bold">{g.cikis_saati}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {plakaSatiyormu(ilan) && (
        <div className="px-4 py-3 flex flex-wrap gap-3 text-xs text-slate-500">
          {ilan.ekbilgiler?.plaka_il && (
            <span className="font-semibold text-slate-700">
              Plaka: {ilan.ekbilgiler.plaka_il} {ilan.ekbilgiler.plaka_harf} {ilan.ekbilgiler.plaka_no}
            </span>
          )}
          {ilan.ekbilgiler?.aracla_birlikte && <span className="bg-slate-100 px-2 py-0.5 rounded">Aracla Birlikte</span>}
          {ilan.ekbilgiler?.yol_belgesi_var && <span className="bg-slate-100 px-2 py-0.5 rounded">Yol Belgesi Var</span>}
          {ilan.ekbilgiler?.noter_satisi && <span className="bg-slate-100 px-2 py-0.5 rounded">Noter Satisi</span>}
          {ilan.ekbilgiler?.hisseli && <span className="bg-slate-100 px-2 py-0.5 rounded">Hisseli</span>}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
          </span>
          <span className="flex items-center gap-1">
  <User size={11} />
  {ilan.profiles?.full_name || ilan.ilan_veren}
</span>
          {ilan.servis_turu && ilan.servis_turu.length > 0 && (
            <span className="flex items-center gap-1">
              <Bus size={11} />
              {ilan.servis_turu.join(', ')}
            </span>
          )}
        </div>
        <button
          onClick={() => onDetay(ilan)}
          className="text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg transition"
        >
          Ilan Detayi
        </button>
      </div>
    </div>
  );
}
