import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';

export default function HomePage({
  onGoLogin,
  onIlanDetay,
}: {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selectedKategoriler, setSelectedKategoriler] = useState<
    KategoriType[]
  >([]);
  const [aktifKategoriler, setAktifKategoriler] = useState<KategoriType[]>([]);
  const [siralama, setSiralama] = useState('yeni');

  // 🔹 YENİ STATE'LER
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [aktifSlide, setAktifSlide] = useState(0);
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);

  useEffect(() => {
    ilanlarıYukle();
    reklamlarıYukle();
    duyuruYukle();
  }, []);

  // 🔹 SLIDER AUTO PLAY
  useEffect(() => {
    if (reklamlar.length === 0) return;

    const interval = setInterval(() => {
      setAktifSlide((prev) =>
        prev === reklamlar.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [reklamlar]);

  const ilanlarıYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await ilanlariGetir();
    if (!error && data) {
      setIlanlar(data as Ilan[]);
    }
    setYukleniyor(false);
  };

  // 🔹 REKLAMLAR
  const reklamlarıYukle = async () => {
    const { data } = await supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .order('id', { ascending: false });

    if (data) setReklamlar(data);
  };

  // 🔹 DUYURU
  const duyuruYukle = async () => {
    const { data } = await supabase
      .from('duyurular')
      .select('*')
      .eq('aktif', true)
      .limit(1)
      .single();

    if (data) {
      setDuyuru(data);

      setTimeout(() => {
        setPopupAcik(true);
      }, (data.saniye || 2) * 1000);
    }
  };

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
      if (siralama === 'yeni') {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* 🔥 BANNER SLIDER */}
      {reklamlar.length > 0 && (
        <div className="relative mb-6 overflow-hidden rounded-xl shadow-lg">
          {reklamlar.map((item, index) => (
            <div
              key={item.id}
              className={`transition-all duration-700 ${
                index === aktifSlide ? 'block' : 'hidden'
              }`}
            >
              <a href={item.link_url || '#'} target="_blank">
                <img
                  src={item.resim_url}
                  className="w-full h-[220px] object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8">
                  <h2 className="text-white text-2xl font-bold">
                    {item.baslik}
                  </h2>
                  <p className="text-gray-200 text-sm mt-1">
                    {item.alt_baslik}
                  </p>
                </div>
              </a>
            </div>
          ))}

          {/* DOTS */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {reklamlar.map((_, i) => (
              <div
                key={i}
                onClick={() => setAktifSlide(i)}
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  i === aktifSlide ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
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

        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
            <span className="font-medium text-gray-700 text-sm">
              Toplam{' '}
              <span className="text-[#1a3c6e] font-bold">
                {filtrelenmisIlanlar.length}
              </span>{' '}
              Adet İlan Bulundu
            </span>
            {aktifKategoriler.length > 0 && (
              <span className="text-xs text-gray-500">
                Filtre aktif: {aktifKategoriler.length} kategori
              </span>
            )}
          </div>

          {yukleniyor ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filtrelenmisIlanlar.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filtrelenmisIlanlar.map((ilan) => (
                <IlanCard key={ilan.id} ilan={ilan} onDetay={onIlanDetay} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🚌</div>
              <p className="text-lg font-medium">Uygun ilan bulunamadi</p>
              <p className="text-sm mt-2">
                Filtrelerinizi degistirerek tekrar deneyin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 POPUP DUYURU */}
      {popupAcik && duyuru && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setPopupAcik(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              ✕
            </button>

            {duyuru.resim_url && (
              <img
                src={duyuru.resim_url}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            <h2 className="text-lg font-bold mb-2">{duyuru.baslik}</h2>
            <p className="text-sm text-gray-600">{duyuru.mesaj}</p>
          </div>
        </div>
      )}
    </div>
  );
}
