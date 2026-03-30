import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Clock, ArrowRight, Heart, MapPin, ImageOff, X } from 'lucide-react';
import { Ilan, KategoriType } from '../types';
import { favoriEkle, favoriKaldir, favoriKontrol } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';

// Görüntülenen ilanları localStorage'da tut
const gorilenIlanlariGetir = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem('gorilen_ilanlar') || '[]')); }
  catch { return new Set(); }
};
const ilanGorulduIsaretle = (id: string) => {
  const set = gorilenIlanlariGetir();
  set.add(id);
  localStorage.setItem('gorilen_ilanlar', JSON.stringify([...set]));
};

type IlanCardProps = {
  ilan: Ilan;
  onDetay: (ilan: Ilan) => void;
  onGoLogin?: () => void;
  isLoggedIn?: boolean;
  kompakt?: boolean; // bunu ekle
};

const kategoriConfig: Record<KategoriType, { label: string; label1: string; label2: string; bg: string; text: string; serit: string }> = {
  isim_var_arac:     { label: 'İŞİM VAR ARAÇ ARIYORUM',     label1: 'İşim Var',    label2: 'Araç Arıyorum',  bg: 'bg-blue-500',   text: 'text-white', serit: 'bg-blue-500' },
  aracim_var_is:     { label: 'ARACIM VAR İŞ ARIYORUM',     label1: 'Aracım Var',  label2: 'İş Arıyorum',    bg: 'bg-green-500',  text: 'text-white', serit: 'bg-green-500' },
  sofor_ariyorum:    { label: 'ARACIM VAR ŞOFÖR ARIYORUM',  label1: 'Aracım Var',  label2: 'Şoför Arıyorum', bg: 'bg-orange-500', text: 'text-white', serit: 'bg-orange-500' },
  hostes_ariyorum:   { label: 'ARACIM VAR HOSTES ARIYORUM', label1: 'Aracım Var',  label2: 'Hostes Arıyorum',bg: 'bg-purple-500', text: 'text-white', serit: 'bg-purple-500' },
  hostesim_is:       { label: 'HOSTESİM İŞ ARIYORUM',       label1: 'Hostesim',    label2: 'İş Arıyorum',    bg: 'bg-pink-500',   text: 'text-white', serit: 'bg-pink-500' },
  soforum_is:        { label: 'ŞOFÖRÜM İŞ ARIYORUM',        label1: 'Şoförüm',     label2: 'İş Arıyorum',    bg: 'bg-yellow-500', text: 'text-white', serit: 'bg-yellow-500' },
  plaka_satiyorum:   { label: 'PLAKIMI SATIYORUM',           label1: 'Plakamı',     label2: 'Satıyorum',      bg: 'bg-red-500',    text: 'text-white', serit: 'bg-red-500' },
  aracimi_satiyorum: { label: 'ARACIMI SATIYORUM',           label1: 'Aracımı',     label2: 'Satıyorum',      bg: 'bg-teal-500',   text: 'text-white', serit: 'bg-teal-500' },
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

function GuzergahBasliklari({ kategori }: { kategori: KategoriType }) {
  if (kategori === 'isim_var_arac') {
    return (
      <div className="grid grid-cols-6 text-center text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-2 mb-1">
        <span>Giriş</span><span>Nereden</span><span>Nereye</span><span>Çıkış</span><span>Başlangıç</span><span>Bitiş</span>
      </div>
    );
  }
  if (kategori === 'aracim_var_is') {
    return (
      <div className="grid grid-cols-3 text-center text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-2 mb-1">
        <span>Saat</span><span>Boş Olduğu Semt</span><span>Saat</span>
      </div>
    );
  }
  if (kategori === 'soforum_is') {
    return (
      <div className="grid grid-cols-3 text-center text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-2 mb-1">
      </div>
    );
  }
  if (kategori === 'hostesim_is') {
    return (
      <div className="grid grid-cols-3 text-center text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-2 mb-1">
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 text-center text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-2 mb-1">
      <span>Giriş Saati</span><span>Nereden</span><span>Nereye</span><span>Çıkış Saati</span>
    </div>
  );
}

function GuzergahSatiri({ g, kategori }: { g: any; kategori: KategoriType }) {
  if (kategori === 'isim_var_arac') {
    return (
      <div className="grid grid-cols-6 text-center items-center py-2">
        <span className="text-sm font-bold text-gray-800">{g.giris_saati || '—'}</span>
        <div><p className="text-sm font-bold text-gray-900 uppercase">{g.kalkis_mah || '—'}</p>{g.kalkis_ilce && <p className="text-[11px] text-gray-500 uppercase">{g.kalkis_ilce}</p>}</div>
        <div><p className="text-sm font-bold text-gray-900 uppercase">{g.varis_mah || '—'}</p>{g.varis_ilce && <p className="text-[11px] text-gray-500 uppercase">{g.varis_ilce}</p>}</div>
        <span className="text-sm font-bold text-gray-800">{g.cikis_saati || '—'}</span>
        <span className="text-sm font-bold text-gray-800">{g.baslangic_saati || '—'}</span>
        <span className="text-sm font-bold text-gray-800">{g.bitis_saati || '—'}</span>
      </div>
    );
  }
  if (kategori === 'aracim_var_is' || kategori === 'soforum_is' || kategori === 'hostesim_is') {
    return (
      <div className="grid grid-cols-3 text-center items-center py-2">
        <span className="text-sm font-bold text-gray-800">{g.giris_saati || '—'}</span>
        <div>
          <p className="text-sm font-bold text-gray-900 uppercase">{g.kalkis_mah || '—'}</p>
          {g.kalkis_ilce && <p className="text-[11px] text-gray-500 uppercase">{g.kalkis_ilce}</p>}
          {g.kalkis_il && <p className="text-[11px] text-gray-500 uppercase">{g.kalkis_il}</p>}
        </div>
        <span className="text-sm font-bold text-gray-800">{g.cikis_saati || '—'}</span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 text-center items-center py-2">
      <span className="text-sm font-bold text-gray-800">{g.giris_saati || '—'}</span>
      <div>
        <p className="text-sm font-bold text-gray-900 uppercase">{g.kalkis_mah || '—'}</p>
        {g.kalkis_ilce && <p className="text-[11px] text-gray-500 uppercase">{g.kalkis_ilce}</p>}
        {g.kalkis_il && <p className="text-[11px] text-gray-500 uppercase">{g.kalkis_il}</p>}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 uppercase">{g.varis_mah || '—'}</p>
        {g.varis_ilce && <p className="text-[11px] text-gray-500 uppercase">{g.varis_ilce}</p>}
        {g.varis_il && <p className="text-[11px] text-gray-500 uppercase">{g.varis_il}</p>}
      </div>
      <span className="text-sm font-bold text-gray-800">{g.cikis_saati || '—'}</span>
    </div>
  );
}

// Küçük resim bileşeni — sadece aracim_var_is ve aracimi_satiyorum için
function IlanThumbnail({ resimler }: { resimler: string[] }) {
  const [hata, setHata] = useState(false);
  const anaResim = resimler?.[0];

  if (!anaResim || hata) {
    return (
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center gap-1">
        <ImageOff size={16} className="text-gray-300" />
        {resimler?.length > 0 && <span className="text-[9px] text-gray-400">Yüklenemedi</span>}
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
      <img
        src={anaResim}
        alt="Araç"
        className="w-full h-full object-cover"
        onError={() => setHata(true)}
      />
      {resimler.length > 1 && (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
          +{resimler.length - 1}
        </div>
      )}
    </div>
  );
}

export default function IlanCard({ ilan, onDetay, onGoLogin, isLoggedIn, kompakt = false }: IlanCardProps) {
  const config = kategoriConfig[ilan.kategori] ?? { label: 'DİĞER', bg: 'bg-gray-500', text: 'text-white', serit: 'bg-gray-300' };
  const ilanVeren = ilan.profiles?.full_name || ilan.ilan_veren || 'Kullanıcı';
  const telefon = ilan.profiles?.phone_number || '';
  const tarih = new Date(ilan.created_at).toLocaleDateString('tr-TR');
  const ekBilgi = ilan.ekbilgiler || {};
  const [isFavori, setIsFavori] = useState(false);
  const [goruldu, setGoruldu] = useState(() => gorilenIlanlariGetir().has(ilan.id));
  const [gizli, setGizli] = useState(false);
const [hover, setHover] = useState(false);
const kullaniciId = mevcutKullanici()?.id || null;

useEffect(() => {
  if (!kullaniciId) {
    // Misafir — localStorage'dan oku
    const kayit = localStorage.getItem(`gizli_misafir_${ilan.id}`);
    if (kayit === '1') setGizli(true);
    return;
  }
  // Üye — Supabase'den oku
  supabase
    .from('gizli_ilanlar')
    .select('id')
    .eq('user_id', kullaniciId)
    .eq('ilan_id', ilan.id)
    .maybeSingle()
    .then(({ data }) => {
      setGizli(!!data);
    });
}, [ilan.id, kullaniciId]);

  // Resim gösteren kategoriler
  const resimliKategori = ilan.kategori === 'aracimi_satiyorum' || ilan.kategori === 'aracim_var_is' || ilan.kategori === 'hostesim_is' || ilan.kategori === 'soforum_is';
  const resimler: string[] = ekBilgi.resimler || [];

  useEffect(() => {
    if (isLoggedIn) {
      const user = mevcutKullanici();
      if (user) {
        favoriKontrol(user.id, ilan.id).then(({ isFavori }) => setIsFavori(isFavori));
      }
    }
  }, [isLoggedIn, ilan.id]);

  const handleFavori = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { onGoLogin?.(); return; }
    const user = mevcutKullanici();
    if (!user || user.id === ilan.user_id) return;
    if (isFavori) { await favoriKaldir(user.id, ilan.id); setIsFavori(false); }
    else { await favoriEkle(user.id, ilan.id); setIsFavori(true); }
  };
{/* KOMPAKT GÖRÜNÜM */}
if (kompakt) {
  const g0 = ilan.guzergahlar?.[0];
  const kalkisIlce = g0?.kalkis_ilce || g0?.kalkis_il || '';
  const varisIlce = g0?.varis_ilce || g0?.varis_il || '';
  const girisSaati = g0?.giris_saati || '';
  const cikisSaati = g0?.cikis_saati || '';
  const saatStr = girisSaati && cikisSaati ? `${girisSaati}-${cikisSaati}` : girisSaati || cikisSaati || '';
  const profilResim = ekBilgi.profil_resmi || '';
  const aracResim = (ekBilgi.resimler || [])[0] || '';

  // Platform logosu — küçük turuncu kutu
  const PlatformLogo = () => (
    <div className="w-8 h-8 flex-shrink-0 bg-orange-500 rounded-lg flex items-center justify-center">
      <span className="text-white text-[9px] font-bold leading-tight text-center">S</span>
    </div>
  );

  // Kişi resmi veya platform logosu
  const KisiResmi = () => profilResim ? (
    <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
      <img src={profilResim} alt="" className="w-full h-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  ) : <PlatformLogo />;

  // Araç resmi veya platform logosu
  const AracResmi = () => aracResim ? (
    <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
      <img src={aracResim} alt="" className="w-full h-full object-cover"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  ) : <PlatformLogo />;

  let icerik: React.ReactNode = null;

  if (ilan.kategori === 'soforum_is') {
    const dogumYili = ekBilgi.dogum_tarihi ? new Date(ekBilgi.dogum_tarihi).getFullYear() : null;
    const yas = dogumYili ? new Date().getFullYear() - dogumYili : null;
    icerik = (
      <>
        <KisiResmi />
        <span className="font-semibold text-gray-800 text-xs truncate max-w-[100px]">{ilanVeren}</span>
        {kalkisIlce && <span className="text-[11px] text-gray-500 truncate">{kalkisIlce}</span>}
        {yas && <span className="text-[11px] text-gray-500">D.{yas}</span>}
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ekBilgi.emekli === 'evet' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          {ekBilgi.emekli === 'evet' ? 'Emekli' : 'Emekli Değil'}
        </span>
      </>
    );
  } else if (ilan.kategori === 'hostesim_is') {
    const dogumYili = ekBilgi.dogum_tarihi ? new Date(ekBilgi.dogum_tarihi).getFullYear() : null;
    const yas = dogumYili ? new Date().getFullYear() - dogumYili : null;
    icerik = (
      <>
        <KisiResmi />
        <span className="font-semibold text-gray-800 text-xs truncate max-w-[100px]">{ilanVeren}</span>
        {kalkisIlce && <span className="text-[11px] text-gray-500 truncate">{kalkisIlce}</span>}
        {yas && <span className="text-[11px] text-gray-500">D.{yas}</span>}
      </>
    );
  } else if (ilan.kategori === 'isim_var_arac') {
    const guzergahStr = kalkisIlce && varisIlce ? `${kalkisIlce} → ${varisIlce}` : kalkisIlce || varisIlce || '';
    icerik = (
      <>
        <PlatformLogo />
        {saatStr && <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">{saatStr}</span>}
        {guzergahStr && <span className="text-[11px] text-gray-500 truncate">{guzergahStr}</span>}
        {ekBilgi.ucret && (
          <span className="text-xs font-bold text-blue-600 whitespace-nowrap ml-auto">
            {Number(ekBilgi.ucret).toLocaleString('tr-TR')} ₺
          </span>
        )}
      </>
    );
  } else if (ilan.kategori === 'aracim_var_is') {
    const guzStr = kalkisIlce || '';
    const aracAd = [ekBilgi.marka, ekBilgi.model].filter(Boolean).join(' ');
    icerik = (
      <>
        <PlatformLogo />
        <AracResmi />
        <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">
          {saatStr || 'Boşta'}
        </span>
        {guzStr && <span className="text-[11px] text-gray-500 truncate">{guzStr}</span>}
        {aracAd && <span className="text-[11px] text-gray-600 truncate">{aracAd}</span>}
      </>
    );
  } else if (ilan.kategori === 'sofor_ariyorum') {
    const guzStr = kalkisIlce && varisIlce ? `${kalkisIlce} → ${varisIlce}` : kalkisIlce || '';
    icerik = (
      <>
        <PlatformLogo />
        <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">
          {saatStr || (ekBilgi.yolcu_sayisi ? `${ekBilgi.yolcu_sayisi} kişi` : '')}
        </span>
        {guzStr && <span className="text-[11px] text-gray-500 truncate">{guzStr}</span>}
      </>
    );
  } else if (ilan.kategori === 'plaka_satiyorum') {
    icerik = (
      <>
        <PlatformLogo />
        {kalkisIlce && <span className="text-[11px] text-gray-500 truncate">{kalkisIlce}</span>}
        {ekBilgi.ucret && (
          <span className="text-xs font-bold text-blue-600 whitespace-nowrap ml-auto">
            {Number(ekBilgi.ucret).toLocaleString('tr-TR')} ₺
          </span>
        )}
      </>
    );
  } else if (ilan.kategori === 'aracimi_satiyorum') {
    const aracAd = [ekBilgi.marka, ekBilgi.model].filter(Boolean).join(' ');
    icerik = (
      <>
        <AracResmi />
        {aracAd && <span className="text-xs font-semibold text-gray-700 truncate">{aracAd}</span>}
        {ekBilgi.km && <span className="text-[11px] text-gray-500 whitespace-nowrap">{Number(ekBilgi.km).toLocaleString('tr-TR')} km</span>}
        {ekBilgi.ucret && (
          <span className="text-xs font-bold text-blue-600 whitespace-nowrap ml-auto">
            {Number(ekBilgi.ucret).toLocaleString('tr-TR')} ₺
          </span>
        )}
      </>
    );
  } else {
    icerik = (
      <>
        <PlatformLogo />
        <p className="text-xs text-gray-600 truncate flex-1">{ilan.aciklama || '—'}</p>
        {kalkisIlce && <span className="text-[11px] text-gray-400">{kalkisIlce}</span>}
      </>
    );
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onDetay(ilan)}
      className={`relative bg-white border border-gray-200 hover:border-[#f7971e] hover:shadow-sm transition-all duration-150 cursor-pointer rounded overflow-hidden flex items-center gap-0 ${gizli ? 'opacity-40 grayscale' : ''}`}
    >
      {/* GİZLE BUTONU */}
      {!gizli && hover && (
        <div className="absolute top-1 right-1 z-20 group/gizle">
          <button onClick={async (e) => {
            e.stopPropagation(); setGizli(true);
            if (kullaniciId) { await supabase.from('gizli_ilanlar').upsert({ user_id: kullaniciId, ilan_id: ilan.id }); }
            else { localStorage.setItem(`gizli_misafir_${ilan.id}`, '1'); }
          }} className="w-6 h-6 rounded-full bg-gray-600/70 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-150">
            <X size={12} />
          </button>
          <div className="absolute right-0 top-7 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/gizle:opacity-100 transition-opacity pointer-events-none">
            Bu ilanla ilgilenmiyorum, gizle.
          </div>
        </div>
      )}
      {/* GÖSTER BUTONU */}
      {gizli && (
        <div className="absolute top-1 right-1 z-20">
          <button onClick={async (e) => {
            e.stopPropagation(); setGizli(false);
            if (kullaniciId) { await supabase.from('gizli_ilanlar').delete().eq('user_id', kullaniciId).eq('ilan_id', ilan.id); }
            else { localStorage.removeItem(`gizli_misafir_${ilan.id}`); }
          }} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700/80 hover:bg-gray-900 text-white text-[10px] font-semibold transition">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Göster
          </button>
        </div>
      )}

      {/* Sol renkli şerit — kategori isimli */}
      <div className={`${config.bg} w-20 self-stretch flex-shrink-0 flex items-center justify-center px-1`}>
        <div className="text-white text-center leading-tight">
          <div className="text-[9px] font-bold">{config.label1}</div>
          <div className="text-[9px] font-bold">{config.label2}</div>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 flex items-center gap-2 px-3 py-2 min-w-0 pr-20">
        {icerik}
      </div>

      {/* Sağ: butonlar */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-1 px-2 flex-shrink-0 bg-white border-l border-gray-100">
        <button onClick={e => { e.stopPropagation(); if (telefon) window.open(`https://wa.me/90${telefon.replace(/\D/g,'').replace(/^0/,'')}`, '_blank'); }}
          className="p-1.5 text-[#25D366] hover:bg-green-50 rounded-lg transition">
          <MessageCircle size={14} />
        </button>
        <button onClick={e => { e.stopPropagation(); if (telefon) window.location.href = `tel:${telefon}`; }}
          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
          <Phone size={14} />
        </button>
      </div>
    </div>
  );
}
  return (
  <div
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    onClick={() => { if (!gizli) { ilanGorulduIsaretle(ilan.id); setGoruldu(true); onDetay(ilan); } }}
    className={`relative bg-white border border-gray-200 hover:border-[#f7971e] hover:shadow-sm transition-all duration-150 cursor-pointer rounded overflow-hidden ${gizli ? 'opacity-40 grayscale' : ''}`}
  >
    {/* GİZLE BUTONU */}
{!gizli && hover && (
  <div className="absolute top-1 right-1 z-20 group/gizle">
    <button
      onClick={async (e) => {
  e.stopPropagation();
  setGizli(true);
  if (kullaniciId) {
    const { data, error } = await supabase.from('gizli_ilanlar').upsert({
      user_id: kullaniciId,
      ilan_id: ilan.id,
    });
  } else {
    localStorage.setItem(`gizli_misafir_${ilan.id}`, '1');
  }
}}
      className="w-5 h-5 rounded-full bg-gray-600/70 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-150"
    >
      <X size={10} />
    </button>
    <div className="absolute right-0 top-7 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/gizle:opacity-100 transition-opacity pointer-events-none">
      Bu ilanla ilgilenmiyorum, gizle.
    </div>
  </div>
)}

{/* GÖSTER BUTONU */}
{gizli && (
  <div className="absolute top-1 right-1 z-20">
    <button
      onClick={async (e) => {
  e.stopPropagation();
  setGizli(false);
  if (kullaniciId) {
    await supabase.from('gizli_ilanlar').delete()
      .eq('user_id', kullaniciId)
      .eq('ilan_id', ilan.id);
  } else {
    localStorage.removeItem(`gizli_misafir_${ilan.id}`);
  }
}}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700/80 hover:bg-gray-900 text-white text-[10px] font-semibold transition"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      Göster
    </button>
  </div>
)}
      {/* ÜST BAŞLIK */}
      <div className={`${config.bg} flex items-center justify-between px-4 py-2`}>
        <span className={`text-xs font-bold tracking-wide ${config.text}`}>{config.label}</span>
        <button
  onClick={(e) => { e.stopPropagation(); ilanGorulduIsaretle(ilan.id); setGoruldu(true); onDetay(ilan); }}
  className="text-[11px] font-semibold text-white/90 hover:text-white flex items-center gap-1 transition mr-6"
>
  İlan Detayı <ArrowRight size={11} />
</button>
      </div>

      <div className="px-4 pt-3 pb-2">

        {/* AÇIKLAMA + THUMBNAIL */}
        <div className={`mb-3 flex gap-3 ${resimliKategori && resimler.length > 0 ? '' : ''}`}>
          {/* Sol: thumbnail (sadece resimli kategorilerde) */}
          {resimliKategori && resimler.length > 0 && (
            <IlanThumbnail resimler={resimler} />
          )}

          {/* Sağ: açıklama + favori */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">İlan Başlığı</p>
              {ilan.user_id !== mevcutKullanici()?.id && (
                <button
                  onClick={handleFavori}
                  className={`flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full transition flex-shrink-0 ${
                    isFavori
                      ? 'text-red-500 border-red-300 bg-red-50'
                      : 'text-gray-400 hover:text-red-400 border-gray-200 hover:border-red-300'
                  }`}
                >
                  <Heart size={10} className={isFavori ? 'fill-red-500' : ''} />
                  {isFavori ? 'Favoride' : 'Favoriye Ekle'}
                </button>
              )}
            </div>
            {/* BAŞLIK — açıklama yerine */}
{ilan.baslik ? (
  <p className={`text-sm font-semibold line-clamp-2 leading-snug ${goruldu ? 'text-purple-700' : 'text-[#1a3c6e]'}`}>
    {ilan.baslik}
  </p>
) : (
  <p className="text-xs text-gray-400 italic">Başlık girilmemiş</p>
)}
{/* Araç bilgileri özeti (aracimi_satiyorum için) */}
{ilan.kategori === 'aracimi_satiyorum' && (ekBilgi.marka || ekBilgi.model || ekBilgi.yil) && (
  <p className="text-xs text-gray-500 mt-1 font-medium">
    {[ekBilgi.marka, ekBilgi.model, ekBilgi.yil].filter(Boolean).join(' · ')}
    {ekBilgi.km && <span className="text-gray-400"> · {Number(ekBilgi.km).toLocaleString('tr-TR')} km</span>}
  </p>
)}
            {/* Araç bilgileri özeti (aracimi_satiyorum için) */}
            {ilan.kategori === 'aracimi_satiyorum' && (ekBilgi.marka || ekBilgi.model || ekBilgi.yil) && (
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {[ekBilgi.marka, ekBilgi.model, ekBilgi.yil].filter(Boolean).join(' · ')}
                {ekBilgi.km && <span className="text-gray-400"> · {Number(ekBilgi.km).toLocaleString('tr-TR')} km</span>}
              </p>
            )}
          </div>
        </div>

        {/* Resim yoksa açıklama favori satırı normal */}
        {(!resimliKategori || resimler.length === 0) && ilan.aciklama && (
          <div className="mb-3 -mt-3">
            {/* açıklama zaten yukarıda render edildi, bu blok boş kalır */}
          </div>
        )}

        {/* GÜZERGAH */}
        {ilan.guzergahlar && ilan.guzergahlar.length > 0 && (
          ilan.kategori === 'plaka_satiyorum' || ilan.kategori === 'aracimi_satiyorum' ? (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-600 border-t border-gray-100 pt-2">
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              <span>
                {[
                  ilan.guzergahlar[0].kalkis_mah,
                  ilan.guzergahlar[0].kalkis_ilce,
                  ilan.guzergahlar[0].kalkis_il,
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          ) : (
            <div className="mb-3">
              <GuzergahBasliklari kategori={ilan.kategori} />
              <div className="divide-y divide-gray-50">
                {ilan.guzergahlar.slice(0, 2).map((g, i) => (
                  <GuzergahSatiri key={i} g={g} kategori={ilan.kategori} />
                ))}
              </div>
            </div>
          )
        )}

        {/* AYIRICI */}
        <div className="border-t border-gray-100 my-2" />

        {/* ALT BİLGİLER */}
        <div className="flex flex-wrap items-center justify-between gap-y-1 text-[11px] text-gray-400">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span>İlan Tarihi: <span className="text-gray-600">{tarih}</span></span>
            <span>İlan Veren: <span className="text-gray-600">{ilanVeren}</span></span>
            {ilan.servis_turu && ilan.servis_turu.length > 0 && (
              <span>Servis Türü: <span className="text-gray-600">{ilan.servis_turu.join(', ')}</span></span>
            )}
            {ilan.kategori === 'isim_var_arac' && ekBilgi.km && (
              <span>Toplam KM: <span className="text-gray-600">{ekBilgi.km} km</span></span>
            )}
            {ilan.kategori === 'isim_var_arac' && ekBilgi.servis_suresi && (
              <span>Servis Süresi: <span className="text-gray-600">{ekBilgi.servis_suresi} dk</span></span>
            )}
            {ekBilgi.yas && (
              <span>Yaş: <span className="text-gray-600">{ekBilgi.yas}</span></span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="flex items-center gap-0.5"><Clock size={10} /> {zamanFarki(ilan.created_at)}</span>
          </div>
        </div>
      </div>

      {/* BUTONLAR */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (telefon) window.open(`https://wa.me/90${telefon.replace(/\D/g, '').replace(/^0/, '')}`, '_blank');
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold text-[#25D366] bg-white border border-[#25D366] hover:bg-green-50 transition rounded-lg"
        >
          <MessageCircle size={12} /> WhatsApp
        </button>

        {ekBilgi.ucret ? (
          <div className="text-center">
            <span className="text-sm font-bold text-blue-600">
              {Number(ekBilgi.ucret).toLocaleString('tr-TR')} ₺
            </span>
            <span className="block text-[10px] text-gray-400">
              {ilan.kategori === 'plaka_satiyorum' || ilan.kategori === 'aracimi_satiyorum' ? 'Fiyat' : 'Ücret'}
            </span>
          </div>
        ) : (
          <div />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (telefon) window.location.href = `tel:${telefon}`;
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg"
        >
          <Phone size={12} /> Ara
        </button>
      </div>
    </div>
  );
}
