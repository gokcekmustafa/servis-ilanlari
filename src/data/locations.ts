import { mahalleler } from './mahalleler';
import { ilceler } from './ilceler';

export interface LocationData {
  il: string;
  yakalar?: {
    ad: string;
    ilceler: {
      ad: string;
      mahalleler: string[];
    }[];
  }[];
  ilceler?: {
    ad: string;
    mahalleler: string[];
  }[];
}

// İstanbul ilçelerini yakaya göre grupla
const istanbulAvrupa = [
  'Adalar', 'Arnavutköy', 'Avcılar', 'Bağcılar', 'Bahçelievler',
  'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beylikdüzü',
  'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Esenler', 'Esenyurt',
  'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kağıthane',
  'Küçükçekmece', 'Sarıyer', 'Silivri', 'Sultangazi', 'Şişli',
  'Zeytinburnu',
];

const istanbulAnadolu = [
  'Ataşehir', 'Beykoz', 'Çekmeköy', 'Kadıköy', 'Kartal',
  'Maltepe', 'Pendik', 'Sancaktepe', 'Sultanbeyli', 'Şile',
  'Tuzla', 'Ümraniye', 'Üsküdar',
];

// İlçe adına göre mahalle getir (mahalleler.ts'den)
const getMahalleler = (ilce: string): string[] => {
  return mahalleler[ilce] || [];
};

// İlçe listesini yapıya çevir
const ilceleriDonustur = (ilceListesi: string[]) =>
  ilceListesi.map((ad) => ({
    ad,
    mahalleler: getMahalleler(ad),
  }));

export const locations: LocationData[] = [
  {
    il: 'İstanbul',
    yakalar: [
      {
        ad: 'Avrupa Yakası',
        ilceler: ilceleriDonustur(istanbulAvrupa),
      },
      {
        ad: 'Anadolu Yakası',
        ilceler: ilceleriDonustur(istanbulAnadolu),
      },
    ],
  },
  ...Object.entries(ilceler)
    .filter(([il]) => il !== 'Istanbul') // İstanbul'u atla, yukarıda hallettik
    .map(([il, ilceListesi]) => ({
      il,
      ilceler: ilceListesi.map((ad) => ({
        ad,
        mahalleler: [], // İstanbul dışı için mahalle yok (Seçenek A)
      })),
    })),
];

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────

export const getIller = (): string[] => locations.map((l) => l.il);

export const getYakalar = (il: string) => {
  const city = locations.find((l) => l.il === il);
  return city?.yakalar || [];
};

export const getIlceler = (il: string, yaka?: string) => {
  const city = locations.find((l) => l.il === il);
  if (!city) return [];

  if (city.yakalar) {
    if (yaka) {
      const yakaData = city.yakalar.find((y) => y.ad === yaka);
      return yakaData?.ilceler || [];
    }
    // Yaka seçilmemişse tüm ilçeleri getir
    return city.yakalar.flatMap((y) => y.ilceler);
  }

  return city.ilceler || [];
};

export const getMahallelerByIlce = (il: string, ilce: string, yaka?: string) => {
  const ilceler = getIlceler(il, yaka);
  const ilceData = ilceler.find((i) => i.ad === ilce);
  return ilceData?.mahalleler || [];
};
