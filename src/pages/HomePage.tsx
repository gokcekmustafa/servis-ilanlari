import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';

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

  useEffect(() => {
    ilanlarıYukle();
  }, []);

  const ilanlarıYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await ilanlariGetir();
    if (!error && data) {
      setIlanlar(data as Ilan[]);
    }
    setYukleniyor(false);
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
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-64 flex-shrink-0">
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
    </div>
  );
}
