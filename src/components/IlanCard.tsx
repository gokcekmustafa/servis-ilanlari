import React from 'react';
import { Calendar, MapPin, Users, Eye, Phone, MessageCircle, CheckCircle, Star, Flame } from 'lucide-react';
import { Ilan, KategoriType } from '../types';

type IlanCardProps = {
  ilan: Ilan;
  onDetay: (ilan: Ilan) => void;
};

// Kategori Etiketleri (Görseldeki gibi renkli)
const badges: Record<KategoriType, { label: string; color: string; bg: string; text: string }> = {
  isim_var_arac:   { label: 'İşim Var Araç Arıyorum', color: 'blue',   bg: 'bg-blue-50', text: 'text-blue-700' },
  aracim_var_is:   { label: 'Araç Arıyorum',          color: 'green',  bg: 'bg-green-50', text: 'text-green-700' }, // Görseldeki ile uyumlu
  sofor_ariyorum:  { label: 'Şoför Aranıyor',         color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700' },
  hostes_ariyorum: { label: 'Hostes Aranıyor',        color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700' },
  hostesim_is:     { label: 'İş Arıyorum',            color: 'pink',   bg: 'bg-pink-50', text: 'text-pink-700' },
  soforum_is:      { label: 'Şoför İş Arıyor',        color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  plaka_satiyorum: { label: 'Plakam Satıyorum',       color: 'red',    bg: 'bg-red-50', text: 'text-red-700' },
};

const plakaSatiyormu = (ilan: Ilan) => ilan.kategori === 'plaka_satiyorum';

export default function IlanCard({ ilan, onDetay }: IlanCardProps) {
  const badge = badges[ilan.kategori] || { label: 'Diğer', color: 'gray', bg: 'bg-gray-50', text: 'text-gray-700' };
  const ucret = ilan.ekbilgiler?.ucret;
  const kapasite = ilan.ekbilgiler?.kapasite || 'Bilinmiyor'; // Örnek alan, veritabanında varsa gelir
  
  // Güzergahtan konum bilgisini çekme (Görseldeki "İstanbul, Kadıköy" gibi)
  const konum = ilan.guzergahlar?.[0] 
    ? `${ilan.guzergahlar[0].kalkis_il}, ${ilan.guzergahlar[0].kalkis_ilce}`
    : 'Konum Belirtilmemiş';

  // İlan verenin baş harfi (Görseldeki yuvarlak avatar için)
  const ilanVeren = ilan.profiles?.full_name || ilan.ilan_veren || 'Bilinmeyen Kullanıcı';
  const basHarf = ilanVeren.charAt(0).toUpperCase();

  // Rastgele değerler (Veritabanında yoksa görsel amaçlı)
  const goruntulenme = Math.floor(Math.random() * 500) + 50; 
  const isVitrin = Math.random() > 0.7; // %30 ihtimalle Vitrin
  const isAcil = !isVitrin && Math.random() > 0.8; // %20 ihtimalle Acil

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative" onClick={() => onDetay(ilan)}>
      
      {/* İLANIN ÜST KISMI (Etiketler ve Fiyat) */}
      <div className="px-5 pt-4 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-50">
        
        {/* Sol Üst: Etiketler (Kategori, Onaylı, Vitrin) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kategori Etiketi */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border border-${badge.color}-100 ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          
          {/* Onaylı Etiketi (Görseldeki gibi mavi tikli) */}
          <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            <CheckCircle size={12} className="text-blue-500" /> Onaylı
          </span>

          {/* Dinamik Etiket (Vitrin veya Acil) */}
          {isVitrin && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-white bg-amber-500 px-2 py-1 rounded-md shadow-sm">
              <Star size={12} fill="currentColor" /> Vitrin
            </span>
          )}
          {isAcil && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-white bg-red-500 px-2 py-1 rounded-md shadow-sm">
              <Flame size={12} fill="currentColor" /> Acil
            </span>
          )}
        </div>

        {/* Sağ Üst: Fiyat (Görseldeki gibi büyük ve kalın) */}
        {ucret && (
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-bold text-gray-900">
              {Number(ucret).toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-xs text-gray-500 ml-1">/ay</span>
          </div>
        )}
      </div>

      {/* İLANIN ORTA KISMI (Başlık, Açıklama, İkonlu Bilgiler) */}
      <div className="px-5 py-3 flex-1 flex flex-col gap-2">
        
        {/* Başlık (Görseldeki gibi kalın ve siyah) */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {/* Veritabanında ayrı bir 'baslik' alanı yoksa açıklamayı başlık gibi kırpıp kullanıyoruz */}
          {ilan.aciklama ? ilan.aciklama.substring(0, 60) + (ilan.aciklama.length > 60 ? '...' : '') : 'Detaylı İlan Bilgisi'}
        </h3>
        
        {/* Açıklama (İnce ve gri) */}
        {ilan.aciklama && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {ilan.aciklama}
          </p>
        )}

        {/* İkonlu Bilgi Satırı (Konum, Kapasite, Araç, Görüntülenme, Tarih) */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-1 text-[11px] font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-blue-500" /> {konum}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-gray-400" /> {kapasite}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={13} className="text-gray-400" /> {goruntulenme}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" /> {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
          </span>
        </div>

        {/* Ekstra Özellik Etiketleri (Görseldeki Klima, USB Şarj gibi) */}
        {ilan.servis_turu && ilan.servis_turu.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ilan.servis_turu.map((ozellik, idx) => (
              <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-sm">
                {ozellik}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* İLANIN ALT KISMI (Kullanıcı Bilgisi ve Butonlar) */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        
        {/* Kullanıcı Avatarı ve Adı */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {basHarf}
          </div>
          <span className="text-xs font-medium text-gray-700">{ilanVeren}</span>
        </div>

        {/* WhatsApp ve Ara Butonları (Görseldeki gibi yeşil ve lacivert) */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); /* WhatsApp linki eklenecek */ }}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition shadow-sm"
          >
            <MessageCircle size={13} /> WhatsApp
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); /* Tel linki eklenecek */ }}
            className="flex items-center gap-1.5 bg-[#1e3a8a] hover:bg-[#172b66] text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition shadow-sm"
          >
            <Phone size={13} /> Ara
          </button>
        </div>

      </div>

    </div>
  );
}
