import React from 'react';
import { KategoriType } from '../../types';

type SidebarProps = {
  selectedKategoriler: KategoriType[];
  onKategoriChange: (kategoriler: KategoriType[]) => void;
  onFilter: () => void;
  onClear: () => void;
  siralama: string;
  onSiralamaChange: (value: string) => void;
};

const tumKategoriler = [
  { kategori: 'isim_var_arac' as KategoriType, label: 'Isim Var Arac Ariyorum', sayi: 84 },
  { kategori: 'aracim_var_is' as KategoriType, label: 'Aracim Var Is Ariyorum', sayi: 41 },
  { kategori: 'sofor_ariyorum' as KategoriType, label: 'Sofor Ariyorum', sayi: 22 },
  { kategori: 'hostes_ariyorum' as KategoriType, label: 'Hostes Ariyorum', sayi: 8 },
  { kategori: 'hostesim_is' as KategoriType, label: 'Hostesim Is Ariyorum', sayi: 5 },
  { kategori: 'soforum_is' as KategoriType, label: 'Soforum Is Ariyorum', sayi: 12 },
  { kategori: 'plaka_satiyorum' as KategoriType, label: 'Plakam Satiyorum', sayi: 3 },
];

export default function Sidebar({
  selectedKategoriler,
  onKategoriChange,
  onFilter,
  onClear,
  siralama,
  onSiralamaChange,
}: SidebarProps) {
  const handleCheckbox = (kategori: KategoriType) => {
    if (selectedKategoriler.includes(kategori)) {
      onKategoriChange(selectedKategoriler.filter((k) => k !== kategori));
    } else {
      onKategoriChange([...selectedKategoriler, kategori]);
    }
  };

  const handleHizliTik = (kategori: KategoriType) => {
    onKategoriChange([kategori]);
    onFilter();
  };

  return (
    <aside className="w-full flex flex-col gap-3">

      {/* KATEGORİ FİLTRE */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">Ilan Kategorisi</span>
          {selectedKategoriler.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium transition"
            >
              Temizle
            </button>
          )}
        </div>
        <div className="py-1">
          {tumKategoriler.map((item) => (
            <label
              key={item.kategori}
              className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedKategoriler.includes(item.kategori)}
                  onChange={() => handleCheckbox(item.kategori)}
                  className="accent-orange-500 w-3.5 h-3.5"
                />
                <span className={
                  'text-xs transition ' +
                  (selectedKategoriler.includes(item.kategori)
                    ? 'text-orange-600 font-semibold'
                    : 'text-gray-600 group-hover:text-gray-800')
                }>
                  {item.label}
                </span>
              </div>
              <span className="text-xs text-gray-400">{item.sayi}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SIRALAMA */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">Siralama</span>
        </div>
        <div className="py-1">
          {[
            { val: 'yeni', label: 'Once En Yeni' },
            { val: 'eski', label: 'Once En Eski' },
          ].map((item) => (
            <label
              key={item.val}
              className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name="siralama"
                checked={siralama === item.val}
                onChange={() => onSiralamaChange(item.val)}
                className="accent-orange-500 w-3.5 h-3.5"
              />
              <span className={
                'text-xs transition ' +
                (siralama === item.val ? 'text-orange-600 font-semibold' : 'text-gray-600')
              }>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* HIZLI ARAMA BUTONLARI */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">Hizli Filtre</span>
        </div>
        <div className="p-3 flex flex-col gap-1.5">
          {tumKategoriler.map((item) => (
            <button
              key={item.kategori}
              onClick={() => handleHizliTik(item.kategori)}
              className={
                'w-full text-left text-xs px-3 py-2 rounded-md transition font-medium ' +
                (selectedKategoriler.length === 1 && selectedKategoriler[0] === item.kategori
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600')
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* FİLTRELE BUTONU */}
      <button
        onClick={onFilter}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition"
      >
        Filtrele
      </button>
      <button
        onClick={onClear}
        className="w-full bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 py-2 rounded-lg font-medium text-sm transition"
      >
        Filtreleri Temizle
      </button>

    </aside>
  );
}
