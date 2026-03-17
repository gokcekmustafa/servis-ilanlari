import { supabase } from './supabase';

function telefonToEmail(telefon: string): string {
  const temiz = telefon.replace(/\s/g, '').replace(/[^0-9]/g, '');
  return `user${temiz}@salonum.site`;
}

export async function girisYap(telefon: string, sifre: string) {
  const email = telefonToEmail(telefon);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: sifre,
  });
  return { data, error };
}

export async function kayitOl(
  telefon: string,
  sifre: string,
  fullName: string,
  type: string,
  il: string
) {
  const temiz = telefon.replace(/\s/g, '').replace(/[^0-9]/g, '');

  const { data: mevcutKullanici } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', temiz)
    .single();

  if (mevcutKullanici) {
    return { data: null, error: { message: 'Bu telefon numarasi ile zaten kayit olunmus.' } };
  }

  const email = telefonToEmail(telefon);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: sifre,
    options: {
      data: {
        full_name: fullName,
        phone: temiz,
        type,
        il,
      },
    },
  });
  return { data, error };
}

export async function cikisYap() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function mevcutKullanici() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function kullaniciSayisi() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  return { count, error };
}
