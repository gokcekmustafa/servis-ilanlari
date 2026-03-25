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
