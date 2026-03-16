import { supabase } from './supabase';

export async function girisYap(email: string, sifre: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: sifre,
  });
  return { data, error };
}

export async function kayitOl(
  email: string,
  sifre: string,
  fullName: string,
  type: string,
  il: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: sifre,
    options: {
      data: {
        full_name: fullName,
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
