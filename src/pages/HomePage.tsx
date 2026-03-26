import React, { useState, useEffect } from 'react';
import CategoryCards from '../components/CategoryCards';
import ImprovedSidebar from '../components/Layout/ImprovedSidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { SlidersHorizontal, X } from 'lucide-react';

const REKLAM_ARASI = 2;

export default function HomePage({ onGoLogin, onIlanDetay }: {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);
  const [aktifKategori, setAktifKategori] = useState<KategoriType | null>(null);
  
  const [selectedSehir, setSelectedSehir] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [selectedYaka, setSelectedYaka] = useState('');
  const [aktifSehir, setAktifSehir] = useState('');
  const [aktifIlce, setAktifIlce] = useState('');
  const [aktifYaka, setAktifYaka] = useState('');
  
  const [siralama, setSiralama] = useState('yeni');
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);
  const [filtreAcik, setFiltreAcik] = useState(false);

  useEffect(() => {
    ilanlarYukle();
    reklamlariYukle();
    duyuruYukle();
  }, []);

  const ilanlarYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await ilanlariGetir();
    if (!error && data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const reklamlariYukle = async () => {
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
    if (data) setDuyuru(data);
  };

  const handleFilter = () => {
    setAktifKategori(selectedKategori);
    setAktifSehir(selectedSehir);
    setAktifIlce(selectedIlce);
    setAktifYaka(selectedYaka);
    setFiltreAcik(false);
  };

  const handleClear = () => {
    setSelectedKategori(null);
    setAktifKategori(null);
    setSelectedSehir('');
    setAktifSehir('');
    setSelectedIlce('');
    setAktifIlce('');
    setSelectedYaka('');
    setAktifYaka('');
    setSiralama('yeni');
  };

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      if (aktifKategori && ilan.kategori !== aktifKategori) return false;
      if (aktifSehir) {
        const sehirVar = ilan.guzergahlar.some((g) => g.kalkis_il === aktifSehir);
        if (!sehirVar) return false;
      }
      if (aktifIlce) {
        const ilceVar = ilan.guzergahlar.some((g) => g.kalkis_ilce === aktifIlce);
        if (!ilceVar) return false;
      }
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const aktivFiltreVar = !!aktifKategori || !!aktifSehir || !!aktifIlce || !!aktifYaka;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        {/* Kategori Kartları */}
        <CategoryCards
          ilanlar={ilanlar}
          selectedKategori={selectedKategori}
          onCategorySelect={setSelectedKategori}
        />

        {/* Mobil Filtre Butonu */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button
            onClick={() => setFiltreAcik(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
          >
            <SlidersHorizontal size={16} /> Filtrele
          </button>
          {aktivFiltreVar && (
            <button
              onClick={handleClear}
              className="px-4 flex items-center gap-1 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              <X size={16} /> Temizle
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ImprovedSidebar
              selectedKategoriler={selectedKategori ? [selectedKategori] : []}
              selectedSehir={selectedSehir}
              selectedIlce={selectedIlce}
              selectedYaka={selectedYaka}
              onSehirChange={setSelectedSehir}
              onIlceChange={setSelectedIlce}
              onYakaChange={setSelectedYaka}
              onFilter={handleFilter}
              onClear={handleClear}
              ilanlar={ilanlar}
            />
          </div>

          {/* Ana İçerik */}
          <div className="flex-1 min-w-0">
            {/* Aktif Filtreler */}
            {aktivFiltreVar && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Aktif Filtreler:</span>
                {/* Kategori Badge */}
                {aktifKategori && (
                  <div className="flex items-center gap-2 bg-white border border-orange-300 rounded-full px-3 py-1.5">
                    <span className="text-sm text-gray-700 font-medium">{aktifKategori}</span>
                    <button
                      onClick={() => setAktifKategori(null)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {/* Konum Badge */}
                {(aktifSehir || aktifIlce || aktifYaka) && (
                  <div className="flex items-center gap-2 bg-white border border-orange-300 rounded-full px-3 py-1.5">
                    <span className="text-sm text-gray-700 font-medium">
                      {aktifIlce || aktifSehir}
                    </span>
                    <button
                      onClick={() => {
                        setAktifSehir('');
                        setAktifIlce('');
                        setAktifYaka('');
                      }}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleClear}
                  className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}

            {/* Sıralama Çubuğu */}
            <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                <span className="text-orange-600">{filtrelenmisIlanlar.length}</span> ilan bulundu
              </span>
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="yeni">Önce En Yeni</option>
                <option value="eski">Önce En Eski</option>
              </select>
            </div>

            {/* İlanlar Listesi */}
            {yukleniyor ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 animate-pulse border border-gray-200"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="space-y-3">
                {filtrelenmisIlanlar.map((ilan) => (
                  <IlanCard
                    key={ilan.id}
                    ilan={ilan}
                    onDetay={() => onIlanDetay(ilan)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <div className="text-5xl mb-4">🚌</div>
                <p className="text-base font-medium text-gray-800">Uygun ilan bulunamadı</p>
                <p className="text-sm text-gray-500 mt-2">
                  Filtrelerinizi değiştirerek tekrar deneyin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobil Filtre Drawer */}
      {filtreAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/40" onClick={() => setFiltreAcik(false)} />
          <div className="bg-white rounded-t-3xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-semibold text-gray-800">Filtreleri Ayarla</h3>
              <button
                onClick={() => setFiltreAcik(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <ImprovedSidebar
                selectedKategoriler={selectedKategori ? [selectedKategori] : []}
                selectedSehir={selectedSehir}
                selectedIlce={selectedIlce}
                selectedYaka={selectedYaka}
                onSehirChange={setSelectedSehir}
                onIlceChange={setSelectedIlce}
                onYakaChange={setSelectedYaka}
                onFilter={handleFilter}
                onClear={handleClear}
                ilanlar={ilanlar}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
