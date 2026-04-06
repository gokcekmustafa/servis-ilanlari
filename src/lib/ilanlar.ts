import { supabase } from './supabase';

function conversationIdOlustur(kullanici1: string, kullanici2: string) {
  return kullanici1 < kullanici2
    ? `${kullanici1}_${kullanici2}`
    : `${kullanici2}_${kullanici1}`;
}

export const VARSAYILAN_ILAN_AKTIF_SURE_GUN = 10;
const ILAN_AKTIF_SURE_ANAHTAR = 'ilan_aktif_sure_gun';
const GUN_MS = 24 * 60 * 60 * 1000;

function sayiOlarakPozitifTamSayi(v: any, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function aktifBaslangicTarihiGetir(ilan: any) {
  const ekbilgiler = ilan?.ekbilgiler && typeof ilan.ekbilgiler === 'object' ? ilan.ekbilgiler : {};
  const kaynak = ekbilgiler.aktif_baslangic_tarihi || ilan?.created_at;
  const tarih = new Date(kaynak);
  if (Number.isNaN(tarih.getTime())) {
    return new Date(ilan?.created_at || Date.now());
  }
  return tarih;
}

export function ilanKalanGunHesapla(ilan: any, aktifSureGun: number, simdi = new Date()) {
  const sure = sayiOlarakPozitifTamSayi(aktifSureGun, VARSAYILAN_ILAN_AKTIF_SURE_GUN);
  const baslangic = aktifBaslangicTarihiGetir(ilan).getTime();
  const bitis = baslangic + sure * GUN_MS;
  const fark = bitis - simdi.getTime();
  if (fark <= 0) return 0;
  return Math.ceil(fark / GUN_MS);
}

export async function ilanAktifSureGunGetir() {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('deger')
    .eq('anahtar', ILAN_AKTIF_SURE_ANAHTAR)
    .maybeSingle();

  if (error) return VARSAYILAN_ILAN_AKTIF_SURE_GUN;
  return sayiOlarakPozitifTamSayi(data?.deger, VARSAYILAN_ILAN_AKTIF_SURE_GUN);
}

export function aktiflestirmeEkBilgisiHazirla(ekbilgiler: any) {
  const mevcut = ekbilgiler && typeof ekbilgiler === 'object' ? ekbilgiler : {};
  return {
    ...mevcut,
    aktif_baslangic_tarihi: new Date().toISOString(),
  };
}

export async function ilanDurumGuncelle(id: string, durum: 'aktif' | 'pasif', ekbilgiler?: any) {
  const updates: any = { durum };
  if (durum === 'aktif') {
    updates.ekbilgiler = aktiflestirmeEkBilgisiHazirla(ekbilgiler);
  }
  const { error } = await supabase
    .from('ilanlar')
    .update(updates)
    .eq('id', id);
  return { error };
}

export async function suresiDolanIlanlariPasiflestir(aktifSureGunParam?: number) {
  const aktifSureGun = aktifSureGunParam || await ilanAktifSureGunGetir();
  const { data, error } = await supabase
    .from('ilanlar')
    .select('id, created_at, ekbilgiler')
    .eq('durum', 'aktif');

  if (error || !data) return { updatedCount: 0, error };

  const suresiDolanIlanIdleri = data
    .filter((ilan: any) => ilanKalanGunHesapla(ilan, aktifSureGun) <= 0)
    .map((ilan: any) => ilan.id);

  if (suresiDolanIlanIdleri.length === 0) return { updatedCount: 0, error: null };

  const { error: updateError } = await supabase
    .from('ilanlar')
    .update({ durum: 'pasif' })
    .in('id', suresiDolanIlanIdleri);

  return { updatedCount: suresiDolanIlanIdleri.length, error: updateError };
}

export async function ilanlariGetir(kategori?: string) {
  await suresiDolanIlanlariPasiflestir();

  let query = supabase
    .from('ilanlar')
    .select('*, profiles(full_name, phone_number, avatar_url, type)')
    .eq('durum', 'aktif')
    .order('created_at', { ascending: false });

  if (kategori) {
    query = query.eq('kategori', kategori);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function ilanEkle(ilan: {
  baslik?: string;
  kategori: string;
  servis_turu: string[];
  aciklama: string;
  ilan_veren: string;
  guzergahlar: any[];
  user_id: string;
  ekbilgiler?: any;
}) {
  const ekbilgiler = aktiflestirmeEkBilgisiHazirla(ilan.ekbilgiler);
  const { data, error } = await supabase
    .from('ilanlar')
    .insert([{ ...ilan, durum: 'aktif', ekbilgiler }])
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
  await suresiDolanIlanlariPasiflestir();

  const { data, error } = await supabase
    .from('ilanlar')
    .select('*, profiles(full_name, phone_number, avatar_url, type)')
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

export async function aracGuncelle(id: string, updates: {
  marka?: string; model?: string; yil?: string;
  plaka?: string; koltuk_sayisi?: string; arac_tipi?: string;
}) {
  const { data, error } = await supabase
    .from('araclar')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
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
    .maybeSingle();
  return { isFavori: !!data, error };
}

export async function mesajGonder(mesaj: {
  gonderen_id: string;
  alan_id: string;
  ilan_id: string;
  mesaj: string;
}) {
  const conversation_id = conversationIdOlustur(mesaj.gonderen_id, mesaj.alan_id);

  const { data, error } = await supabase
    .from('mesajlar')
    .insert([{ ...mesaj, conversation_id }])
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

export async function konusmaMesajlariniGetir(userId: string) {
  const { data, error } = await supabase
    .from('mesajlar')
    .select(`
      *,
      ilanlar(aciklama),
      gonderen:profiles!gonderen_id(id, full_name, phone_number),
      alan:profiles!alan_id(id, full_name, phone_number)
    `)
    .or(`gonderen_id.eq.${userId},alan_id.eq.${userId}`)
    .order('created_at', { ascending: true });

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

export async function mesajSil(mesajId: string, userId: string) {
  return await supabase
    .from('mesajlar')
    .delete()
    .eq('id', mesajId)
    .eq('gonderen_id', userId);
}

export async function konusmaSil(conversationId: string, userId: string) {
  const { data: kullaniciMesajlari, error: listeHatasi } = await supabase
    .from('mesajlar')
    .select('id, conversation_id, gonderen_id, alan_id')
    .or(`gonderen_id.eq.${userId},alan_id.eq.${userId}`);

  if (listeHatasi) return { error: listeHatasi };

  const silinecekIdler = (kullaniciMesajlari || [])
    .filter((mesaj: any) => {
      const key = mesaj.conversation_id || conversationIdOlustur(mesaj.gonderen_id, mesaj.alan_id);
      return key === conversationId;
    })
    .map((mesaj: any) => mesaj.id);

  if (silinecekIdler.length === 0) return { error: null };

  const { error } = await supabase
    .from('mesajlar')
    .delete()
    .in('id', silinecekIdler);

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

export const TAVSIYE_KONU_ON_EKI = '[TAVSIYE] ';

export function destekKaydiTavsiyeMi(konu?: string) {
  return (konu || '').trim().startsWith(TAVSIYE_KONU_ON_EKI.trim());
}

export function tavsiyeKonuTemizle(konu?: string) {
  if (!konu) return 'Tavsiye';
  return konu.replace(TAVSIYE_KONU_ON_EKI, '').trim() || 'Tavsiye';
}

export async function tavsiyeGonder(talep: {
  user_id: string;
  konu: string;
  mesaj: string;
}) {
  const temizKonu = (talep.konu || '').trim() || 'Genel Tavsiye';
  const { data, error } = await supabase
    .from('destek')
    .insert([{
      user_id: talep.user_id,
      konu: `${TAVSIYE_KONU_ON_EKI}${temizKonu}`,
      mesaj: talep.mesaj,
    }])
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

export async function okunmamisDestekSayisi() {
  const { count, error } = await supabase
    .from('destek')
    .select('*', { count: 'exact', head: true })
    .eq('durum', 'bekliyor');
  return { count, error };
}
