import React from 'react';
import { MapPin, Eye, Phone, MessageCircle, CheckCircle, Star, Flame, Clock, Tag } from 'lucide-react';
import { Ilan, KategoriType } from '../types';

type IlanCardProps = {
  ilan: Ilan;
  onDetay: (ilan: Ilan) => void;
};

const badges: Record<KategoriType, { label: string; bg: string; text: string; border: string }> = {
  isim_var_arac:    { label: 'İşim Var Araç Arıyorum',       bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  aracim_var_is:    { label: 'Aracım Var İş Arıyorum',          bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  sofor_ariyorum:   { label: 'Aracım Var Şoför Arıyorum',       bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  hostes_ariyorum:  { label: 'Aracım Var Hostes Arıyorum',      bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  hostesim_is:      { label: 'Hostesim İş Arıyorum',     bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200' },
  soforum_is:       { label: 'Şoförüm İş Arıyorum',      bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  plaka_satiyorum:  { label: 'Plakamı Satıyorum',        bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  aracimi_satiyorum:{ label: 'Aracımı Satıyorum',         bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
};

const kategoriSerit: Record<KategoriType, string> = {
  isim_var_arac:     'bg-blue-500',
  aracim_var_is:     'bg-green-500',
  sofor_ariyorum:    'bg-orange-500',
  hostes_ariyorum:   'bg-purple-500',
  hostesim_is:       'bg-pink-500',
  soforum_is:        'bg-yellow-500',
  plaka_satiyorum:   'bg-red-500',
  aracimi_satiyorum: 'bg-teal-500',
};

function zamanFarki(tarih: string): string {
  const farkMs = new Date().getTime() - new Date(tarih).getTime();
  const farkSaat = Math.floor(farkMs / (1000 * 60 * 60));
  const farkGun = Math.floor(farkSaat / 24);
  if (farkSaat < 1) return 'Az önce';
  if (farkSaat < 24) return `${farkSaat} saat önce`;
  if (farkGun < 7) return `${farkGun} gün önce`;
  return new Date(tarih).toLocaleDateString('tr-TR');
}

export default function IlanCard({ ilan, onDetay }: IlanCardProps) {
  const badge = badges[ilan.kategori] ?? { label: 'Diğer', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  const serit = kategoriSerit[ilan.kategori] ?? 'bg-gray-300';
  const ucret = ilan.ekbilgiler?.ucret;
  const ucretTipi = ilan.ekbilgiler?.ucret_tipi || 'ay';
  const kapasite = ilan.ekbilgiler?.kapasite;
  const ilanVeren = ilan.profiles?.full_name || ilan.ilan_veren || 'Kullanıcı';
  const basHarf = ilanVeren.charAt(0).toUpperCase();
  const telefon = ilan.profiles?.phone_number || '';
  const konum = ilan.guzergahlar?.[0]
    ? [ilan.guzergahlar[0].kalkis_il, ilan.guzergahlar[0].kalkis_ilce].filter(Boolean).join(', ')
    : '';
  const goruntulenme = ilan.view_count ?? Math.floor(Math.random() * 400) + 20;
  const isVitrin = ilan.ekbilgiler?.vitrin === true;
  const isAcil = ilan.ekbilgiler?.acil === true;

  return (
    <div
      onClick={() => onDetay(ilan)}
      className="bg-white border border-gray-200 hover:border-[#f7971e] hover:shadow-sm transition-all duration-150 cursor-pointer group rounded"
    >
      <div className="flex">
        {/* Sol renk seridi */}
        <div className={`w-1 flex-shrink-0 rounded-l ${serit}`} />

        {/* Orta: içerik */}
        <div className="flex-1 min-w-0 px-4 py-3">
          {/* Üst satır */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                <CheckCircle size={11} /> Onaylı
              </span>
              {isVitrin && (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-white bg-amber-500 px-2 py-0.5 rounded">
                  <Star size={11} fill="currentColor" /> Vitrin
                </span>
              )}
              {isAcil && (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-white bg-red-500 px-2 py-0.5 rounded">
                  <Flame size={11} fill="currentColor" /> Acil
                </span>
              )}
            </div>
            {ucret && (
              <div className="flex-shrink-0 text-right">
                <span className="text-base font-bold text-[#e05a2b]">
                  {Number(ucret).toLocaleString('tr-TR')} ₺
                </span>
                <span className="text-xs text-gray-400 ml-1">/{ucretTipi}</span>
              </div>
            )}
          </div>

          {/* Başlık */}
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#f7971e] transition-colors leading-snug mb-1 line-clamp-1">
            {ilan.aciklama
              ? ilan.aciklama.substring(0, 80) + (ilan.aciklama.length > 80 ? '...' : '')
              : `${badge.label} ilanı`}
          </h3>

          {/* Açıklama */}
          {ilan.aciklama && (
            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed mb-2">
              {ilan.aciklama}
            </p>
          )}

          {/* Servis türü */}
          {ilan.servis_turu && ilan.servis_turu.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {ilan.servis_turu.slice(0, 4).map((t, i) => (
                <span key={i} className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Alt bilgi */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
            {konum && (
              <span className="flex items-center gap-1">
  <MapPin size={11} /> {konum || 'Konum belirtilmemiş'}
</span>
            {kapasite && (
              <span className="flex items-center gap-1"><Tag size={11} /> {kapasite} kişi</span>
            )}
            <span className="flex items-center gap-1"><Eye size={11} /> {goruntulenme}</span>
            <span className="flex items-center gap-1 ml-auto"><Clock size={11} /> {zamanFarki(ilan.created_at)}</span>
          </div>
        </div>

        {/* Sağ panel: kullanıcı + butonlar */}
        <div className="hidden sm:flex flex-col justify-between flex-shrink-0 px-4 py-3 border-l border-gray-100 w-44">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#f7971e] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {basHarf}
            </div>
            <span className="text-xs font-medium text-gray-700 truncate">{ilanVeren}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (telefon) window.open(`https://wa.me/90${telefon.replace(/\D/g, '').replace(/^0/, '')}`, '_blank');
              }}
              className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-[#25D366] border border-[#25D366] text-[11px] font-semibold px-3 py-1.5 rounded transition"
>
  <MessageCircle size={12} className="text-[#25D366]" /> WhatsApp
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (telefon) window.location.href = `tel:${telefon}`;
              }}
              className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-[#f7971e] text-[11px] font-semibold px-3 py-1.5 rounded transition"
            >
              <Phone size={12} className="text-[#f7971e]" /> Ara
            </button>
          </div>
        </div>
      </div>

      {/* Mobil alt butonlar */}
      <div className="sm:hidden flex border-t border-gray-100 divide-x divide-gray-100">
        <button
          onClick={(e) => { e.stopPropagation(); if (telefon) window.open(`https://wa.me/90${telefon.replace(/\D/g,'').replace(/^0/,'')}`, '_blank'); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-[#25D366] bg-white hover:bg-gray-50 border-r border-[#25D366] transition"
>
  <MessageCircle size={12} className="text-[#25D366]" /> WhatsApp
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (telefon) window.location.href = `tel:${telefon}`; }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          <Phone size={12} className="text-[#f7971e]" /> Ara
        </button>
      </div>
    </div>
  );
}
