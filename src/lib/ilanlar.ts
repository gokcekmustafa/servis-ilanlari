import { supabase } from './supabase';

export async function ilanlariGetir(kategori?: string) {
  let query = supabase
    .from('ilanlar')
    .select('*')
    .eq('durum', 'aktif')
    .order('created_at', { ascending: false });

  if (kategori) {
    query = query.eq('kategori', kategori);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function ilanEkle(ilan: {
  kategori: string;
  servis_turu: string[];
  aciklama: string;
  ilan_veren: string;
  guzergahlar: any[];
  user_id: string;
}) {
  const { data, error } = await supabase
    .from('ilanlar')
    .insert([ilan])
    .select();
  return { data, error };
}

export async function ilanSil(id: string) {
  const { error } = await supabase.from('ilanlar').delete().eq('id', id);
  return { error };
}

export async function kullaniciIlanlari(userId: string) {
  const { data, error } = await supabase
    .from('ilanlar')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}
