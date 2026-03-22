// src/types/index.ts

export type KategoriType =
  | 'isim_var_arac'
  | 'aracim_var_is'
  | 'sofor_ariyorum'
  | 'hostes_ariyorum'
  | 'hostesim_is'
  | 'soforum_is'
  | 'plaka_satiyorum';

export interface Ilan {
  id: string;
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
  }[];
  servis_turu?: string[];
  created_at: string;
  user_id: string;
  view_count?: number; // Görüntülenme sayısı
  durum?: string;      // İlanın durumu (aktif, pasif vb.)
}
