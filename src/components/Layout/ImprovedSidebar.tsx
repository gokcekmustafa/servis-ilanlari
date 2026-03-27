import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { KategoriType, Ilan } from '../../types';
import {
  getIller,
  getYakalar,
  getIlceler,
  getMahallelerByIlce,
} from '../../data/locations';

type ImprovedSidebarProps = {
  selectedKategoriler: KategoriType[];
  selectedSehir: string;
  selectedIlce: string;
  selectedYaka: string;
  selectedMahalle: string;
  onSehirChange: (sehir: string) => void;
  onIlceChange: (ilce: string) => void;
  onYakaChange: (yaka: string) => void;
  onMahalleChange: (mahalle: string) => void;
  onFilter: () => void;
  onClear: () => void;
  ilanlar: Ilan[];
};

export default function ImprovedSidebar({
  selectedSehir,
  selectedIlce,
  selectedYaka,
  selectedMahalle,
  onSehirChange,
  onIlceChange,
  onYakaChange,
  onMahalleChange,
  onFilter,
  onClear,
  ilanlar,
}: ImprovedSidebarProps) {
  const [konumAcik, setKonumAcik] = useState(true);

  const iller = getIller();
  const yakalar = selectedSehir ? getYakalar(selectedSehir) : [];
  const ilceler = selectedSehir ? getIlceler(selectedSehir, selectedYaka) : [];
  const mahalleler = selectedIlce
    ? getMahallelerByIlce(selectedSehir, selectedIlce, selectedYaka)
    : [];

  const istanbulMu = selectedSehir === 'İstanbul';
  const aktivFiltreVar = selectedSehir || selectedIlce || selectedYaka || selectedMahalle;

  return (
    <aside className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

      {/* Başlık */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Konum Filtresi</h3>
          {aktivFiltreVar && (
            <button
              onClick={onClear}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              <X size={14} /> Temizle
            </button>
          )}
        </div>
      </div>

      {/* Konum Seçimi */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => setKonumAcik(!konumAcik)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <span className="text-sm font-semibold text-gray-800">Şehir / İlçe</span>
          {konumAcik ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>

        {konumAcik && (
          <div className="px-4 pb-4 space-y-3">

            {/* Şehir */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Şehir Seçiniz
              </label>
              <select
                value={selectedSehir}
                onChange={(e) => {
                  onSehirChange(e.target.value);
                  onYakaChange('');
                  onIlceChange('');
                  onMahalleChange('');
                }}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">Tüm Şehirler</option>
                {iller.map((il) => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </div>

            {/* Yaka — sadece İstanbul */}
            {istanbulMu && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Yakasını Seçiniz
                </label>
                <select
                  value={selectedYaka}
                  onChange={(e) => {
                    onYakaChange(e.target.value);
                    onIlceChange('');
                    onMahalleChange('');
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Tüm Yakalar</option>
                  {yakalar.map((y) => (
                    <option key={y.ad} value={y.ad}>{y.ad}</option>
                  ))}
                </select>
              </div>
            )}

            {/* İlçe */}
            {selectedSehir && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  İlçe Seçiniz
                </label>
                <select
                  value={selectedIlce}
                  onChange={(e) => {
                    onIlceChange(e.target.value);
                    onMahalleChange('');
                  }}
                  disabled={istanbulMu && !selectedYaka}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Tüm İlçeler</option>
                  {ilceler.map((i) => (
                    <option key={i.ad} value={i.ad}>{i.ad}</option>
                  ))}
                </select>
                {istanbulMu && !selectedYaka && (
                  <p className="text-xs text-gray-400 mt-1">Önce yaka seçiniz</p>
                )}
              </div>
            )}

            {/* Mahalle — sadece İstanbul ilçesi seçilmişse */}
            {selectedIlce && mahalleler.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Mahalle Seçiniz
                </label>
                <select
                  value={selectedMahalle}
                  onChange={(e) => onMahalleChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Tüm Mahalleler</option>
                  {mahalleler.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uygula */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onFilter}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Filtrele
        </button>
      </div>
    </aside>
  );
}
