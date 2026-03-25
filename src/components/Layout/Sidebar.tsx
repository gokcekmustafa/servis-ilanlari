import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { KategoriType, Ilan } from '../../types';

type SidebarProps = {
  selectedKategoriler: KategoriType[];
  onKategoriChange: (kategoriler: KategoriType[]) => void;
  onFilter: () => void;
  onClear: () => void;
  siralama: string;
  onSiralamaChange: (value: string) => void;
  ilanlar: Ilan[];
  selectedSehir: string;
  onSehirChange: (sehir: string) => void;
  selectedIlce: string;
  onIlceChange: (ilce: string) => void;
  selectedYaka: string;
  onYakaChange: (yaka: string) => void;
};

const tumKategoriler = [
  { kategori: 'isim_var_arac' as KategoriType, label: 'İşim Var Araç Arıyorum' },
  { kategori: 'aracim_var_is' as KategoriType, label: 'Aracım Var İş Arıyorum' },
  { kategori: 'sofor_ariyorum' as KategoriType, label: 'Şoför Arıyorum' },
  { kategori: 'soforum_is' as KategoriType, label: 'Şoför İş Arıyor' },
  { kategori: 'hostes_ariyorum' as KategoriType, label: 'Hostes Arıyorum' },
  { kategori: 'hostesim_is' as KategoriType, label: 'Hostesim İş Arıyor' },
  { kategori: 'plaka_satiyorum' as KategoriType, label: 'Plaka Satıyorum' },
];

export default function Sidebar({
  selectedKategoriler,
  onKategoriChange,
  onFilter,
  onClear,
  siralama,
  onSiralamaChange,
  ilanlar,
  selectedSehir,
  onSehirChange,
  selectedIlce,
  onIlceChange,
  selectedYaka,
  onYakaChange,
}: SidebarProps) {
  // Akordeon menülerin açık/kapalı durumları
  const [kategoriAcik, setKategoriAcik] = useState(true);
  const [konumAcik, setKonumAcik] = useState(true);
  const [ekFiltrelerAcik, setEkFiltrelerAcik] = useState(false);

  // Kategori sayısını hesaplama
  const kategoriSayisi = (kategori: KategoriType) =>
    ilanlar.filter((i) => i.kategori === kategori).length;

  const toplamIlanSayisi = ilanlar.length;

  // Şehirleri ve ilçeleri hesaplama
  const sehirler = useMemo(() => {
    const sayac: Record<string, number> = {};
    ilanlar.forEach((ilan) => {
      ilan.guzergahlar.forEach((g) => {
        if (g.kalkis_il) sayac[g.kalkis_il] = (sayac[g.kalkis_il] || 0) + 1;
      });
    });
    return Object.keys(sayac).sort();
  }, [ilanlar]);

  const ilceler = useMemo(() => {
    if (!selectedSehir) return [];
    const sayac: Record<string, number> = {};
    ilanlar.forEach((ilan) => {
      ilan.guzergahlar.forEach((g) => {
        if (g.kalkis_il === selectedSehir && g.kalkis_ilce) {
          sayac[g.kalkis_ilce] = (sayac[g.kalkis_ilce] || 0) + 1;
        }
      });
    });
    return Object.keys(sayac).sort();
  }, [ilanlar, selectedSehir]);

  return (
    <aside className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Üst Başlık */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
        <Filter size={16} className="text-gray-500" />
        <span className="font-semibold text-gray-700">Filtrele</span>
      </div>

      {/* 1. KATEGORİ BÖLÜMÜ */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setKategoriAcik(!kategoriAcik)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <span className="text-sm font-semibold text-gray-800">Kategori</span>
          {kategoriAcik ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        
        {kategoriAcik && (
          <div className="pb-3 px-2">
            {/* Tüm Kategoriler Butonu */}
            <div
              onClick={() => onKategoriChange([])}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition mb-1 ${
                selectedKategoriler.length === 0 ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">Tüm Kategoriler</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${selectedKategoriler.length === 0 ? 'bg-blue-100' : 'bg-gray-100 text-gray-500'}`}>
                {toplamIlanSayisi}
              </span>
            </div>

            {/* Alt Kategoriler */}
            {tumKategoriler.map((item) => {
              const sayi = kategoriSayisi(item.kategori);
              const isSelected = selectedKategoriler.includes(item.kategori);
              
              if (sayi === 0) return null; // İlanı olmayan kategoriyi gizle (daha temiz görünür)

              return (
                <div
                  key={item.kategori}
                  onClick={() => onKategoriChange([item.kategori])} // Tekli seçim mantığı (Sahibinden gibi)
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition ${
                    isSelected ? 'bg-blue-50/50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm ml-2">- {item.label}</span>
                  <span className="text-xs text-gray-400">{sayi}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. KONUM BÖLÜMÜ */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setKonumAcik(!konumAcik)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <span className="text-sm font-semibold text-gray-800">Konum</span>
          {konumAcik ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {konumAcik && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            {/* Şehir Seçimi */}
            <div>
              <select
                value={selectedSehir}
                onChange={(e) => {
                  onSehirChange(e.target.value);
                  onIlceChange('');
                  onYakaChange('');
                }}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              >
                <option value="">Tüm Şehirler</option>
                {sehirler.map((sehir) => (
                  <option key={sehir} value={sehir}>{sehir}</option>
                ))}
              </select>
            </div>

            {/* İlçe Seçimi (Sadece şehir seçiliyse görünür) */}
            {selectedSehir && ilceler.length > 0 && (
              <div>
                <select
                  value={selectedIlce}
                  onChange={(e) => onIlceChange(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Tüm İlçeler</option>
                  {ilceler.map((ilce) => (
                    <option key={ilce} value={ilce}>{ilce}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Yaka Seçimi (Sadece İstanbul seçiliyse görünür) */}
            {selectedSehir === 'Istanbul' && (
              <div>
                <select
                  value={selectedYaka}
                  onChange={(e) => { onYakaChange(e.target.value); onIlceChange(''); }}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Tüm Yakalar</option>
                  <option value="avrupa">Avrupa Yakası</option>
                  <option value="anadolu">Anadolu Yakası</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. EK FİLTRELER (Şimdilik Görsel Amaçlı Placeholder) */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setEkFiltrelerAcik(!ekFiltrelerAcik)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <span className="text-sm font-semibold text-gray-800">Ek Filtreler</span>
          {ekFiltrelerAcik ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {ekFiltrelerAcik && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500">Yakında eklenecek...</p>
          </div>
        )}
      </div>

      {/* BUTONLAR */}
      <div className="p-4 bg-gray-50 mt-auto flex flex-col gap-2">
        <button
          onClick={onFilter}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-semibold text-sm transition shadow-sm"
        >
          Aramayı Daralt
        </button>
        <button
          onClick={onClear}
          className="w-full bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 py-2 rounded-md font-medium text-sm transition"
        >
          Seçimleri Temizle
        </button>
      </div>
    </aside>
  );
}
