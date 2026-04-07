// src/types/index.ts

export type KategoriType = string;

export interface Ilan {
  id: string;
  baslik?: string;
  ilan_veren: string;
  aciklama?: string;
  kategori: KategoriType;
  guzergahlar: {
    giris_saati: string;
    cikis_saati: string;
    kalkis_mah: string;
    kalkis_ilce?: string;
    kalkis_il?: string;
    varis_mah: string;
    varis_ilce?: string;
    varis_il?: string;
    baslangic_saati?: string;
    bitis_saati?: string;
  }[];
  servis_turu?: string[];
  created_at: string;
  user_id: string;
  view_count?: number; // Görüntülenme sayısı
  durum?: string;      // İlanın durumu (aktif, pasif vb.)
  ekbilgiler?: Record<string, any>;
  profiles?: {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  type?: string;
};
}
