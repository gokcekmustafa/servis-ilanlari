import React from 'react';
import { KategoriType, Ilan } from '../types';
import { Briefcase, Users, FileText, Truck, ShoppingCart } from 'lucide-react';

type CategoryCardsProps = {
  ilanlar: Ilan[];
  selectedKategori: KategoriType | null;
  onCategorySelect: (kategori: KategoriType | null) => void;
};

const kategoriData = [
  {
    kategori: 'isim_var_arac' as KategoriType,
    label: 'İşim Var\nAraç Arıyorum',
    icon: Briefcase,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    hoverColor: 'hover:bg-blue-100',
  },
  {
    kategori: 'aracim_var_is' as KategoriType,
    label: 'Aracım Var\nİş Arıyorum',
    icon: Truck,
    color: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    hoverColor: 'hover:bg-amber-100',
  },
  {
    kategori: 'sofor_ariyorum' as KategoriType,
    label: 'Şoför\nArıyorum',
    icon: Users,
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    hoverColor: 'hover:bg-green-100',
  },
  {
    kategori: 'hostes_ariyorum' as KategoriType,
    label: 'Hostes\nArıyorum',
    icon: FileText,
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    hoverColor: 'hover:bg-purple-100',
  },
  {
    kategori: 'soforum_is' as KategoriType,
    label: 'Şoförüm\nİş Arıyor',
    icon: Briefcase,
    color: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    hoverColor: 'hover:bg-pink-100',
  },
  {
    kategori: 'hostesim_is' as KategoriType,
    label: 'Hostesim\nİş Arıyor',
    icon: Users,
    color: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    hoverColor: 'hover:bg-indigo-100',
  },
  {
    kategori: 'plaka_satiyorum' as KategoriType,
    label: 'Plaka\nSatıyorum',
    icon: ShoppingCart,
    color: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    hoverColor: 'hover:bg-cyan-100',
  },
];

export default function CategoryCards({
  ilanlar,
  selectedKategori,
  onCategorySelect,
}: CategoryCardsProps) {
  const sayiHesapla = (kategori: KategoriType) =>
    ilanlar.filter((i) => i.kategori === kategori).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
        İlan Kategorileri
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Tüm İlanlar Kartı */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`p-4 rounded-lg border-2 transition-all text-center ${
            selectedKategori === null
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <div className={`text-2xl font-bold ${selectedKategori === null ? 'text-orange-600' : 'text-gray-600'}`}>
            {ilanlar.length}
          </div>
          <div className={`text-xs font-medium mt-1 ${selectedKategori === null ? 'text-orange-600' : 'text-gray-600'}`}>
            Tüm İlanlar
          </div>
        </button>

        {/* Kategori Kartları */}
        {kategoriData.map(({ kategori, label, icon: Icon, color, textColor, hoverColor }) => {
          const sayi = sayiHesapla(kategori);
          const isSelected = selectedKategori === kategori;

          return (
            <button
              key={kategori}
              onClick={() => onCategorySelect(isSelected ? null : kategori)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                isSelected
                  ? `border-orange-400 ${color}`
                  : `border-gray-200 hover:border-orange-300 ${hoverColor}`
              }`}
              disabled={sayi === 0}
              style={{ opacity: sayi === 0 ? 0.5 : 1 }}
            >
              <Icon
                size={20}
                className={`mx-auto mb-2 ${isSelected ? 'text-orange-600' : textColor}`}
              />
              <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-orange-600' : textColor}`}>
                {label}
              </div>
              <div className={`text-xs font-semibold mt-2 ${isSelected ? 'text-orange-500' : 'text-gray-500'}`}>
                ({sayi})
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
