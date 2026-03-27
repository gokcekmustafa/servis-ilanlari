type FieldType = 'text' | 'number' | 'textarea';

interface FormField {
  name: string;
  label: string;
  type: FieldType;
}

export const kategoriFormSchema: Record<string, FormField[]> = {
  isim_var_arac: [
    { name: 'guzergah', label: 'Güzergah', type: 'text' },
    { name: 'tarih', label: 'Tarih', type: 'text' },
    { name: 'kisi_sayisi', label: 'Kişi Sayısı', type: 'number' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  aracim_var_is: [
    { name: 'arac_tipi', label: 'Araç Tipi', type: 'text' },
    { name: 'kapasite', label: 'Kapasite', type: 'number' },
    { name: 'bolge', label: 'Bölge', type: 'text' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  sofor_ariyorum: [
    { name: 'bolge', label: 'Bölge', type: 'text' },
    { name: 'deneyim', label: 'Deneyim (yıl)', type: 'number' },
    { name: 'ucret', label: 'Ücret (TL)', type: 'number' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  hostes_ariyorum: [
    { name: 'bolge', label: 'Bölge', type: 'text' },
    { name: 'deneyim', label: 'Deneyim (yıl)', type: 'number' },
    { name: 'ucret', label: 'Ücret (TL)', type: 'number' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  hostesim_is: [
    { name: 'bolge', label: 'Çalışmak İstediğim Bölge', type: 'text' },
    { name: 'deneyim', label: 'Deneyim (yıl)', type: 'number' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  soforum_is: [
    { name: 'bolge', label: 'Çalışmak İstediğim Bölge', type: 'text' },
    { name: 'deneyim', label: 'Deneyim (yıl)', type: 'number' },
    { name: 'ehliyet', label: 'Ehliyet Sınıfı', type: 'text' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  plaka_satiyorum: [
    { name: 'plaka', label: 'Plaka', type: 'text' },
    { name: 'fiyat', label: 'Fiyat (TL)', type: 'number' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
  aracimi_satiyorum: [
    { name: 'arac_tipi', label: 'Araç Tipi', type: 'text' },
    { name: 'marka_model', label: 'Marka / Model', type: 'text' },
    { name: 'yil', label: 'Yıl', type: 'number' },
    { name: 'km', label: 'KM', type: 'number' },
    { name: 'fiyat', label: 'Fiyat (TL)', type: 'number' },
    { name: 'notlar', label: 'Ek Notlar', type: 'textarea' },
  ],
};
