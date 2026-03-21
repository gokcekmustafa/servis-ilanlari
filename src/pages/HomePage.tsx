import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

export default function HomePage({
  onGoLogin,
  onIlanDetay,
}: {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [aktifDuyuru, setAktifDuyuru] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selectedKategoriler, setSelectedKategoriler] = useState<KategoriType[]>([]);
  const [aktifKategoriler, setAktifKategoriler] = useState<KategoriType[]>([]);
  const [siralama, setSiralama] = useState('yeni');
  const [aktifSliderIndex, setAktifSliderIndex] = useState(0);

  useEffect(() => {
    verileriYukle();
  }, []);

  const verileriYukle = async () => {
    setYukleniyor(true);
    // İlanları çek
    const { data: ilanData } = await ilanlariGetir();
    if (ilanData) setIlanlar(ilanData as Ilan[]);

    // Reklamları (Banner) çek
    const { data: reklamData } = await supabase.from('reklamlar').select('*').eq('aktif', true).order('sira');
    if (reklamData) setReklamlar(reklamData);

    // Duyuruları (Popup) çek
    const { data: duyuruData } = await supabase.from('duyurular').select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(1);
    if (duyuruData && duyuruData.length > 0) {
      // Daha önce kapatılmadıysa göster
      const isClosed = sessionStorage.getItem(`popup_${duyuruData[0].id}`);
      if (!isClosed) setAktifDuyuru(duyuruData[0]);
    }
    setYukleniyor(false);
  };

  // Otomatik Slider Geçişi
  useEffect(() => {
    if (reklamlar.length > 1) {
      const interval = setInterval(() => {
        setAktifSliderIndex(prev => (prev === reklamlar.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reklamlar]);

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => aktifKategoriler.length === 0 || aktifKategoriler.includes(ilan.kategori))
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return siralama === 'yeni' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="w-full">
      {/* 1. DİNAMİK BANNER SLIDER (TASIMACILAR TARZI) */}
      {reklamlar.length > 0 && (
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden bg-blue-900">
          {reklamlar.map((item, idx) => (
            <div 
              key={item.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === aktifSliderIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={item.resim_url} className="w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                 <div className="max-w-3xl space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-xl animate-in fade-in slide-in-from-bottom-4">{item.baslik}</h2>
                    <p className="text-lg md:text-xl text-orange-400 font-bold drop-shadow-md">{item.alt_baslik}</p>
                    {item.link_url && (
                      <a href={item.link_url} className="inline-block mt-4 px-8 py-3 bg-orange-500 text-white font-black rounded-xl shadow-lg hover:scale-105 transition">İNCELE</a>
                    )}
                 </div>
              </div>
            </div>
          ))}
          {/* Slider Noktaları */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {reklamlar.map((_, i) => (
              <button key={i} onClick={() => setAktifSliderIndex(i)} className={`w-3 h-3 rounded-full transition-all ${i === aktifSliderIndex ? 'bg-orange-500 w-8' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>
      )}

      {/* 2. ANA İÇERİK (FİLTRELER VE İLANLAR) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <Sidebar
              selectedKategoriler={selectedKategoriler}
              onKategoriChange={setSelectedKategoriler}
              onFilter={() => setAktifKategoriler(selectedKategoriler)}
              onClear={() => { setSelectedKategoriler([]); setAktifKategoriler([]); setSiralama('yeni'); }}
              siralama={siralama}
              onSiralamaChange={setSiralama}
            />
          </div>

          <div className="flex-1">
            <div className="bg-white border p-4 rounded-2xl mb-6 flex justify-between items-center shadow-sm">
              <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">
                Toplam <span className="text-blue-900">{filtrelenmisIlanlar.length}</span> İlan Yayınlanıyor
              </span>
            </div>

            {yukleniyor ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtrelenmisIlanlar.map(ilan => (
                  <IlanCard key={ilan.id} ilan={ilan} onDetay={onIlanDetay} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                <p className="text-gray-400 font-bold">Aradığınız kriterlerde ilan bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. POPUP DUYURU SİSTEMİ */}
      {aktifDuyuru && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
          onClick={() => { setAktifDuyuru(null); sessionStorage.setItem(`popup_${aktifDuyuru.id}`, 'true'); }}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => { setAktifDuyuru(null); sessionStorage.setItem(`popup_${aktifDuyuru.id}`, 'true'); }}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition z-10"
            >
              <X size={20} />
            </button>
            {aktifDuyuru.resim_url && (
              <img src={aktifDuyuru.resim_url} className="w-full h-48 object-cover" alt="" />
            )}
            <div className="p-8 text-center">
               <h3 className="text-2xl font-black text-blue-900 mb-4">{aktifDuyuru.baslik}</h3>
               <p className="text-gray-600 leading-relaxed mb-6">{aktifDuyuru.mesaj}</p>
               <button 
                onClick={() => { setAktifDuyuru(null); sessionStorage.setItem(`popup_${aktifDuyuru.id}`, 'true'); }}
                className="px-10 py-3 bg-blue-900 text-white font-bold rounded-xl"
               >
                 Anladım
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
