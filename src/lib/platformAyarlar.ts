import { ISTANBUL_OKUL_PERSONEL_FIRMALARI, KurumsalFirma } from '../data/kurumsalFirmalar';
import { supabase } from './supabase';

const KURUMSAL_FIRMA_ANAHTAR = 'kurumsal_firma_listesi';
const ONLINE_PREFIX = 'online_user_';
const CEVRIMICI_TIMEOUT_MS = 2 * 60 * 1000;

type CevrimiciKayit = {
  user_id: string;
  full_name: string;
  type?: string;
  last_seen: string;
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
    benzersiz.set(n.ad.toLocaleLowerCase('tr-TR'), n);
  });
  return Array.from(benzersiz.values());
}

export async function kurumsalFirmaListesiGetir(): Promise<KurumsalFirma[]> {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('deger')
    .eq('anahtar', KURUMSAL_FIRMA_ANAHTAR)
    .maybeSingle();

  if (error || !data?.deger) return ISTANBUL_OKUL_PERSONEL_FIRMALARI;

  const parsed = guvenliJsonParse(data.deger);
  if (!Array.isArray(parsed)) return ISTANBUL_OKUL_PERSONEL_FIRMALARI;

  const temiz = firmaListesiNormalize(parsed);
  return temiz.length > 0 ? temiz : ISTANBUL_OKUL_PERSONEL_FIRMALARI;
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
