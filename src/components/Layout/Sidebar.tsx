import React from 'react';
import { KategoriType } from '../../types';

interface SidebarProps {
  selectedKategoriler: KategoriType[];
  onKategoriChange: (kategoriler: KategoriType[]) => void;
  onFilter: () => void;
  onClear: () => void;
  siralama: string;
  onSiralamaChange: (value: string) => void;
}

const hizliButonlar = [
  { kategori: 'isim_var_arac' as KategoriType, label: 'Isim Var Arac Ariyorum', color: 'bg-blue-600 hover:bg-blue-700' },
  { kategori: 'aracim_var_is' as KategoriType, label: 'Aracim Var Is Ariyorum', color: 'bg-green-600 hover:bg-green-700' },
  { kategori: 'sofor_ariyorum' as KategoriType, label: 'Sofor Ariyorum', color: 'bg-orange-500 hover:bg-orange-600' },
  { kategori: 'hostes_ariyorum' as KategoriType, label: 'Hostes Ariyorum', color: 'bg-purple-600 hover:bg-purple-700' },
  { kategori: 'hostesim_is' as KategoriType, label: 'Hostesim Is Ariyorum', color: 'bg-pink-600 hover:bg-pink-700' },
  { kategori: 'soforum_is' as KategoriType, label: 'Soforum Is Ariyorum', color: 'bg-yellow-600 hover:bg-yellow-700' },
];

const tumKategoriler = [
  { kategori: 'isim_var_arac' as KategoriType, label: 'Isim Var Arac Ariyorum' },
  { kategori: 'aracim_var_is' as KategoriType, label: 'Aracim Var Is Ariyorum' },
  { kategori: 'sofor_ariyorum' as KategoriType, label: 'Sofor Ariyorum' },
  { kategori: 'hostes_ariyorum' as KategoriType, label: 'Hostes Ariyorum' },
  { kategori: 'hostesim_is' as KategoriType, label: 'Hostesim Is Ariyorum' },
  { kategori: 'soforum_is' as KategoriType, label: 'Soforum Is Ariyorum' },
  { kategori: 'plaka_satiyorum' as KategoriType, label: 'Plakam Satiyorum' },
];

export default function Sidebar({
  selectedKategoriler,
  onKategoriChange,
  onFilter,
  onClear,
  siralama,
  onSiralamaChange,
}: SidebarProps) {
  const handleHizliButon = (kategori: KategoriType) => {
    onKategoriChange([kategori]);
    onFilter();
  };

  const handleCheckbox = (kategori: KategoriType) => {
    if (selectedKategoriler.includes(kategori)) {
      onKategoriChange(selectedKategoriler.filter((k) => k !== kategori));
    } else {
      onKategoriChange([...selectedKategoriler, kategori]);
    }
  };

  return (
    <aside className="w-full">

      {/* Hizli Filtre Butonlari */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-slate-800 px-4 py-2.5">
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
            Hizli Arama
          </h3>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {hizliButonlar.map((btn) => (
            <button
              key={btn.kategori}
              onClick={() => handleHizliButon(btn.kategori)}
              className={`${btn.color} text-white text-xs font-medium py-2 px-3 rounded-lg text-left transition`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detayli Arama */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-slate-800 px-4 py-2.5">
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
            Detayli Arama
          </h3>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Ilan Kategorisi
          </p>
          <div className="flex flex-col gap-2.5 mb-5">
            {tumKategoriler.map((item) => (
              <label
                key={item.kategori}
                className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedKategoriler.includes(item.kategori)}
                  onChange={() => handleCheckbox(item.kategori)}
                  className="accent-orange-500 w-4 h-4 rounded"
                />
                {item.label}
              </label>
            ))}
          </div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Siralama
          </p>
          <select
            value={siralama}
            onChange={(e) => onSiralamaChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4 bg-white"
          >
            <option value="yeni">Once En Yeni</option>
            <option value="eski">Once En Eski</option>
          </select>

          <button
            onClick={onFilter}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold text-sm transition mb-2"
          >
            Uygun Ilanlari Goster
          </button>
          <button
            onClick={onClear}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg font-medium text-sm transition"
          >
            Aramay Temizle
          </button>
        </div>
      </div>

    </aside>
  );
}
