import { ISTANBUL_OKUL_PERSONEL_FIRMALARI, KurumsalFirma } from '../data/kurumsalFirmalar';
import { supabase } from './supabase';

const KURUMSAL_FIRMA_ANAHTAR = 'kurumsal_firma_listesi';
const ONLINE_PREFIX = 'online_user_';
const KULLANICI_DUYURU_PREFIX = 'kullanici_duyuru_';
const CEVRIMICI_TIMEOUT_MS = 2 * 60 * 1000;

type CevrimiciKayit = {
  user_id: string;
  full_name: string;
  type?: string;
  last_seen: string;
};

export type KullaniciDuyuru = {
  id: string;
  baslik: string;
  mesaj: string;
  resim_url?: string;
  created_at: string;
  aktif?: boolean;
};

function guvenliJsonParse(raw: unknown) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function webdenDomainCikar(web?: string) {
  if (!web) return '';
  try {
    const u = new URL(web.startsWith('http') ? web : `https://${web}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function logoUrlOlustur(web?: string) {
  const domain = webdenDomainCikar(web);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
}

function firmaNormalize(firma: any): KurumsalFirma | null {
  const ad = String(firma?.ad || '').trim();
  if (!ad) return null;

  let web = String(firma?.web || '').trim();
  if (web && !/^https?:\/\//i.test(web)) {
    web = `https://${web}`;
  }

  const logoUrl = String(firma?.logoUrl || '').trim() || logoUrlOlustur(web);
  return { ad, web, logoUrl };
}

function firmaListesiNormalize(list: any[]): KurumsalFirma[] {
  const benzersiz = new Map<string, KurumsalFirma>();
  (list || []).forEach((f) => {
    const n = firmaNormalize(f);
    if (!n) return;
    benzersiz.set(n.ad.toLowerCase(), n);
  });
  return Array.from(benzersiz.values());
}

function kullaniciDuyuruNormalize(v: any): KullaniciDuyuru | null {
  const id = String(v?.id || '').trim();
  if (!id) return null;
  return {
    id,
    baslik: String(v?.baslik || '').trim(),
    mesaj: String(v?.mesaj || '').trim(),
    resim_url: String(v?.resim_url || '').trim() || undefined,
    created_at: String(v?.created_at || new Date().toISOString()),
    aktif: v?.aktif !== false,
  };
}

export async function kurumsalFirmaListesiGetir(): Promise<KurumsalFirma[]> {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('deger')
    .eq('anahtar', KURUMSAL_FIRMA_ANAHTAR)
    .maybeSingle();

  if (error) return ISTANBUL_OKUL_PERSONEL_FIRMALARI;
  if (!data) return ISTANBUL_OKUL_PERSONEL_FIRMALARI;
  if (typeof data.deger !== 'string') return ISTANBUL_OKUL_PERSONEL_FIRMALARI;

  const parsed = guvenliJsonParse(data.deger);
  if (!Array.isArray(parsed)) return ISTANBUL_OKUL_PERSONEL_FIRMALARI;

  return firmaListesiNormalize(parsed);
}

export async function kurumsalFirmaListesiKaydet(list: KurumsalFirma[]) {
  const temiz = firmaListesiNormalize(list);
  const { data, error } = await supabase
    .from('ayarlar')
    .upsert(
      { anahtar: KURUMSAL_FIRMA_ANAHTAR, deger: JSON.stringify(temiz) },
      { onConflict: 'anahtar' }
    )
    .select()
    .maybeSingle();

  return { data, error };
}

export async function kullaniciOnlineIziGuncelle(input: {
  user_id: string;
  full_name: string;
  type?: string;
}) {
  const payload: CevrimiciKayit = {
    user_id: input.user_id,
    full_name: input.full_name || 'Kullanici',
    type: input.type || 'bireysel',
    last_seen: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('ayarlar')
    .upsert(
      { anahtar: `${ONLINE_PREFIX}${input.user_id}`, deger: JSON.stringify(payload) },
      { onConflict: 'anahtar' }
    );
  return { error };
}

export async function kullaniciOnlineIziTemizle(userId: string) {
  if (!userId) return { error: null };
  const { error } = await supabase
    .from('ayarlar')
    .delete()
    .eq('anahtar', `${ONLINE_PREFIX}${userId}`);
  return { error };
}

export async function cevrimiciKullanicilariGetir() {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('anahtar, deger')
    .like('anahtar', `${ONLINE_PREFIX}%`);

  if (error || !data) return { data: [] as CevrimiciKayit[], error };

  const simdi = Date.now();
  const cevrimici = data
    .map((row: any) => guvenliJsonParse(row?.deger))
    .filter(Boolean)
    .filter((row: any) => {
      const zaman = new Date(row.last_seen || '').getTime();
      if (!Number.isFinite(zaman)) return false;
      return simdi - zaman <= CEVRIMICI_TIMEOUT_MS;
    })
    .map((row: any) => ({
      user_id: String(row.user_id || ''),
      full_name: String(row.full_name || 'Kullanici'),
      type: String(row.type || 'bireysel'),
      last_seen: String(row.last_seen || ''),
    }))
    .filter((row: CevrimiciKayit) => !!row.user_id)
    .sort((a: CevrimiciKayit, b: CevrimiciKayit) =>
      new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    );

  return { data: cevrimici, error: null };
}

export async function kullaniciDuyurusuYayinla(input: {
  baslik?: string;
  mesaj: string;
  resim_url?: string;
}) {
  const id = crypto.randomUUID();
  const payload: KullaniciDuyuru = {
    id,
    baslik: String(input.baslik || '').trim(),
    mesaj: String(input.mesaj || '').trim(),
    resim_url: String(input.resim_url || '').trim() || undefined,
    created_at: new Date().toISOString(),
    aktif: true,
  };

  const { data, error } = await supabase
    .from('ayarlar')
    .upsert(
      { anahtar: `${KULLANICI_DUYURU_PREFIX}${id}`, deger: JSON.stringify(payload) },
      { onConflict: 'anahtar' }
    )
    .select()
    .maybeSingle();

  return { data, error };
}

export async function kullaniciDuyurulariniGetir() {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('anahtar, deger')
    .like('anahtar', `${KULLANICI_DUYURU_PREFIX}%`);

  if (error || !data) return { data: [] as KullaniciDuyuru[], error };

  const list = data
    .map((row: any) => guvenliJsonParse(row?.deger))
    .map(kullaniciDuyuruNormalize)
    .filter(Boolean)
    .filter((v: any) => v.aktif !== false)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { data: list as KullaniciDuyuru[], error: null };
}

export async function kullaniciDuyurusunuSil(id: string) {
  const temiz = String(id || '').trim();
  if (!temiz) return { error: null };
  const { error } = await supabase
    .from('ayarlar')
    .delete()
    .eq('anahtar', `${KULLANICI_DUYURU_PREFIX}${temiz}`);
  return { error };
}
