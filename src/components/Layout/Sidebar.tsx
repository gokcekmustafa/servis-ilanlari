import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  { kategori: 'isim_var_arac' as KategoriType, label: 'Isim Var Arac Ariyorum' },
  { kategori: 'aracim_var_is' as KategoriType, label: 'Aracim Var Is Ariyorum' },
  { kategori: 'sofor_ariyorum' as KategoriType, label: 'Sofor Ariyorum' },
  { kategori: 'hostes_ariyorum' as KategoriType, label: 'Hostes Ariyorum' },
  { kategori: 'hostesim_is' as KategoriType, label: 'Hostesim Is Ariyorum' },
  { kategori: 'soforum_is' as KategoriType, label: 'Soforum Is Ariyorum' },
  { kategori: 'plaka_satiyorum' as KategoriType, label: 'Plakam Satiyorum' },
];

const ANADOLU_ILCELERI = [
  'Adalar', 'Atasehir', 'Beykoz', 'Cekmekoy', 'Kadikoy',
  'Kartal', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sile',
  'Sultanbeyli', 'Tuzla', 'Umraniye', 'Uskudar',
];

const AVRUPA_ILCELERI = [
  'Arnavutkoy', 'Avcilar', 'Bagcilar', 'Bahcelievler', 'Bakirkoy',
  'Basaksehir', 'Bayrampasa', 'Besiktas', 'Beylikduzu', 'Beyoglu',
  'Buyukcekmece', 'Catalca', 'Esenler', 'Esenyurt', 'Eyupsultan',
  'Fatih', 'Gaziosmanpasa', 'Gungoren', 'Kagithane', 'Kucukcekmece',
  'Sariyer', 'Silivri', 'Sisli', 'Sultangazi', 'Zeytinburnu',
];

function ilceYakasiniGetir(ilce: string): string {
  const temiz = ilce.toLowerCase()
    .replace(/i/g, 'i').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ğ/g, 'g');
  if (ANADOLU_ILCELERI.some(a => a.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g') === temiz)) return 'anadolu';
  if (AVRUPA_ILCELERI.some(a => a.toLowerCase().replace(/i/g, 'i').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g') === temiz)) return 'avrupa';
  return '';
}

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
  const [ilceAcik, setIlceAcik] = useState(false);

  const handleCheckbox = (kategori: KategoriType) => {
    if (selectedKategoriler.includes(kategori)) {
      onKategoriChange(selectedKategoriler.filter((k) => k !== kategori));
    } else {
      onKategoriChange([...selectedKategoriler, kategori]);
    }
  };

  const kategoriSayisi = (kategori: KategoriType) =>
    ilanlar.filter((i) => i.kategori === kategori).length;

  const sehirler = useMemo(() => {
    const sayac: Record<string, number> = {};
    ilanlar.forEach((ilan) => {
      ilan.guzergahlar.forEach((g) => {
        if (g.kalkis_il) {
          sayac[g.kalkis_il] = (sayac[g.kalkis_il] || 0) + 1;
        }
      });
    });
    return Object.entries(sayac)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
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
    return Object.entries(sayac)
      .sort((a, b) => b[1] - a[1]);
  }, [ilanlar, selectedSehir]);

  const istanbulSecili = selectedSehir === 'Istanbul';

  const anadoluSayisi = useMemo(() => {
    if (!istanbulSecili) return 0;
    return ilanlar.filter((ilan) =>
      ilan.guzergahlar.some((g) =>
        g.kalkis_il === 'Istanbul' && g.kalkis_ilce && ilceYakasiniGetir(g.kalkis_ilce) === 'anadolu'
      )
    ).length;
  }, [ilanlar, istanbulSecili]);

  const avrupaSayisi = useMemo(() => {
    if (!istanbulSecili) return 0;
    return ilanlar.filter((ilan) =>
      ilan.guzergahlar.some((g) =>
        g.kalkis_il === 'Istanbul' && g.kalkis_ilce && ilceYakasiniGetir(g.kalkis_ilce) === 'avrupa'
      )
    ).length;
  }, [ilanlar, istanbulSecili]);

  const aktifFiltreSayisi =
    selectedKategoriler.length +
    (selectedSehir ? 1 : 0) +
    (selectedIlce ? 1 : 0) +
    (selectedYaka ? 1 : 0);

  return (
    <aside className="w-full flex flex-col gap-3">

      {/* KATEGORİ */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">Ilan Kategorisi</span>
          {selectedKategoriler.length > 0 && (
            <button
              onClick={() => onKategoriChange([])}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium transition"
            >
              Temizle
            </button>
          )}
        </div>
        <div className="py-1">
          {tumKategoriler.map((item) => {
            const sayi = kategoriSayisi(item.kategori);
            return (
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
                <span className="text-xs text-gray-400">{sayi}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ŞEHİR */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">Sehir</span>
          {selectedSehir && (
            <button
              onClick={() => { onSehirChange(''); onIlceChange(''); onYakaChange(''); }}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium transition"
            >
              Temizle
            </button>
          )}
        </div>
        <div className="py-1">
          {sehirler.map(([sehir, sayi]) => (
            <label
              key={sehir}
              className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="sehir"
                  checked={selectedSehir === sehir}
                  onChange={() => {
                    onSehirChange(sehir);
                    onIlceChange('');
                    onYakaChange('');
                  }}
                  className="accent-orange-500 w-3.5 h-3.5"
                />
                <span className={
                  'text-xs transition ' +
                  (selectedSehir === sehir
                    ? 'text-orange-600 font-semibold'
                    : 'text-gray-600 group-hover:text-gray-800')
                }>
                  {sehir}
                </span>
              </div>
              <span className="text-xs text-gray-400">{sayi}</span>
            </label>
          ))}
        </div>
      </div>

      {/* İSTANBUL YAKASI */}
      {istanbulSecili && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Yaka</span>
            {selectedYaka && (
              <button
                onClick={() => { onYakaChange(''); onIlceChange(''); }}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium transition"
              >
                Temizle
              </button>
            )}
          </div>
          <div className="py-1">
            {[
              { val: 'anadolu', label: 'Anadolu Yakasi', sayi: anadoluSayisi },
              { val: 'avrupa', label: 'Avrupa Yakasi', sayi: avrupaSayisi },
            ].map((item) => (
              <label
                key={item.val}
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="yaka"
                    checked={selectedYaka === item.val}
                    onChange={() => { onYakaChange(item.val); onIlceChange(''); }}
                    className="accent-orange-500 w-3.5 h-3.5"
                  />
                  <span className={
                    'text-xs transition ' +
                    (selectedYaka === item.val
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
      )}

      {/* İLÇE */}
      {selectedSehir && ilceler.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIlceAcik(!ilceAcik)}
            className="w-full px-4 py-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="text-sm font-semibold text-gray-800">
              Ilce
              {selectedIlce && (
                <span className="ml-2 text-xs text-orange-500 font-medium">({selectedIlce})</span>
              )}
            </span>
            {ilceAcik
              ? <ChevronUp size={14} className="text-gray-400" />
              : <ChevronDown size={14} className="text-gray-400" />
            }
          </button>
          {ilceAcik && (
            <div className="py-1 max-h-48 overflow-y-auto">
              {ilceler.map(([ilce, sayi]) => (
                <label
                  key={ilce}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="ilce"
                      checked={selectedIlce === ilce}
                      onChange={() => onIlceChange(ilce)}
                      className="accent-orange-500 w-3.5 h-3.5"
                    />
                    <span className={
                      'text-xs transition ' +
                      (selectedIlce === ilce
                        ? 'text-orange-600 font-semibold'
                        : 'text-gray-600 group-hover:text-gray-800')
                    }>
                      {ilce}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{sayi}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

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
                (siralama === item.val
                  ? 'text-orange-600 font-semibold'
                  : 'text-gray-600')
              }>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* BUTONLAR */}
      <button
        onClick={onFilter}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition"
      >
        {aktifFiltreSayisi > 0 ? 'Filtrele (' + aktifFiltreSayisi + ')' : 'Filtrele'}
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
