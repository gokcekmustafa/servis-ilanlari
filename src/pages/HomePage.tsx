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
  const [selectedKategoriler, setSelectedKategoriler] = useState<KategoriType[]>([]);
  const [aktifKategoriler, setAktifKategoriler] = useState<KategoriType[]>([]);
  const [siralama, setSiralama] = useState('yeni');
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);

  useEffect(() => {
    ilanlarıYukle();
    reklamlarıYukle();
    duyuruYukle();
  }, []);

  const ilanlarıYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await ilanlariGetir();
    if (!error && data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const reklamlarıYukle = async () => {
    const { data } = await supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .order('id', { ascending: false });
    if (data) setReklamlar(data);
  };

  const duyuruYukle = async () => {
    const { data } = await supabase
      .from('duyurular')
      .select('*')
      .eq('aktif', true)
      .limit(1)
      .single();
    if (data) {
      setDuyuru(data);
      setTimeout(() => setPopupAcik(true), (data.saniye || 2) * 1000);
    }
  };

  const handleFilter = () => setAktifKategoriler(selectedKategoriler);
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
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  // Reklam: her N ilandan sonra 1 reklam goster
  const REKLAM_ARASI = 8;
  const renderIlanListesi = () => {
    const items: React.ReactNode[] = [];
    filtrelenmisIlanlar.forEach((ilan, index) => {
      items.push(
        <IlanCard key={ilan.id} ilan={ilan} onDetay={onIlanDetay} />
      );
      // Her 8 ilandan sonra reklam ekle
      if (
        (index + 1) % REKLAM_ARASI === 0 &&
        reklamlar.length > 0
      ) {
        const reklam = reklamlar[Math.floor((index + 1) / REKLAM_ARASI - 1) % reklamlar.length];
        items.push(
          
            key={`reklam-${index}`}
            href={reklam.link_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 transition-all"
          >
            <div className="relative">
              <img
                src={reklam.resim_url}
                alt={reklam.baslik || 'Reklam'}
                className="w-full h-[100px] object-cover"
              />
              <span className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded">
                Reklam
              </span>
            </div>
          </a>
        );
      }
    });
    return items;
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <Sidebar
              selectedKategoriler={selectedKategoriler}
              onKategoriChange={setSelectedKategoriler}
              onFilter={handleFilter}
              onClear={handleClear}
              siralama={siralama}
              onSiralamaChange={setSiralama}
            />
          </div>

          {/* Ilan Listesi */}
          <div className="flex-1 min-w-0">

            {/* Sonuc Bari */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Toplam{' '}
                <span className="text-orange-500 font-bold text-base">
                  {filtrelenmisIlanlar.length}
                </span>{' '}
                ilan bulundu
              </span>
              {aktifKategoriler.length > 0 && (
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-full">
                  {aktifKategoriler.length} filtre aktif
                </span>
              )}
            </div>

            {yukleniyor ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"
                  >
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="flex flex-col gap-3">
                {renderIlanListesi()}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <div className="text-5xl mb-4">🚌</div>
                <p className="text-base font-medium">Uygun ilan bulunamadi</p>
                <p className="text-sm mt-2">
                  Filtrelerinizi degistirerek tekrar deneyin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Duyuru */}
      {popupAcik && duyuru && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 relative shadow-xl">
            <button
              onClick={() => setPopupAcik(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
            {duyuru.resim_url && (
              <img
                src={duyuru.resim_url}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-base font-bold text-slate-800 mb-2">
              {duyuru.baslik}
            </h2>
            <p className="text-sm text-slate-500">{duyuru.mesaj}</p>
          </div>
        </div>
      )}
    </div>
  );
}
