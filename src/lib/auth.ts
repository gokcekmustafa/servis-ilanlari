import { supabase } from './supabase';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'servis-ilanlari-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function kayitOl(
  telefon: string,
  sifre: string,
  fullName: string,
  type: string,
  il: string
) {
  const temiz = telefon.replace(/\s/g, '').replace(/[^0-9]/g, '');

  const { data: mevcut } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', temiz)
    .single();

  if (mevcut) {
    return { data: null, error: { message: 'Bu telefon numarasi ile zaten kayit olunmus.' } };
  }

  const hash = await hashPassword(sifre);

  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: crypto.randomUUID(),
      phone_number: temiz,
      full_name: fullName,
      type,
      il,
      password_hash: hash,
      sifre_acik: sifre,
      aktif: true,
      yetkiler: {
        ilan_verebilir: true,
        mesaj_gonderebilir: true,
        favori_ekleyebilir: true,
      },
    }])
    .select()
    .single();

  if (!error && data) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  return { data, error };
}

export async function girisYap(telefon: string, sifre: string) {
  const temiz = telefon.replace(/\s/g, '').replace(/[^0-9]/g, '');
  const hash = await hashPassword(sifre);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone_number', temiz)
    .eq('password_hash', hash)
    .single();

  if (error || !data) {
    return { data: null, error: { message: 'Telefon numarasi veya sifre hatali.' } };
  }

  if (data.aktif === false) {
    return { data: null, error: { message: 'Hesabiniz aktif degil. Lutfen yonetici ile iletisime gecin.' } };
  }

  localStorage.setItem('user', JSON.stringify(data));
  return { data, error: null };
}

export function mevcutKullanici() {
  const user = localStorage.getItem('user');
  if (!user) return null;
  return JSON.parse(user);
}

export async function cikisYap() {
  localStorage.removeItem('user');
  return { error: null };
}

export async function kullaniciSayisi() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  return { count, error };
}
