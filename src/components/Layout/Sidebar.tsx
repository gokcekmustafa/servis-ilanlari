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
  {
    kategori: 'isim_var_arac' as KategoriType,
    label: 'İşim Var Araç Arıyorum',
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    kategori: 'aracim_var_is' as KategoriType,
    label: 'Aracım Var İş Arıyorum',
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    kategori: 'sofor_ariyorum' as KategoriType,
    label: 'Şöför Arıyorum',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    kategori: 'hostes_ariyorum' as KategoriType,
    label: 'Hostes Arıyorum',
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    kategori: 'hostesim_is' as KategoriType,
    label: 'Hostesim İş Arıyorum',
    color: 'bg-pink-600 hover:bg-pink-700',
  },
  {
    kategori: 'soforum_is' as KategoriType,
    label: 'Şöförüm İş Arıyorum',
    color: 'bg-yellow-600 hover:bg-yellow-700',
  },
];

const tumKategoriler = [
  {
    kategori: 'isim_var_arac' as KategoriType,
    label: 'İşim Var Araç Arıyorum',
  },
  {
    kategori: 'aracim_var_is' as KategoriType,
    label: 'Aracım Var İş Arıyorum',
  },
  { kategori: 'sofor_ariyorum' as KategoriType, label: 'Şöför Arıyorum' },
  { kategori: 'hostes_ariyorum' as KategoriType, label: 'Hostes Arıyorum' },
  { kategori: 'hostesim_is' as KategoriType, label: 'Hostesim İş Arıyorum' },
  { kategori: 'soforum_is' as KategoriType, label: 'Şöförüm İş Arıyorum' },
  { kategori: 'plaka_satiyorum' as KategoriType, label: 'Plakamı Satıyorum' },
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
      <div className="flex flex-col gap-2 mb-4">
        {hizliButonlar.map((btn) => (
          <button
            key={btn.kategori}
            onClick={() => handleHizliButon(btn.kategori)}
            className={`${btn.color} text-white text-sm font-medium py-2 px-3 rounded-lg text-left transition`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase mb-3 tracking-wide">
          Detaylı Arama
        </h3>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          İlan Kategorisi
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {tumKategoriler.map((item) => (
            <label
              key={item.kategori}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedKategoriler.includes(item.kategori)}
                onChange={() => handleCheckbox(item.kategori)}
                className="accent-[#1a3c6e] w-4 h-4"
              />
              {item.label}
            </label>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Sıralama
          </p>
          <select
            value={siralama}
            onChange={(e) => onSiralamaChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
          >
            <option value="yeni">Önce En Yeni</option>
            <option value="eski">Önce En Eski</option>
          </select>
        </div>

        <button
          onClick={onFilter}
          className="w-full bg-[#f97316] text-white py-2 rounded-lg font-medium text-sm hover:bg-orange-600 transition mb-2"
        >
          Uygun İlanları Göster
        </button>
        <button
          onClick={onClear}
          className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-400 transition"
        >
          Aramayı Temizle
        </button>
      </div>
    </aside>
  );
}
