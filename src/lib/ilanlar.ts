import { supabase } from './supabase';

export async function ilanlariGetir(kategori?: string) {
  let query = supabase
    .from('ilanlar')
    .select('*, profiles(full_name, phone_number)')
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
  ekbilgiler?: any;
}) {
  const { data, error } = await supabase
    .from('ilanlar')
    .insert([ilan])
    .select();
  return { data, error };
}

export async function ilanSil(id: string) {
  const { error } = await supabase
    .from('ilanlar')
    .delete()
    .eq('id', id);
  return { error };
}

export async function ilanGuncelle(id: string, updates: {
  aciklama?: string;
  servis_turu?: string[];
  guzergahlar?: any[];
  ekbilgiler?: any;
}) {
  const { data, error } = await supabase
    .from('ilanlar')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function kullaniciIlanlari(userId: string) {
  const { data, error } = await supabase
    .from('ilanlar')
    .select('*, profiles(full_name, phone_number)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function araclarGetir(userId: string) {
  const { data, error } = await supabase
    .from('araclar')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function aracEkle(arac: {
  user_id: string;
  marka: string;
  model: string;
  yil: string;
  plaka: string;
  koltuk_sayisi: string;
  arac_tipi: string;
}) {
  const { data, error } = await supabase
    .from('araclar')
    .insert([arac])
    .select();
  return { data, error };
}

export async function aracSil(id: string) {
  const { error } = await supabase
    .from('araclar')
    .delete()
    .eq('id', id);
  return { error };
}

export async function favorileriGetir(userId: string) {
  const { data, error } = await supabase
    .from('favoriler')
    .select('*, ilanlar(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function favoriEkle(userId: string, ilanId: string) {
  const { data, error } = await supabase
    .from('favoriler')
    .insert([{ user_id: userId, ilan_id: ilanId }])
    .select();
  return { data, error };
}

export async function favoriKaldir(userId: string, ilanId: string) {
  const { error } = await supabase
    .from('favoriler')
    .delete()
    .eq('user_id', userId)
    .eq('ilan_id', ilanId);
  return { error };
}

export async function favoriKontrol(userId: string, ilanId: string) {
  const { data, error } = await supabase
    .from('favoriler')
    .select('id')
    .eq('user_id', userId)
    .eq('ilan_id', ilanId)
    .single();
  return { isFavori: !!data, error };
}

export async function mesajGonder(mesaj: {
  gonderen_id: string;
  alan_id: string;
  ilan_id: string;
  mesaj: string;
}) {
  const { data, error } = await supabase
    .from('mesajlar')
    .insert([mesaj])
    .select();
  return { data, error };
}

export async function gelenMesajlar(userId: string) {
  const { data, error } = await supabase
    .from('mesajlar')
    .select('*, ilanlar(aciklama), gonderen:profiles!gonderen_id(full_name, phone_number)')
    .eq('alan_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function okunmamisMesajSayisi(userId: string) {
  const { count, error } = await supabase
    .from('mesajlar')
    .select('*', { count: 'exact', head: true })
    .eq('alan_id', userId)
    .eq('okundu', false);
  return { count, error };
}

export async function mesajOkunduIsaretle(mesajId: string) {
  const { error } = await supabase
    .from('mesajlar')
    .update({ okundu: true })
    .eq('id', mesajId);
  return { error };
}

export async function destekGonder(talep: {
  user_id: string;
  konu: string;
  mesaj: string;
}) {
  const { data, error } = await supabase
    .from('destek')
    .insert([talep])
    .select();
  return { data, error };
}

export async function destekTalepleriniGetir() {
  const { data, error } = await supabase
    .from('destek')
    .select('*, profiles(full_name, phone_number)')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function destekDurumGuncelle(id: string, durum: string, cevap?: string) {
  const updates: any = { durum };
  if (cevap !== undefined) {
    updates.cevap = cevap;
    updates.cevap_tarihi = new Date().toISOString();
  }
  if (durum === 'islemde' && !cevap) {
    updates.cevap_tarihi = new Date().toISOString();
  }
  const { error } = await supabase
    .from('destek')
    .update(updates)
    .eq('id', id);
  return { error };
}
