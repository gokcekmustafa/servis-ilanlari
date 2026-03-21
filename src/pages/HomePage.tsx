import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage({
  onGoLogin,
  onIlanDetay,
}: {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}) {
  // --- STATE (DURUM) TANIMLAMALARI ---
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [aktifDuyuru, setAktifDuyuru] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selectedKategoriler, setSelectedKategoriler] = useState<KategoriType[]>([]);
  const [aktifKategoriler, setAktifKategoriler] = useState<KategoriType[]>([]);
  const [siralama, setSiralama] = useState('yeni');
  const [aktifSliderIndex, setAktifSliderIndex] = useState(0);

  // --- VERİ YÜKLEME ---
  useEffect(() => {
    verileriYukle();
  }, []);

  const verileriYukle = async () => {
    setYukleniyor(true);
    
    // 1. İlanları Getir
    const { data: ilanData, error: ilanError } = await ilanlariGetir();
    if (!ilanError && ilanData) {
      setIlanlar(ilanData as Ilan[]);
    }

    // 2. Reklam/Banner Verilerini Getir
    const { data: reklamData } = await supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .order('sira', { ascending: true });
    if (reklamData) setReklamlar(reklamData);

    // 3. Duyuru/Popup Verilerini Getir
    const { data: duyuruData } = await supabase
      .from('duyurular')
      .select('*')
      .eq('aktif', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (duyuruData && duyuruData.length > 0) {
      // Eğer kullanıcı bu oturumda popup'ı henüz kapatmadıysa göster
      const popupKapatildi = sessionStorage.getItem(`popup_kapali_${duyuruData[0].id}`);
      if (!popupKapatildi) {
        setAktifDuyuru(duyuruData[0]);
      }
    }

    setYukleniyor(false);
  };

  // --- SLIDER OTOMATİK GEÇİŞ SİSTEMİ ---
  useEffect(() => {
    if (reklamlar.length > 1) {
      const interval = setInterval(() => {
        setAktifSliderIndex((prev) => (prev === reklamlar.length - 1 ? 0 : prev + 1));
      }, 5000); // 5 saniyede bir değişir
      return () => clearInterval(interval);
    }
  }, [reklamlar]);

  // --- FİLTRELEME VE SIRALAMA MANTIĞI ---
  const handleFilter = () => {
    setAktifKategoriler(selectedKategoriler);
  };

  const handleClear = () => {
    setSelectedKategoriler([]);
    setAktifKategoriler([]);
    setSiralama('yeni');
  };

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      if (aktifKategoriler.length === 0) return true;
      return aktifKategoriler.includes(ilan.kategori);
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      if (siralama === 'yeni') return timeB - timeA;
      return timeA - timeB;
    });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      
      {/* 1. DİNAMİK BANNER (SLIDER) - TASIMACILAR TARZI */}
      {reklamlar.length > 0 && (
        <div className="relative h-[250px] md:h-[400px] w-full overflow-hidden bg-blue-900">
          {reklamlar.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === aktifSliderIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {banner.resim_url && (
                <img src={banner.resim_url} className="w-full h-full object-cover opacity-60" alt={banner.baslik} />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                <div className="max-w-4xl space-y-3 md:space-y-5">
                  <h2 className="text-2xl md:text-5xl font-black text-white drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                    {banner.baslik}
                  </h2>
                  <p className="text-sm md:text-xl text-orange-400 font-bold drop-shadow-md">
                    {banner.alt_baslik}
                  </p>
                  {banner.link_url && (
                    <a 
                      href={banner.link_url} 
                      className="inline-block mt-4 px-6 md:px-10 py-3 bg-orange-500 text-white font-black rounded-xl shadow-lg hover:scale-105 transition transform"
                    >
                      HEMEN İNCELE
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider Noktaları */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {reklamlar.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setAktifSliderIndex(i)} 
                className={`h-2 rounded-full transition-all ${i === aktifSliderIndex ? 'bg-orange-500 w-8' : 'bg-white/50 w-2'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. ANA İÇERİK ALANI (Sidebar + İlanlar) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sol Panel: Filtreler */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Sidebar
              selectedKategoriler={selectedKategoriler}
              onKategoriChange={setSelectedKategoriler}
              onFilter={handleFilter}
              onClear={handleClear}
              siralama={siralama}
              onSiralamaChange={setSiralama}
            />
          </div>

          {/* Sağ Panel: İlan Listesi */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border p-4 mb-6 flex items-center justify-between shadow-sm">
              <span className="font-bold text-gray-700 text-sm">
                Toplam <span className="text-blue-900">{filtrelenmisIlanlar.length}</span> Adet İlan Bulundu
              </span>
              {aktifKategoriler.length > 0 && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-black uppercase">
                  Filtre Aktif
                </span>
              )}
            </div>

            {yukleniyor ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-32" />
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtrelenmisIlanlar.map((ilan) => (
                  <IlanCard key={ilan.id} ilan={ilan} onDetay={onIlanDetay} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed">
                <div className="text-6xl mb-4">🚌</div>
                <p className="text-lg font-black text-blue-900">Aradığınız kriterlerde ilan bulunamadı</p>
                <p className="text-sm text-gray-400 mt-2">Filtreleri temizleyerek tekrar deneyebilirsiniz.</p>
                <button onClick={handleClear} className="mt-6 text-blue-600 font-bold hover:underline">Filtreleri Temizle</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. POPUP DUYURU MODALI */}
      {aktifDuyuru && (
        <div 
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => {
            setAktifDuyuru(null);
            sessionStorage.setItem(`popup_kapali_${aktifDuyuru.id}`, 'true');
          }}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapatma Butonu */}
            <button 
              onClick={() => {
                setAktifDuyuru(null);
                sessionStorage.setItem(`popup_kapali_${aktifDuyuru.id}`, 'true');
              }}
              className="absolute top-5 right-5 p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Duyuru Resmi (Eğer Varsa) */}
            {aktifDuyuru.resim_url && (
              <img src={aktifDuyuru.resim_url} className="w-full h-56 object-cover" alt="Duyuru" />
            )}

            {/* Duyuru Metni */}
            <div className="p-10 text-center">
              <h3 className="text-2xl font-black text-blue-900 mb-4">{aktifDuyuru.baslik}</h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                {aktifDuyuru.mesaj}
              </p>
              <button 
                onClick={() => {
                  setAktifDuyuru(null);
                  sessionStorage.setItem(`popup_kapali_${aktifDuyuru.id}`, 'true');
                }}
                className="px-12 py-4 bg-blue-900 text-white font-black rounded-2xl shadow-xl hover:bg-blue-800 transition transform hover:scale-105"
              >
                KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
