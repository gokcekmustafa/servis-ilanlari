import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { KategoriType, Ilan } from '../../types';

type ImprovedSidebarProps = {
  selectedKategoriler: KategoriType[];
  selectedSehir: string;
  selectedIlce: string;
  selectedYaka: string;
  onSehirChange: (sehir: string) => void;
  onIlceChange: (ilce: string) => void;
  onYakaChange: (yaka: string) => void;
  onFilter: () => void;
  onClear: () => void;
  ilanlar: Ilan[];
};

export default function ImprovedSidebar({
  selectedSehir,
  selectedIlce,
  selectedYaka,
  onSehirChange,
  onIlceChange,
  onYakaChange,
  onFilter,
  onClear,
  ilanlar,
}: ImprovedSidebarProps) {
  const [konumAcik, setKonumAcik] = useState(true);

  // Şehir ve ilçeleri hesapla
  const sehirler = useMemo(() => {
    const sayac: Record<string, number> = {};
    ilanlar.forEach((ilan) => {
      ilan.guzergahlar.forEach((g) => {
        if (g.kalkis_il) sayac[g.kalkis_il] = (sayac[g.kalkis_il] || 0) + 1;
      });
    });
    return Object.entries(sayac)
      .sort(([, a], [, b]) => b - a)
      .map(([city]) => city);
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

  const aktivFiltreVar = selectedSehir || selectedIlce || selectedYaka;

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
            {/* Şehir Seçimi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Şehir Seçiniz
              </label>
              <select
                value={selectedSehir}
                onChange={(e) => {
                  onSehirChange(e.target.value);
                  onIlceChange('');
                  onYakaChange('');
                }}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">Tüm Şehirler</option>
                {sehirler.map((sehir) => (
                  <option key={sehir} value={sehir}>
                    {sehir}
                  </option>
                ))}
              </select>
            </div>

            {/* İlçe Seçimi */}
            {selectedSehir && ilceler.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  İlçe Seçiniz
                </label>
                <select
                  value={selectedIlce}
                  onChange={(e) => onIlceChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Tüm İlçeler</option>
                  {ilceler.map((ilce) => (
                    <option key={ilce} value={ilce}>
                      {ilce}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Yaka Seçimi (İstanbul için) */}
            {selectedSehir === 'Istanbul' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Yakasını Seçiniz
                </label>
                <select
                  value={selectedYaka}
                  onChange={(e) => {
                    onYakaChange(e.target.value);
                    onIlceChange('');
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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

      {/* Uygula Butonu */}
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
