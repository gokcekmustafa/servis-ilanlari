export type KategoriType =
  | 'isim_var_arac'
  | 'aracim_var_is'
  | 'sofor_ariyorum'
  | 'hostes_ariyorum'
  | 'hostesim_is'
  | 'soforum_is'
  | 'plaka_satiyorum';

export interface Guzergah {
  giris_saati: string;
  kalkis_il: string;
  kalkis_ilce: string;
  kalkis_mah: string;
  varis_il: string;
  varis_ilce: string;
  varis_mah: string;
  cikis_saati: string;
}

export interface Ilan {
  id: string;
  user_id: string;
  kategori: KategoriType;
  servis_turu: string[];
  aciklama: string;
  ilan_veren: string;
  guzergahlar: Guzergah[];
  created_at: string;
  durum: string;
}
