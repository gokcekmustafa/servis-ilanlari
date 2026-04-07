import { ISTANBUL_OKUL_PERSONEL_FIRMALARI, KurumsalFirma } from '../data/kurumsalFirmalar';
import { supabase } from './supabase';

const KURUMSAL_FIRMA_ANAHTAR = 'kurumsal_firma_listesi';
const ONLINE_PREFIX = 'online_user_';
const KULLANICI_DUYURU_PREFIX = 'kullanici_duyuru_';
const SITE_ICERIK_ANAHTAR = 'site_icerik';
const SITE_KATEGORI_ANAHTAR = 'site_kategori_listesi';
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

export type SiteMenuEtiketleri = {
  home: string;
  hakkimizda: string;
  nasil_isliyor: string;
  sss: string;
  iletisim: string;
};

export type SiteSSSMaddesi = {
  soru: string;
  cevap: string;
};

export type SiteIcerigi = {
  site_adi: string;
  footer_kisa_metin: string;
  menu: SiteMenuEtiketleri;
  anasayfa: {
    kategori_baslik: string;
    aktif_ilan_metin_sablon: string;
    filtrele_buton: string;
    temizle_buton: string;
  };
  hakkimizda: {
    baslik: string;
    paragraf_1: string;
    paragraf_2: string;
    imza_ust: string;
    imza_alt: string;
  };
  nasil_isliyor: {
    baslik: string;
    aciklama: string;
    adim_1_baslik: string;
    adim_1_aciklama: string;
    adim_2_baslik: string;
    adim_2_aciklama: string;
    adim_3_baslik: string;
    adim_3_aciklama: string;
  };
  sss: {
    baslik: string;
    sorular: SiteSSSMaddesi[];
  };
  iletisim: {
    baslik: string;
    adres: string;
    destek_mail: string;
    iletisim_mail: string;
    form_baslik: string;
    form_basarili_mesaj: string;
  };
};

export type SiteKategoriRenk =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'yellow'
  | 'red'
  | 'teal'
  | 'slate';

export type SiteKategori = {
  id: string;
  label: string;
  aciklama: string;
  icon: string;
  renk: SiteKategoriRenk;
  aktif?: boolean;
};

export const SITE_KATEGORI_RENKLERI: Record<SiteKategoriRenk, {
  kartBg: string;
  kartBorder: string;
  kartSayi: string;
  kartIconBg: string;
  serit: string;
  badge: string;
}> = {
  blue:   { kartBg: 'bg-blue-50',   kartBorder: 'border-blue-200',   kartSayi: 'text-blue-600',   kartIconBg: 'bg-blue-100',   serit: 'bg-blue-500',   badge: 'bg-blue-500' },
  green:  { kartBg: 'bg-green-50',  kartBorder: 'border-green-200',  kartSayi: 'text-green-600',  kartIconBg: 'bg-green-100',  serit: 'bg-green-500',  badge: 'bg-green-500' },
  orange: { kartBg: 'bg-orange-50', kartBorder: 'border-orange-200', kartSayi: 'text-orange-600', kartIconBg: 'bg-orange-100', serit: 'bg-orange-500', badge: 'bg-orange-500' },
  purple: { kartBg: 'bg-purple-50', kartBorder: 'border-purple-200', kartSayi: 'text-purple-600', kartIconBg: 'bg-purple-100', serit: 'bg-purple-500', badge: 'bg-purple-500' },
  pink:   { kartBg: 'bg-pink-50',   kartBorder: 'border-pink-200',   kartSayi: 'text-pink-600',   kartIconBg: 'bg-pink-100',   serit: 'bg-pink-500',   badge: 'bg-pink-500' },
  yellow: { kartBg: 'bg-yellow-50', kartBorder: 'border-yellow-200', kartSayi: 'text-yellow-600', kartIconBg: 'bg-yellow-100', serit: 'bg-yellow-500', badge: 'bg-yellow-500' },
  red:    { kartBg: 'bg-red-50',    kartBorder: 'border-red-200',    kartSayi: 'text-red-600',    kartIconBg: 'bg-red-100',    serit: 'bg-red-500',    badge: 'bg-red-500' },
  teal:   { kartBg: 'bg-teal-50',   kartBorder: 'border-teal-200',   kartSayi: 'text-teal-600',   kartIconBg: 'bg-teal-100',   serit: 'bg-teal-500',   badge: 'bg-teal-500' },
  slate:  { kartBg: 'bg-slate-50',  kartBorder: 'border-slate-200',  kartSayi: 'text-slate-600',  kartIconBg: 'bg-slate-100',  serit: 'bg-slate-500',  badge: 'bg-slate-500' },
};

export const VARSAYILAN_SITE_ICERIGI: SiteIcerigi = {
  site_adi: 'ilanhemen.com',
  footer_kisa_metin: 'Servis araci ve sofor ilanlari platformu. Turkiye genelinde binlerce ilan ile hizmetinizdeyiz.',
  menu: {
    home: 'Anasayfa',
    hakkimizda: 'Hakkimizda',
    nasil_isliyor: 'Nasil Isliyor',
    sss: 'S.S.S',
    iletisim: 'Iletisim',
  },
  anasayfa: {
    kategori_baslik: 'Ilan Kategorileri',
    aktif_ilan_metin_sablon: '{count} aktif ilan',
    filtrele_buton: 'Filtrele',
    temizle_buton: 'Temizle',
  },
  hakkimizda: {
    baslik: 'Hakkimizda',
    paragraf_1: 'Servis Ilanlari, 2025 yilindan beri ogrenci ve personel tasimaciligi yapan turizm sirketleri ile bireysel tasimacilari, soforleri ve hostesleri bulusturan bir platformdur.',
    paragraf_2: 'Servis sektorune ucretsiz olarak sunulan bu hizmete ilgi buyudukce platforma yapilan yazilim gelistirmeleriyle birlikte Servis Ilanlari 2026 yilinda tum Turkiye genelinde hizmet vermeye basladi.',
    imza_ust: 'Saygilarimizla,',
    imza_alt: 'Servis Ilanlari Ekibi',
  },
  nasil_isliyor: {
    baslik: 'Nasil Isliyor',
    aciklama: 'Kolay bir sekilde telefon numaranizla kaydolarak hemen ucretsiz ilan vermeye baslayabilirsiniz.',
    adim_1_baslik: '1. Uye Ol',
    adim_1_aciklama: 'Telefon numaraniz ve sifrenizle saniyeler icinde ucretsiz kayit olun.',
    adim_2_baslik: '2. Ilan Ver',
    adim_2_aciklama: 'Arac, sofor veya hostes ilaninizi ucretsiz olarak yayinlayin.',
    adim_3_baslik: '3. Iletisime Gec',
    adim_3_aciklama: 'Ilgilendiginiz ilanin sahibiyle dogrudan iletisime gecin.',
  },
  sss: {
    baslik: 'Sikca Sorulan Sorular',
    sorular: [
      { soru: 'Nasil Uye Olunur?', cevap: 'Ana sayfanin sag ust kismindaki Uye Ol butonundan kayit formunu doldurarak uye olabilirsiniz.' },
      { soru: 'Uye olmadan ilan verebilir miyim?', cevap: 'Uye olmadan ilan veremezsiniz.' },
      { soru: 'Ilan vermek ucretli mi?', cevap: 'Tamamen ucretsizdir.' },
    ],
  },
  iletisim: {
    baslik: 'Iletisim',
    adres: 'Saadetdere Mah. Esenyurt / Istanbul',
    destek_mail: 'destek@servisilanlari.com',
    iletisim_mail: 'info@servisilanlari.com',
    form_baslik: 'Bize Yazin',
    form_basarili_mesaj: 'Mesajiniz basariyla gonderildi! En kisa surede donecegiz.',
  },
};

export const VARSAYILAN_SITE_KATEGORILERI: SiteKategori[] = [
  { id: 'isim_var_arac', label: 'Isim Var Arac Ariyorum', aciklama: 'Personel veya ogrenci servisi icin arac', icon: '🔍', renk: 'blue', aktif: true },
  { id: 'aracim_var_is', label: 'Aracim Var Is Ariyorum', aciklama: 'Araciyla birlikte is arayan tasimacilar', icon: '🚌', renk: 'green', aktif: true },
  { id: 'sofor_ariyorum', label: 'Aracim Var Sofor Ariyorum', aciklama: 'Profesyonel sofor arayan firmalar', icon: '👤', renk: 'orange', aktif: true },
  { id: 'hostes_ariyorum', label: 'Aracim Var Hostes Ariyorum', aciklama: 'Servis hostesi arayan ilanlar', icon: '👩', renk: 'purple', aktif: true },
  { id: 'soforum_is', label: 'Soforum Is Ariyorum', aciklama: 'Deneyimli soforler is ariyor', icon: '🚗', renk: 'yellow', aktif: true },
  { id: 'hostesim_is', label: 'Hostesim Is Ariyorum', aciklama: 'Hostes is ilanlari', icon: '💼', renk: 'pink', aktif: true },
  { id: 'plaka_satiyorum', label: 'Plakami Satiyorum', aciklama: 'Satilik servis plaka ilanlari', icon: '🪧', renk: 'red', aktif: true },
  { id: 'aracimi_satiyorum', label: 'Aracimi Satiyorum', aciklama: 'Satilik servis araclari', icon: '🚐', renk: 'teal', aktif: true },
];

function guvenliJsonParse(raw: unknown) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function metinTemiz(v: any) {
  return String(v || '').trim();
}

function slugifyKategoriId(v: string) {
  return metinTemiz(v)
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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

function sssMaddesiNormalize(v: any): SiteSSSMaddesi | null {
  const soru = metinTemiz(v?.soru);
  const cevap = metinTemiz(v?.cevap);
  if (!soru || !cevap) return null;
  return { soru, cevap };
}

function siteIcerigiNormalize(v: any): SiteIcerigi {
  const kaynak = (v && typeof v === 'object') ? v : {};
  const menu = (kaynak.menu && typeof kaynak.menu === 'object') ? kaynak.menu : {};
  const anasayfa = (kaynak.anasayfa && typeof kaynak.anasayfa === 'object') ? kaynak.anasayfa : {};
  const hakkimizda = (kaynak.hakkimizda && typeof kaynak.hakkimizda === 'object') ? kaynak.hakkimizda : {};
  const nasil = (kaynak.nasil_isliyor && typeof kaynak.nasil_isliyor === 'object') ? kaynak.nasil_isliyor : {};
  const sss = (kaynak.sss && typeof kaynak.sss === 'object') ? kaynak.sss : {};
  const iletisim = (kaynak.iletisim && typeof kaynak.iletisim === 'object') ? kaynak.iletisim : {};
  const sorular = Array.isArray(sss.sorular) ? sss.sorular.map(sssMaddesiNormalize).filter(Boolean) as SiteSSSMaddesi[] : [];

  return {
    site_adi: metinTemiz(kaynak.site_adi) || VARSAYILAN_SITE_ICERIGI.site_adi,
    footer_kisa_metin: metinTemiz(kaynak.footer_kisa_metin) || VARSAYILAN_SITE_ICERIGI.footer_kisa_metin,
    menu: {
      home: metinTemiz(menu.home) || VARSAYILAN_SITE_ICERIGI.menu.home,
      hakkimizda: metinTemiz(menu.hakkimizda) || VARSAYILAN_SITE_ICERIGI.menu.hakkimizda,
      nasil_isliyor: metinTemiz(menu.nasil_isliyor) || VARSAYILAN_SITE_ICERIGI.menu.nasil_isliyor,
      sss: metinTemiz(menu.sss) || VARSAYILAN_SITE_ICERIGI.menu.sss,
      iletisim: metinTemiz(menu.iletisim) || VARSAYILAN_SITE_ICERIGI.menu.iletisim,
    },
    anasayfa: {
      kategori_baslik: metinTemiz(anasayfa.kategori_baslik) || VARSAYILAN_SITE_ICERIGI.anasayfa.kategori_baslik,
      aktif_ilan_metin_sablon: metinTemiz(anasayfa.aktif_ilan_metin_sablon) || VARSAYILAN_SITE_ICERIGI.anasayfa.aktif_ilan_metin_sablon,
      filtrele_buton: metinTemiz(anasayfa.filtrele_buton) || VARSAYILAN_SITE_ICERIGI.anasayfa.filtrele_buton,
      temizle_buton: metinTemiz(anasayfa.temizle_buton) || VARSAYILAN_SITE_ICERIGI.anasayfa.temizle_buton,
    },
    hakkimizda: {
      baslik: metinTemiz(hakkimizda.baslik) || VARSAYILAN_SITE_ICERIGI.hakkimizda.baslik,
      paragraf_1: metinTemiz(hakkimizda.paragraf_1) || VARSAYILAN_SITE_ICERIGI.hakkimizda.paragraf_1,
      paragraf_2: metinTemiz(hakkimizda.paragraf_2) || VARSAYILAN_SITE_ICERIGI.hakkimizda.paragraf_2,
      imza_ust: metinTemiz(hakkimizda.imza_ust) || VARSAYILAN_SITE_ICERIGI.hakkimizda.imza_ust,
      imza_alt: metinTemiz(hakkimizda.imza_alt) || VARSAYILAN_SITE_ICERIGI.hakkimizda.imza_alt,
    },
    nasil_isliyor: {
      baslik: metinTemiz(nasil.baslik) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.baslik,
      aciklama: metinTemiz(nasil.aciklama) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.aciklama,
      adim_1_baslik: metinTemiz(nasil.adim_1_baslik) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.adim_1_baslik,
      adim_1_aciklama: metinTemiz(nasil.adim_1_aciklama) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.adim_1_aciklama,
      adim_2_baslik: metinTemiz(nasil.adim_2_baslik) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.adim_2_baslik,
      adim_2_aciklama: metinTemiz(nasil.adim_2_aciklama) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.adim_2_aciklama,
      adim_3_baslik: metinTemiz(nasil.adim_3_baslik) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.adim_3_baslik,
      adim_3_aciklama: metinTemiz(nasil.adim_3_aciklama) || VARSAYILAN_SITE_ICERIGI.nasil_isliyor.adim_3_aciklama,
    },
    sss: {
      baslik: metinTemiz(sss.baslik) || VARSAYILAN_SITE_ICERIGI.sss.baslik,
      sorular: sorular.length > 0 ? sorular : VARSAYILAN_SITE_ICERIGI.sss.sorular,
    },
    iletisim: {
      baslik: metinTemiz(iletisim.baslik) || VARSAYILAN_SITE_ICERIGI.iletisim.baslik,
      adres: metinTemiz(iletisim.adres) || VARSAYILAN_SITE_ICERIGI.iletisim.adres,
      destek_mail: metinTemiz(iletisim.destek_mail) || VARSAYILAN_SITE_ICERIGI.iletisim.destek_mail,
      iletisim_mail: metinTemiz(iletisim.iletisim_mail) || VARSAYILAN_SITE_ICERIGI.iletisim.iletisim_mail,
      form_baslik: metinTemiz(iletisim.form_baslik) || VARSAYILAN_SITE_ICERIGI.iletisim.form_baslik,
      form_basarili_mesaj: metinTemiz(iletisim.form_basarili_mesaj) || VARSAYILAN_SITE_ICERIGI.iletisim.form_basarili_mesaj,
    },
  };
}

function siteKategoriNormalize(v: any): SiteKategori | null {
  const id = slugifyKategoriId(v?.id || v?.label || '');
  const label = metinTemiz(v?.label);
  if (!id || !label) return null;
  const renkHam = metinTemiz(v?.renk) as SiteKategoriRenk;
  const renk: SiteKategoriRenk = SITE_KATEGORI_RENKLERI[renkHam] ? renkHam : 'slate';
  return {
    id,
    label,
    aciklama: metinTemiz(v?.aciklama),
    icon: metinTemiz(v?.icon) || '📌',
    renk,
    aktif: v?.aktif !== false,
  };
}

function siteKategoriListesiNormalize(v: any): SiteKategori[] {
  const list = Array.isArray(v) ? v : [];
  const map = new Map<string, SiteKategori>();
  list.forEach((raw) => {
    const norm = siteKategoriNormalize(raw);
    if (!norm) return;
    map.set(norm.id, norm);
  });
  const temiz = Array.from(map.values());
  return temiz.length > 0 ? temiz : VARSAYILAN_SITE_KATEGORILERI;
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

export async function siteIcerigiGetir() {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('deger')
    .eq('anahtar', SITE_ICERIK_ANAHTAR)
    .maybeSingle();

  if (error || !data || typeof data.deger !== 'string') {
    return { data: VARSAYILAN_SITE_ICERIGI, error: error || null };
  }

  const parsed = guvenliJsonParse(data.deger);
  return { data: siteIcerigiNormalize(parsed), error: null };
}

export async function siteIcerigiKaydet(icerik: SiteIcerigi) {
  const temiz = siteIcerigiNormalize(icerik);
  const { data, error } = await supabase
    .from('ayarlar')
    .upsert(
      { anahtar: SITE_ICERIK_ANAHTAR, deger: JSON.stringify(temiz) },
      { onConflict: 'anahtar' }
    )
    .select()
    .maybeSingle();
  return { data, error };
}

export async function siteKategorileriGetir() {
  const { data, error } = await supabase
    .from('ayarlar')
    .select('deger')
    .eq('anahtar', SITE_KATEGORI_ANAHTAR)
    .maybeSingle();

  if (error || !data || typeof data.deger !== 'string') {
    return { data: VARSAYILAN_SITE_KATEGORILERI, error: error || null };
  }
  const parsed = guvenliJsonParse(data.deger);
  return { data: siteKategoriListesiNormalize(parsed), error: null };
}

export async function siteKategorileriKaydet(kategoriler: SiteKategori[]) {
  const temiz = siteKategoriListesiNormalize(kategoriler);
  const { data, error } = await supabase
    .from('ayarlar')
    .upsert(
      { anahtar: SITE_KATEGORI_ANAHTAR, deger: JSON.stringify(temiz) },
      { onConflict: 'anahtar' }
    )
    .select()
    .maybeSingle();
  return { data, error };
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
