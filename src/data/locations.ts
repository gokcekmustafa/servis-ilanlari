export interface NeighborhoodDistrict {
  name: string;
  neighborhoods: string[];
}

export interface Side {
  name: string;
  districts: NeighborhoodDistrict[];
}

export interface City {
  city: string;
  sides?: Side[];
  districts?: NeighborhoodDistrict[];
}

export const locations: City[] = [
  {
    city: "İstanbul",
    sides: [
      {
        name: "Avrupa Yakası",
        districts: [
          { name: "Beşiktaş", neighborhoods: ["Levent", "Etiler", "Ortaköy"] },
          { name: "Şişli", neighborhoods: ["Nişantaşı", "Mecidiyeköy"] },
          { name: "Bakırköy", neighborhoods: ["Yeşilköy", "Ataköy"] }
        ]
      },
      {
        name: "Anadolu Yakası",
        districts: [
          { name: "Kadıköy", neighborhoods: ["Moda", "Fenerbahçe", "Koşuyolu"] },
          { name: "Üsküdar", neighborhoods: ["Çengelköy", "Beylerbeyi"] },
          { name: "Ataşehir", neighborhoods: ["İçerenköy", "Kayışdağı"] }
        ]
      }
    ]
  },
  {
    city: "Ankara",
    districts: [
      { name: "Çankaya", neighborhoods: ["Kızılay", "Bahçelievler"] },
      { name: "Keçiören", neighborhoods: ["Etlik", "Aktepe"] },
      { name: "Yenimahalle", neighborhoods: ["Batıkent", "Demetevler"] }
    ]
  }
];


// ✅ TÜM SORUNU ÇÖZEN FONKSİYON (EN ÖNEMLİ)
export const getDistricts = (city: City): NeighborhoodDistrict[] => {
  if (city.sides) {
    return city.sides.flatMap(side => side.districts);
  }
  return city.districts || [];
};


// ✅ YAKA BAZLI (İstanbul için)
export const getDistrictsBySide = (
  city: City,
  sideName: string
): NeighborhoodDistrict[] => {
  if (!city.sides) return [];

  const side = city.sides.find(s => s.name === sideName);
  return side?.districts || [];
};


// ✅ MAHALLE GETİRME
export const getNeighborhoods = (
  city: City,
  districtName: string
): string[] => {
  const districts = getDistricts(city);
  const district = districts.find(d => d.name === districtName);
  return district?.neighborhoods || [];
};
