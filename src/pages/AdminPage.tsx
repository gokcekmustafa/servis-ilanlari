import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';
import {
  LayoutDashboard, Users, FileText, Megaphone,
  Image, LogOut, Trash2, PlusCircle, RefreshCw,
  Shield, UserPlus, CheckCircle2, XCircle, Edit2, Save, X, Lock,
  Eye, EyeOff, ChevronRight, AlertTriangle, Phone, Calendar,
  MessageCircle, Camera, Star, Bell, Ban, Download, Menu, User,
} from 'lucide-react';

// ─── TİPLER ───────────────────────────────────────────────────────────────────

export type PersonelYetkiler = {
  ilan_onay?: boolean;
  ilan_sil?: boolean;
  kullanici_yonetimi?: boolean;
  destek_yonetimi?: boolean;
  reklam_yonetimi?: boolean;
  duyuru_yonetimi?: boolean;
};

export type KullaniciKisitlamalar = {
  mesaj_gonderme?: boolean;
  profil_resmi_degistirme?: boolean;
  profil_resmi_silme?: boolean;
  ilan_verme?: boolean;
  yorum_yapma?: boolean;
  arama?: boolean;
  favori_ekleme?: boolean;
  bildirim_alma?: boolean;
  profil_goruntuleme?: boolean;
  iletisim_bilgisi?: boolean;
  dosya_yukleme?: boolean;
  hesap_silme?: boolean;
};

type AdminPageProps = {
  onLogout: () => void;
  onIlanDetay: (ilan: Ilan) => void;
  isSuperAdmin: boolean;
  yetkiler: PersonelYetkiler;
  defaultSekme?: Sekme | 'bildirimler';
};

type Sekme = 'istatistik' | 'ilanlar' | 'kullanicilar' | 'reklamlar' | 'duyurular' | 'destek' | 'personel' | 'logo';

const SEKME_YETKI: Partial<Record<Sekme, keyof PersonelYetkiler>> = {
  ilanlar:      'ilan_onay',
  kullanicilar: 'kullanici_yonetimi',
  reklamlar:    'reklam_yonetimi',
  duyurular:    'duyuru_yonetimi',
  destek:       'destek_yonetimi',
};

const PERSONEL_YETKI_TANIM: Record<string, { label: string; aciklama: string }> = {
  ilan_onay:          { label: 'İlan Onay',   aciklama: 'İlanları aktif/pasif yapabilir' },
  ilan_sil:           { label: 'İlan Sil',    aciklama: 'İlanları silebilir' },
  kullanici_yonetimi: { label: 'Kullanıcı',  aciklama: 'Kullanıcıları düzenleyip yönetebilir' },
  destek_yonetimi:    { label: 'Destek',     aciklama: 'Destek taleplerini cevaplayabilir' },
  reklam_yonetimi:    { label: 'Reklam',     aciklama: 'Reklam ekleyip yönetebilir' },
  duyuru_yonetimi:    { label: 'Duyuru',     aciklama: 'Duyuru ekleyip yönetebilir' },
};

const KISITLAMA_TANIM: Record<string, { label: string; aciklama: string; ikon: React.ReactNode }> = {
  mesaj_gonderme:          { label: 'Mesajlaşma',              aciklama: 'Kullanıcı mesaj gönderemez',             ikon: <MessageCircle size={14} /> },
  profil_resmi_degistirme: { label: 'Profil Resmi Değiştirme', aciklama: 'Profil fotoğrafını değiştiremez',        ikon: <Camera size={14} /> },
  profil_resmi_silme:      { label: 'Profil Resmi Silme',      aciklama: 'Profil fotoğrafını silemez',             ikon: <Trash2 size={14} /> },
  ilan_verme:              { label: 'İlan Verme',              aciklama: 'Yeni ilan oluşturamaz',                  ikon: <FileText size={14} /> },
  yorum_yapma:             { label: 'Yorum Yapma',             aciklama: 'Yorum ve değerlendirme yapamaz',         ikon: <Star size={14} /> },
  arama:                   { label: 'Arama',                   aciklama: 'Arama özelliğini kullanamaz',            ikon: <Ban size={14} /> },
  favori_ekleme:           { label: 'Favori Ekleme',           aciklama: 'İlan favorilere ekleyemez',              ikon: <Star size={14} /> },
  bildirim_alma:           { label: 'Bildirimler',             aciklama: 'Uygulama bildirimleri iletilmez',        ikon: <Bell size={14} /> },
  profil_goruntuleme:      { label: 'Profil Gizleme',          aciklama: 'Profili diğer kullanıcılara gizlenir',   ikon: <Eye size={14} /> },
  iletisim_bilgisi:        { label: 'İletişim Bilgisi',        aciklama: 'Başkaları iletişim bilgisini göremez',   ikon: <Phone size={14} /> },
  dosya_yukleme:           { label: 'Dosya Yükleme',           aciklama: 'Dosya ve resim yükleyemez',              ikon: <Download size={14} /> },
  hesap_silme:             { label: 'Hesap Silme',             aciklama: 'Kendi hesabını silemez',                 ikon: <AlertTriangle size={14} /> },
};

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────

export default function AdminPage({ onLogout, onIlanDetay, isSuperAdmin, yetkiler, defaultSekme }: AdminPageProps) {
  const ilkSekme: Sekme = defaultSekme === 'bildirimler' ? 'destek' : (defaultSekme || 'istatistik');
  const [aktifSekme, setAktifSekme] = useState<Sekme>(ilkSekme);
  const [ilanlar, setIlanlar]             = useState<any[]>([]);
  const [kullanicilar, setKullanicilar]   = useState<any[]>([]);
  const [reklamlar, setReklamlar]         = useState<any[]>([]);
  const [duyurular, setDuyurular]         = useState<any[]>([]);
  const [destekler, setDestekler]         = useState<any[]>([]);
  const [yukleniyor, setYukleniyor]       = useState(true);
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
  const [platformLogo, setPlatformLogo] = useState<string>('');
const [logoYukleniyor, setLogoYukleniyor] = useState(false);

  const [yeniReklam, setYeniReklam]             = useState({ baslik: '', resim_url: '', link_url: '', konum: 'liste' });
  const [reklamYukleniyor, setReklamYukleniyor] = useState(false);
  const [surukleAktif, setSurukleAktif]         = useState(false);

  // Reklam düzenleme state'leri
  const [duzenleReklam, setDuzenleReklam]       = useState<any>(null); // düzenlenen reklam
  const [duzenleForm, setDuzenleForm]           = useState({ baslik: '', link_url: '', konum: 'liste', resim_url: '' });
  const [duzenleResimYukleniyor, setDuzenleResimYukleniyor] = useState(false);
  const [duzenleSurukle, setDuzenleSurukle]     = useState(false);

  // İlan arası reklam sıklığı
  const [reklamSiklik, setReklamSiklik]         = useState(8);
  const [siklikKaydediyor, setSiklikKaydediyor] = useState(false);
  const [siklikMesaj, setSiklikMesaj]           = useState('');

  const [yeniDuyuru, setYeniDuyuru]       = useState({ baslik: '', mesaj: '', resim_url: '', saniye: 2, goster_sure: 8 });
  const [duyuruYukleniyor, setDuyuruYukleniyor] = useState(false);
  const [duyuruSurukle, setDuyuruSurukle]       = useState(false);
  const [seciliDestek, setSeciliDestek]   = useState<any>(null);
  const [destekCevap, setDestekCevap]     = useState('');

  const [detayModal, setDetayModal]               = useState<any>(null);
  const [detaySifre, setDetaySifre]               = useState('');
  const [detaySifreGoster, setDetaySifreGoster]   = useState(false);
  const [detayDuzenle, setDetayDuzenle]           = useState(false);
  const [detayKisitlamalar, setDetayKisitlamalar] = useState<KullaniciKisitlamalar>({});
  const [detayKaydediyor, setDetayKaydediyor]     = useState(false);

  const [personelFormAcik, setPersonelFormAcik] = useState(false);
  const [seciliPersonel, setSeciliPersonel]       = useState<any>(null);
  const [personelForm, setPersonelForm]           = useState({
    full_name: '', phone_number: '', password: '', aktif: true,
    yetkiler: Object.fromEntries(Object.keys(PERSONEL_YETKI_TANIM).map(k => [k, false])) as PersonelYetkiler,
  });
  const [personelSifreGoster, setPersonelSifreGoster] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.body.style.overflow = mobilMenuAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobilMenuAcik]);

  useEffect(() => {
    sessionStorage.setItem('admin_aktif_sekme', aktifSekme);
  }, [aktifSekme]);

  useEffect(() => { hepsiniYukle(); }, []);

  useEffect(() => {
    if (aktifSekme !== 'destek') return;
    const hedefDestekId = sessionStorage.getItem('admin_secili_destek');
    if (!hedefDestekId) return;
    const hedef = destekler.find((d: any) => d.id === hedefDestekId);
    if (!hedef) return;

    setSeciliDestek(hedef);
    setDestekCevap(hedef.cevap || '');
    sessionStorage.removeItem('admin_secili_destek');

    if (hedef.durum === 'bekliyor') {
      supabase.from('destek').update({ durum: 'islemde' }).eq('id', hedef.id).then(() => {
        setDestekler(prev => prev.map(x => x.id === hedef.id ? { ...x, durum: 'islemde' } : x));
        window.dispatchEvent(new Event('bildirimler:degisti'));
      });
    }
  }, [aktifSekme, destekler]);

  const hepsiniYukle = async () => {
    setYukleniyor(true);
    const [u, i, r, d, ds, ayar, logoAyar] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('ilanlar').select('*').order('created_at', { ascending: false }),
      supabase.from('reklamlar').select('*').order('id', { ascending: false }),
      supabase.from('duyurular').select('*').order('id', { ascending: false }),
      supabase.from('destek').select('*').order('created_at', { ascending: false }),
      supabase.from('ayarlar').select('*').eq('anahtar', 'reklam_siklik').single(),
      supabase.from('ayarlar').select('*').eq('anahtar', 'platform_logo').single(),
    ]);
    setKullanicilar(u.data || []);
    setIlanlar(i.data || []);
    setReklamlar(r.data || []);
    setDuyurular(d.data || []);
    setDestekler(ds.data || []);
    if (ayar.data?.deger) setReklamSiklik(Number(ayar.data.deger));
    if (logoAyar.data?.deger) setPlatformLogo(logoAyar.data.deger);
    setYukleniyor(false);
  };

  const hashPassword = async (pass: string) => {
    const enc = new TextEncoder().encode(pass + 'servis-ilanlari-salt');
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const sekmeYetkiVarMi = (s: Sekme) => {
    if (isSuperAdmin) return true;
    if (s === 'istatistik') return true;
    if (s === 'personel') return false;
    const k = SEKME_YETKI[s];
    return k ? !!(yetkiler as any)[k] : true;
  };

  const sekmeSecildi = (s: Sekme) => {
    setAktifSekme(s);
    setMobilMenuAcik(false);
  };

  // ─── KULLANICI DETAY ────────────────────────────────────────────────────────

  const kullaniciDetayAc = (u: any) => {
    setDetayModal(u);
    setDetaySifre('');
    setDetaySifreGoster(false);
    setDetayDuzenle(false);
    setDetayKisitlamalar(u.kisitlamalar || {});
  };

  const detayKaydet = async () => {
    if (!detayModal) return;
    setDetayKaydediyor(true);
    const g: any = { full_name: detayModal.full_name, phone_number: detayModal.phone_number, aktif: detayModal.aktif, kisitlamalar: detayKisitlamalar };
    if (detaySifre) { g.password_hash = await hashPassword(detaySifre); g.sifre_acik = detaySifre; }
    await supabase.from('profiles').update(g).eq('id', detayModal.id);
    setDetayKaydediyor(false);
    setDetayDuzenle(false);
    setDetaySifre('');
    setDetayModal({ ...detayModal, ...g });
    hepsiniYukle();
  };

  const kullaniciSil = async (id: string) => {
    if (!window.confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    setDetayModal(null);
    hepsiniYukle();
  };

  // ─── İLAN ───────────────────────────────────────────────────────────────────

  const ilanSil = async (id: string) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('id', id);
    hepsiniYukle();
  };

  // ─── REKLAM ─────────────────────────────────────────────────────────────────

  const dosyaYukle = async (dosya: File, hedef: 'yeni' | 'duzenle' = 'yeni') => {
    if (!dosya.type.startsWith('image/')) { alert('Sadece resim dosyası yükleyebilirsiniz'); return; }
    if (hedef === 'yeni') setReklamYukleniyor(true);
    else setDuzenleResimYukleniyor(true);
    const ad = Date.now() + '-' + dosya.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const { error } = await supabase.storage.from('reklamlar').upload(ad, dosya, { contentType: dosya.type });
    if (error) { alert('Yüklerken hata: ' + error.message); setReklamYukleniyor(false); setDuzenleResimYukleniyor(false); return; }
    const { data: u } = supabase.storage.from('reklamlar').getPublicUrl(ad);
    if (hedef === 'yeni') { setYeniReklam(p => ({ ...p, resim_url: u.publicUrl })); setReklamYukleniyor(false); }
    else { setDuzenleForm(p => ({ ...p, resim_url: u.publicUrl })); setDuzenleResimYukleniyor(false); }
  };

  const reklamDuzenleAc = (r: any) => {
    setDuzenleReklam(r);
    setDuzenleForm({ baslik: r.baslik || '', link_url: r.link_url || '', konum: r.konum || 'liste', resim_url: r.resim_url || '' });
  };

  const reklamDuzenleKaydet = async () => {
    if (!duzenleReklam) return;
    await supabase.from('reklamlar').update({
      baslik: duzenleForm.baslik,
      link_url: duzenleForm.link_url,
      konum: duzenleForm.konum,
      resim_url: duzenleForm.resim_url,
    }).eq('id', duzenleReklam.id);
    setDuzenleReklam(null);
    hepsiniYukle();
  };

  const siklikKaydet = async () => {
    setSiklikKaydediyor(true);
    // upsert: anahtar yoksa ekle, varsa güncelle
    await supabase.from('ayarlar').upsert({ anahtar: 'reklam_siklik', deger: String(reklamSiklik) }, { onConflict: 'anahtar' });
    setSiklikKaydediyor(false);
    setSiklikMesaj('Kaydedildi ✓');
    setTimeout(() => setSiklikMesaj(''), 2500);
  };

  const duyuruResimYukle = async (dosya: File) => {
    if (!dosya.type.startsWith('image/')) { alert('Sadece resim dosyası yükleyebilirsiniz'); return; }
    setDuyuruYukleniyor(true);
    const ad = 'duyuru-' + Date.now() + '-' + dosya.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const { error } = await supabase.storage.from('reklamlar').upload(ad, dosya, { contentType: dosya.type });
    if (error) { alert('Yüklerken hata: ' + error.message); setDuyuruYukleniyor(false); return; }
    const { data: u } = supabase.storage.from('reklamlar').getPublicUrl(ad);
    setYeniDuyuru(p => ({ ...p, resim_url: u.publicUrl }));
    setDuyuruYukleniyor(false);
  };

  // ─── PERSONEL ────────────────────

  const personelKaydet = async () => {
    if (!personelForm.full_name || !personelForm.phone_number) { alert('Ad soyad ve telefon zorunludur.'); return; }
    if (seciliPersonel) {
      const g: any = { full_name: personelForm.full_name, phone_number: personelForm.phone_number, aktif: personelForm.aktif, yetkiler: personelForm.yetkiler, type: 'admin' };
      if (personelForm.password) { g.password_hash = await hashPassword(personelForm.password); g.sifre_acik = personelForm.password; }
      await supabase.from('profiles').update(g).eq('id', seciliPersonel.id);
    } else {
      if (!personelForm.password) { alert('Yeni personel için şifre zorunludur.'); return; }
      const hash = await hashPassword(personelForm.password);
      await supabase.from('profiles').insert([{ full_name: personelForm.full_name, phone_number: personelForm.phone_number, type: 'admin', sifre_acik: personelForm.password, password_hash: hash, aktif: personelForm.aktif, yetkiler: personelForm.yetkiler }]);
    }
    setSeciliPersonel(null);
    setPersonelFormAcik(false);
    setPersonelForm({ full_name: '', phone_number: '', password: '', aktif: true, yetkiler: Object.fromEntries(Object.keys(PERSONEL_YETKI_TANIM).map(k => [k, false])) as PersonelYetkiler });
    hepsiniYukle();
  };

  const personelDuzenleAc = (p: any) => {
    setSeciliPersonel(p);
    setPersonelForm({ full_name: p.full_name, phone_number: p.phone_number, password: '', aktif: p.aktif ?? true, yetkiler: { ...Object.fromEntries(Object.keys(PERSONEL_YETKI_TANIM).map(k => [k, false])), ...(p.yetkiler || {}) } as PersonelYetkiler });
    setPersonelFormAcik(true);

  };

  // ─── STILLER ────────────────────────────────────────────────────────────────

  const ic   = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
  const btnO = 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition';
  const btnS = 'bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-lg transition';
  const btnR = 'bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2.5 rounded-lg transition border border-red-200';

  const YetkisizUyari = ({ sekme }: { sekme: string }) => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-slate-400">
      <Lock size={36} className="mb-3 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">Bu bölüme erişim yetkiniz yok</p>
      <p className="text-xs mt-1 text-center px-4">Yöneticinizden "{sekme}" yetkisi talep ediniz.</p>
    </div>
  );

  const logoYukle = async (dosya: File) => {
  if (!dosya.type.startsWith('image/')) { alert('Sadece resim dosyası yükleyebilirsiniz'); return; }
  setLogoYukleniyor(true);
  const ad = 'platform-logo-' + Date.now() + '-' + dosya.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const { error } = await supabase.storage.from('reklamlar').upload(ad, dosya, { contentType: dosya.type });
  if (error) { alert('Yüklerken hata: ' + error.message); setLogoYukleniyor(false); return; }
  const { data: u } = supabase.storage.from('reklamlar').getPublicUrl(ad);
  const yeniUrl = u.publicUrl;
  await supabase.from('ayarlar').upsert({ anahtar: 'platform_logo', deger: yeniUrl }, { onConflict: 'anahtar' });
  setPlatformLogo(yeniUrl);
  setLogoYukleniyor(false);
};
  
  const menuItems = [
    { id: 'istatistik',   label: 'İstatistikler', icon: LayoutDashboard },
    { id: 'ilanlar',      label: 'İlanlar',        icon: FileText,       sayi: ilanlar.length },
    { id: 'kullanicilar', label: 'Kullanıcılar',   icon: Users,          sayi: kullanicilar.filter(u => u.type !== 'admin').length },
    { id: 'reklamlar',    label: 'Reklamlar',      icon: Image,          sayi: reklamlar.length },
    { id: 'duyurular',    label: 'Duyurular',      icon: Megaphone,      sayi: duyurular.length },
    { id: 'destek',       label: 'Destek Talepleri', icon: Bell,         sayi: destekler.filter(d => d.durum === 'bekliyor').length },
    ...(isSuperAdmin ? [
  { id: 'personel', label: 'Personel', icon: Shield, sayi: kullanicilar.filter(u => u.type === 'admin').length },
  { id: 'logo', label: 'Platform Logo', icon: Image, sayi: 0 },
] : []),
  ].map(item => ({ ...item, kilitli: !sekmeYetkiVarMi(item.id as Sekme) }));

  const SidebarIcerik = ({ kapatFn }: { kapatFn?: () => void }) => (
    <>
      <div className="px-4 py-5 border-b border-slate-700">
        <p className="text-white font-bold text-base">Yönetim Paneli</p>
        <p className="text-slate-400 text-xs mt-0.5">{isSuperAdmin ? '⭐ Süper Yönetici' : '🔑 Yönetici'}</p>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const aktif = aktifSekme === item.id;
          return (
            <button key={item.id}
              onClick={() => { if (!item.kilitli) { setAktifSekme(item.id as Sekme); kapatFn?.(); } }}
              title={item.kilitli ? 'Bu bölüm için yetkiniz yok' : ''}
              className={'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition ' +
                (item.kilitli ? 'text-slate-600 cursor-not-allowed opacity-40' :
                 aktif ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white')}>
              <span className="flex items-center gap-2.5"><Icon size={16} />{item.label}</span>
              <span className="flex items-center gap-1">
                {item.kilitli && <Lock size={10} />}
                {(item as any).sayi > 0 && !item.kilitli && (
                  <span className={'text-xs px-1.5 py-0.5 rounded-full font-bold ' + (aktif ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-300')}>
                    {(item as any).sayi}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
      {!isSuperAdmin && (
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wide mb-2">Yetkilerim</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(yetkiler).filter(([, v]) => v).map(([k]) => (
              <span key={k} className="text-[10px] bg-orange-900/40 text-orange-300 px-1.5 py-0.5 rounded-full">
                {PERSONEL_YETKI_TANIM[k]?.label || k}
              </span>
            ))}
            {Object.values(yetkiler).every(v => !v) && <span className="text-[10px] text-slate-500">Yetki atanmamış</span>}
          </div>
        </div>
      )}
      <div className="p-4 border-t border-slate-700">
        <button onClick={onLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm py-2 transition">
          <LogOut size={15} />Çıkış Yap
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* MOBİL ÜST BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-800 flex items-center justify-between px-4 py-3 shadow-lg">
        <button onClick={() => setMobilMenuAcik(true)} className="p-1.5 text-slate-300 hover:text-white rounded-lg">
          <Menu size={20} />
        </button>
        <p className="text-white font-semibold text-sm">{menuItems.find(m => m.id === aktifSekme)?.label}</p>
        <button onClick={hepsiniYukle} className="p-1.5 text-slate-300 hover:text-white rounded-lg">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* MOBİL SIDEBAR DRAWER */}
      {mobilMenuAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <aside className="w-64 bg-slate-800 flex flex-col h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="text-slate-300 text-xs">Menü</span>
              <button onClick={() => setMobilMenuAcik(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg"><X size={18} /></button>
            </div>
            <SidebarIcerik kapatFn={() => setMobilMenuAcik(false)} />
          </aside>
          <div className="flex-1 bg-black/50" onClick={() => setMobilMenuAcik(false)} />
        </div>
      )}

      {/* MASAÜSTÜ SIDEBAR */}
      <aside className="hidden lg:flex w-56 bg-slate-800 flex-shrink-0 flex-col">
        <SidebarIcerik />
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-3 sm:p-4 lg:p-6">

          <div className="hidden lg:flex items-center justify-between mb-5">
            <h1 className="text-slate-800 font-bold text-lg">{menuItems.find(m => m.id === aktifSekme)?.label}</h1>
            <button onClick={hepsiniYukle} className={btnS + ' flex items-center gap-1.5'}><RefreshCw size={14} />Yenile</button>
          </div>

          {yukleniyor && <div className="text-center py-20 text-slate-400 text-sm">Yükleniyor...</div>}

          {/* ─── İSTATİSTİK ─── */}
          {!yukleniyor && aktifSekme === 'istatistik' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {[
                  { label: 'Toplam İlan',     value: ilanlar.length,                                       renk: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'Toplam Üye',      value: kullanicilar.filter(u => u.type !== 'admin').length,  renk: 'bg-green-50 text-green-700 border-green-200' },
                  { label: 'Aktif Reklam',    value: reklamlar.filter(r => r.aktif).length,                renk: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'Bekleyen Destek', value: destekler.filter(d => d.durum === 'bekliyor').length, renk: 'bg-red-50 text-red-700 border-red-200' },
                ].map(s => (
                  <div key={s.label} className={'rounded-xl border p-3 sm:p-4 ' + s.renk}>
                    <p className="text-xs font-medium opacity-70 mb-1">{s.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Son İlanlar</p>
                  {ilanlar.slice(0, 5).map(i => (
                    <div key={i.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-600 truncate mr-2">{i.ilan_veren || 'Anonim'}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{new Date(i.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Son Üyeler</p>
                  {kullanicilar.filter(u => u.type !== 'admin').slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-600 truncate mr-2">{u.full_name || 'İsimsiz'}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{u.phone_number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── KULLANICILAR ─── */}
          {!yukleniyor && aktifSekme === 'kullanicilar' && (
            !sekmeYetkiVarMi('kullanicilar') ? <YetkisizUyari sekme="Kullanıcı Yönetimi" /> : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="sm:hidden divide-y divide-slate-100">
                {kullanicilar.filter(u => u.type !== 'admin').map(u => {
                  const ks = Object.values(u.kisitlamalar || {}).filter(Boolean).length;
                  return (
                    <div key={u.id} onClick={() => kullaniciDetayAc(u)} className="p-4 flex items-center gap-3 active:bg-slate-50">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">
                        {(u.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 font-medium text-sm truncate">{u.full_name || 'İsimsiz'}</p>
                        <p className="text-xs text-slate-400">{u.phone_number}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (u.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                          {u.aktif !== false ? 'Aktif' : 'Pasif'}
                        </span>
                        {ks > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{ks} kısıtlama</span>}
                      </div>
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                    </div>
                  );
                })}
                {kullanicilar.filter(u => u.type !== 'admin').length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">Henüz üye yok</div>
                )}
              </div>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Ad Soyad', 'Telefon', 'Tip', 'Durum', 'Kısıtlama', 'Kayıt Tarihi', 'İşlem'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kullanicilar.filter(u => u.type !== 'admin').map(u => {
                      const ks = Object.values(u.kisitlamalar || {}).filter(Boolean).length;
                      return (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer" onClick={() => kullaniciDetayAc(u)}>
                          <td className="px-4 py-3"><div className="font-medium text-slate-700">{u.full_name || 'İsimsiz'}</div>{u.email && <div className="text-xs text-slate-400">{u.email}</div>}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{u.phone_number}</td>
                          <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{u.type === 'admin' ? 'Yönetici' : 'Üye'}</span></td>
                          <td className="px-4 py-3"><span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (u.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>{u.aktif !== false ? 'Aktif' : 'Pasif'}</span></td>
                          <td className="px-4 py-3">{ks > 0 ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{ks} kısıtlama</span> : <span className="text-xs text-slate-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '—'}</td>
                          <td className="px-4 py-3"><button onClick={e => { e.stopPropagation(); kullaniciDetayAc(u); }} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium whitespace-nowrap">Detay<ChevronRight size={12} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {kullanicilar.filter(u => u.type !== 'admin').length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Henüz üye yok</div>}
              </div>
            </div>
            )
          )}

          {/* ─── İLANLAR ─── */}
          {!yukleniyor && aktifSekme === 'ilanlar' && (
            !sekmeYetkiVarMi('ilanlar') ? <YetkisizUyari sekme="İlan Onay" /> : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="sm:hidden divide-y divide-slate-100">
                {ilanlar.map(ilan => (
                  <div key={ilan.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-slate-700 font-medium text-sm">{ilan.ilan_veren || 'Anonim'}</p>
                        <p className="text-xs text-slate-400">{ilan.kategori} · {new Date(ilan.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ' +
                        (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : ilan.durum === 'pasif' ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-700')}>
                        {ilan.durum || 'aktif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onIlanDetay(ilan)} className="text-xs text-blue-500 font-medium">Detay</button>
                      <span className="text-slate-200">|</span>
                      <button onClick={async () => { await supabase.from('ilanlar').update({ durum: ilan.durum === 'aktif' ? 'pasif' : 'aktif' }).eq('id', ilan.id); hepsiniYukle(); }}
                        className="text-xs text-orange-500 font-medium">{ilan.durum === 'aktif' ? 'Pasif Yap' : 'Aktif Yap'}</button>
                      {(isSuperAdmin || (yetkiler as any).ilan_sil) && (
                        <><span className="text-slate-200">|</span><button onClick={() => ilanSil(ilan.id)} className="text-xs text-red-400 font-medium">Sil</button></>
                      )}
                    </div>
                  </div>
                ))}
                {ilanlar.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Hiç ilan yok</div>}
              </div>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['İlan Veren', 'Kategori', 'Tarih', 'Durum', 'İşlemler'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ilanlar.map(ilan => (
                      <tr key={ilan.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-slate-700 font-medium">{ilan.ilan_veren || 'Anonim'}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{ilan.kategori}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="px-4 py-3">
                          <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : ilan.durum === 'pasif' ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-700')}>
                            {ilan.durum || 'aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => onIlanDetay(ilan)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Detay</button>
                            <button onClick={async () => { await supabase.from('ilanlar').update({ durum: ilan.durum === 'aktif' ? 'pasif' : 'aktif' }).eq('id', ilan.id); hepsiniYukle(); }} className="text-xs text-orange-500 hover:text-orange-700 font-medium whitespace-nowrap">
                              {ilan.durum === 'aktif' ? 'Pasif Yap' : 'Aktif Yap'}
                            </button>
                            {(isSuperAdmin || (yetkiler as any).ilan_sil) && (
                              <button onClick={() => ilanSil(ilan.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ilanlar.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Hiç ilan yok</div>}
              </div>
            </div>
            )
          )}

          {/* ─── REKLAMLAR ─── */}
          {!yukleniyor && aktifSekme === 'reklamlar' && (
            !sekmeYetkiVarMi('reklamlar') ? <YetkisizUyari sekme="Reklam Yönetimi" /> : (
            <div className="flex flex-col gap-4">

              {/* İlan Arası Reklam Sıklığı Ayarı */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Image size={15} className="text-orange-500" />
                  İlan Arası Reklam Sıklığı
                </p>
                <p className="text-xs text-slate-400 mb-3">Her kaç ilandan sonra liste içi reklam gösterilsin?</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={reklamSiklik}
                    onChange={e => setReklamSiklik(Math.max(1, Number(e.target.value)))}
                    className={ic + ' max-w-[120px]'}
                  />
                  <span className="text-sm text-slate-500">ilandan bir</span>
                  <button
                    onClick={siklikKaydet}
                    disabled={siklikKaydediyor}
                    className={btnO + ' disabled:opacity-60 flex items-center gap-1.5'}
                  >
                    {siklikKaydediyor
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save size={14} />}
                    Kaydet
                  </button>
                  {siklikMesaj && <span className="text-sm text-green-600 font-medium">{siklikMesaj}</span>}
                </div>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
                {/* Reklam Listesi */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  {reklamlar.map(r => (
                    <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <img src={r.resim_url} alt={r.baslik} className="w-24 sm:w-32 h-14 sm:h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                          onError={(e: any) => { e.target.style.display = 'none'; }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-700 text-sm">{r.baslik || 'Başlıksız'}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{r.link_url || 'Link yok'}</p>
                          <span className={'text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ' + (r.konum === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500')}>
                            {r.konum === 'header' ? 'Üst Alan' : r.konum === 'kenar_kucuk' ? 'Yan - Küçük' : r.konum === 'kenar_buyuk' ? 'Yan - Büyük' : 'Liste Arası'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          <button
                            onClick={async () => { await supabase.from('reklamlar').update({ aktif: !r.aktif }).eq('id', r.id); hepsiniYukle(); }}
                            className={'text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg border transition whitespace-nowrap ' + (r.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                            {r.aktif ? 'Aktif' : 'Pasif'}
                          </button>
                          <button
                            onClick={() => reklamDuzenleAc(r)}
                            className="p-1.5 text-slate-400 hover:text-orange-500 transition" title="Düzenle">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={async () => { if (!window.confirm('Bu reklamı silmek istiyor musunuz?')) return; await supabase.from('reklamlar').delete().eq('id', r.id); hepsiniYukle(); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition" title="Sil">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reklamlar.length === 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">Hiç reklam eklenmemiş</div>
                  )}
                </div>

                {/* Yeni Reklam Formu */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><PlusCircle size={15} className="text-orange-500" />Yeni Reklam</p>
                  <input className={ic + ' mb-2'} placeholder="Başlık (opsiyonel)" value={yeniReklam.baslik} onChange={e => setYeniReklam({ ...yeniReklam, baslik: e.target.value })} />
                  <input className={ic + ' mb-2'} placeholder="Tıklama linki" value={yeniReklam.link_url} onChange={e => setYeniReklam({ ...yeniReklam, link_url: e.target.value })} />
                  <select className={ic + ' mb-3'} value={yeniReklam.konum} onChange={e => setYeniReklam({ ...yeniReklam, konum: e.target.value })}>
                    <option value="liste">Liste Arası</option>
                    <option value="header">Üst Alan</option>
                    <option value="kenar_kucuk">Yan Alan - Küçük (8cm)</option>
                    <option value="kenar_buyuk">Yan Alan - Büyük (12cm)</option>
                    <option value="kenar_sol">Dikey Sol Kenar</option>
                    <option value="kenar_sag">Dikey Sağ Kenar</option>
                  </select>
                  {yeniReklam.resim_url ? (
                    <div className="mb-3 relative">
                      <img src={yeniReklam.resim_url} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                      <button onClick={() => setYeniReklam({ ...yeniReklam, resim_url: '' })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                      <p className="text-xs text-green-600 mt-1 font-medium">Resim yüklendi ✓</p>
                    </div>
                  ) : (
                    <div onDragOver={e => { e.preventDefault(); setSurukleAktif(true); }} onDragLeave={() => setSurukleAktif(false)}
                      onDrop={e => { e.preventDefault(); setSurukleAktif(false); const f = e.dataTransfer.files[0]; if (f) dosyaYukle(f, 'yeni'); }}
                      onClick={() => document.getElementById('reklam-input')?.click()}
                      className={'mb-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ' + (surukleAktif ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50')}>
                      {reklamYukleniyor
                        ? <div className="flex flex-col items-center gap-2"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><p className="text-xs text-slate-400">Yükleniyor...</p></div>
                        : <div className="flex flex-col items-center gap-2"><Image size={24} className="text-slate-300" /><p className="text-sm text-slate-500">Sürükle bırak veya tıkla</p><p className="text-xs text-slate-400">PNG, JPG, GIF</p></div>}
                      <input id="reklam-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) dosyaYukle(f, 'yeni'); }} />
                    </div>
                  )}
                  <button onClick={async () => { if (!yeniReklam.resim_url) return; await supabase.from('reklamlar').insert([{ ...yeniReklam, aktif: true }]); setYeniReklam({ baslik: '', resim_url: '', link_url: '', konum: 'liste' }); hepsiniYukle(); }}
                    disabled={!yeniReklam.resim_url || reklamYukleniyor} className={btnO + ' w-full disabled:opacity-50'}>Reklam Ekle</button>
                </div>
              </div>
            </div>
            )
          )}

          {/* ─── DUYURULAR ─── */}
          {!yukleniyor && aktifSekme === 'duyurular' && (
            !sekmeYetkiVarMi('duyurular') ? <YetkisizUyari sekme="Duyuru Yönetimi" /> : (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 flex flex-col gap-3">
                {duyurular.map(d => (
                  <div key={d.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {d.resim_url && (
                      <div className="relative">
                        <img src={d.resim_url} alt={d.baslik} className="w-full h-36 object-cover" />
                        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${d.aktif ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                          {d.aktif ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-700 text-sm">{d.baslik}</p>
                          <p className="text-xs text-slate-500 mt-1">{d.mesaj}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-slate-400">{d.saniye} sn. sonra açılır</p>
                            <p className="text-xs text-slate-400">{d.goster_sure || 8} sn. görünür kalır</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!d.resim_url && (
                            <button onClick={async () => { await supabase.from('duyurular').update({ aktif: !d.aktif }).eq('id', d.id); hepsiniYukle(); }}
                              className={'text-xs font-semibold px-3 py-1.5 rounded-lg border transition whitespace-nowrap ' + (d.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                              {d.aktif ? 'Aktif' : 'Pasif'}
                            </button>
                          )}
                          <button onClick={async () => { await supabase.from('duyurular').delete().eq('id', d.id); hepsiniYukle(); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      {d.resim_url && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                          <button onClick={async () => { await supabase.from('duyurular').update({ aktif: !d.aktif }).eq('id', d.id); hepsiniYukle(); }}
                            className={'flex-1 text-xs font-semibold py-1.5 rounded-lg border transition ' + (d.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                            {d.aktif ? 'Aktif' : 'Pasif'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {duyurular.length === 0 && <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">Hiç duyuru eklenmemiş</div>}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><PlusCircle size={15} className="text-orange-500" />Yeni Duyuru</p>
                <input className={ic + ' mb-2'} placeholder="Başlık (opsiyonel)" value={yeniDuyuru.baslik} onChange={e => setYeniDuyuru({ ...yeniDuyuru, baslik: e.target.value })} />
                <textarea className={ic + ' mb-3 resize-none'} placeholder="Mesaj — resim eklemediyseniz zorunludur" rows={3} value={yeniDuyuru.mesaj} onChange={e => setYeniDuyuru({ ...yeniDuyuru, mesaj: e.target.value })} />
                <p className="text-xs font-medium text-slate-500 mb-1.5">Resim <span className="text-slate-400 font-normal">(opsiyonel)</span></p>
                {yeniDuyuru.resim_url ? (
                  <div className="mb-3 relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={yeniDuyuru.resim_url} className="w-full h-32 object-cover" alt="Önizleme" />
                    <button onClick={() => setYeniDuyuru({ ...yeniDuyuru, resim_url: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition">×</button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                      <p className="text-white text-xs font-medium">✓ Resim yüklendi</p>
                    </div>
                  </div>
                ) : (
                  <div onDragOver={e => { e.preventDefault(); setDuyuruSurukle(true); }} onDragLeave={() => setDuyuruSurukle(false)}
                    onDrop={e => { e.preventDefault(); setDuyuruSurukle(false); const f = e.dataTransfer.files[0]; if (f) duyuruResimYukle(f); }}
                    onClick={() => document.getElementById('duyuru-resim-input')?.click()}
                    className={'mb-3 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ' + (duyuruSurukle ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50')}>
                    {duyuruYukleniyor
                      ? <div className="flex flex-col items-center gap-2"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><p className="text-xs text-slate-400">Yükleniyor...</p></div>
                      : <div className="flex flex-col items-center gap-1.5"><Image size={22} className="text-slate-300" /><p className="text-sm text-slate-500 font-medium">Sürükle bırak veya tıkla</p><p className="text-xs text-slate-400">PNG, JPG, GIF · Maks 5MB</p></div>}
                    <input id="duyuru-resim-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) duyuruResimYukle(f); e.target.value = ''; }} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Kaç sn. sonra açılsın</label>
                    <input className={ic} type="number" min={0} max={60} value={yeniDuyuru.saniye} onChange={e => setYeniDuyuru({ ...yeniDuyuru, saniye: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Kaç sn. görünür kalsın</label>
                    <input className={ic} type="number" min={2} max={120} value={yeniDuyuru.goster_sure} onChange={e => setYeniDuyuru({ ...yeniDuyuru, goster_sure: Number(e.target.value) })} />
                  </div>
                </div>
                <button onClick={async () => {
                  const eklenebilir = yeniDuyuru.resim_url || yeniDuyuru.mesaj;
                  if (!eklenebilir) return;
                  await supabase.from('duyurular').insert([{ ...yeniDuyuru, aktif: true }]);
                  setYeniDuyuru({ baslik: '', mesaj: '', resim_url: '', saniye: 2, goster_sure: 8 });
                  hepsiniYukle();
                }} disabled={duyuruYukleniyor || (!yeniDuyuru.resim_url && !yeniDuyuru.mesaj)}
                  className={btnO + ' w-full disabled:opacity-50 disabled:cursor-not-allowed'}>Duyuru Ekle</button>
              </div>
            </div>
            )
          )}

          {/* ─── DESTEK TALEPLERI ─── */}
          {!yukleniyor && aktifSekme === 'destek' && (
            !sekmeYetkiVarMi('destek') ? <YetkisizUyari sekme="Destek Talepleri" /> : (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 flex flex-col gap-3">
                {destekler.map(d => (
                  <div key={d.id} onClick={async () => {
                    setSeciliDestek(d);
                    setDestekCevap(d.cevap || '');
                    if (d.durum === 'bekliyor') {
                      await supabase.from('destek').update({ durum: 'islemde' }).eq('id', d.id);
                      setDestekler(prev => prev.map(x => x.id === d.id ? { ...x, durum: 'islemde' } : x));
                      window.dispatchEvent(new Event('bildirimler:degisti'));
                    }
                  }}
                    className={'bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300 transition ' + (seciliDestek?.id === d.id ? 'border-orange-400' : 'border-slate-200')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-700 text-sm">{d.konu}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.mesaj}</p>
                      </div>
                      <span className={'flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ' + (
                        d.durum === 'cevaplandi'
                          ? 'bg-green-100 text-green-700'
                          : d.durum === 'islemde'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                      )}>
                        {d.durum === 'cevaplandi' ? 'Cevaplandı' : d.durum === 'islemde' ? 'İşlemde' : 'Bekliyor'}
                      </span>
                    </div>
                  </div>
                ))}
                {destekler.length === 0 && <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">Hiç destek talebi yok</div>}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {seciliDestek ? (
                  <>
                    <p className="text-sm font-semibold text-slate-700 mb-1">{seciliDestek.konu}</p>
                    <p className="text-xs text-slate-500 mb-3">{seciliDestek.mesaj}</p>
                    <textarea className={ic + ' mb-3 resize-none'} placeholder="Cevabın..." rows={5} value={destekCevap} onChange={e => setDestekCevap(e.target.value)} />
                    <button onClick={async () => { if (!seciliDestek || !destekCevap) return; await supabase.from('destek').update({ cevap: destekCevap, durum: 'cevaplandi', cevap_tarihi: new Date().toISOString() }).eq('id', seciliDestek.id); setDestekCevap(''); setSeciliDestek(null); hepsiniYukle(); window.dispatchEvent(new Event('bildirimler:degisti')); }} className={btnO + ' w-full'}>Cevapla</button>
                  </>
                ) : <p className="text-sm text-slate-400 text-center py-8">Detay için bir destek talebi seç</p>}
              </div>
            </div>
            )
          )}

          {/* ─── PERSONEL ─── */}
          {!yukleniyor && aktifSekme === 'personel' && (
            !isSuperAdmin ? <YetkisizUyari sekme="Personel Yönetimi" /> : (
            <div>
              <div className="flex justify-end mb-4">
                {!personelFormAcik && (
                  <button onClick={() => { setSeciliPersonel(null); setPersonelForm({ full_name: '', phone_number: '', password: '', aktif: true, yetkiler: Object.fromEntries(Object.keys(PERSONEL_YETKI_TANIM).map(k => [k, false])) as PersonelYetkiler }); setPersonelFormAcik(true); }}
                    className={btnO + ' flex items-center gap-2'}><UserPlus size={16} />Personel Ekle</button>
                )}
              </div>
              {personelFormAcik && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">{seciliPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                    <div><label className="block text-xs font-medium text-slate-500 mb-1">Ad Soyad</label><input type="text" className={ic} value={personelForm.full_name} onChange={e => setPersonelForm({ ...personelForm, full_name: e.target.value })} placeholder="Ahmet Yılmaz" /></div>
                    <div><label className="block text-xs font-medium text-slate-500 mb-1">Telefon</label><input type="text" className={ic} value={personelForm.phone_number} onChange={e => setPersonelForm({ ...personelForm, phone_number: e.target.value })} placeholder="05XXXXXXXXX" /></div>
                    <div><label className="block text-xs font-medium text-slate-500 mb-1">{seciliPersonel ? 'Yeni Şifre (boş = değiştirme)' : 'Şifre'}</label><input type="password" className={ic} value={personelForm.password} onChange={e => setPersonelForm({ ...personelForm, password: e.target.value })} placeholder="••••••" /></div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Yetki Ayarları</label>
                    <p className="text-xs text-slate-400 mb-3">Personelin hangi bölümlere erişip işlem yapabileceğini seçin.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {Object.entries(PERSONEL_YETKI_TANIM).map(([key, tanim]) => (
                        <label key={key} className={'flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ' + ((personelForm.yetkiler as any)[key] ? 'border-orange-300 bg-orange-50' : 'border-slate-100 hover:bg-slate-50')}>
                          <input type="checkbox" className="w-4 h-4 accent-orange-500 mt-0.5 flex-shrink-0" checked={!!(personelForm.yetkiler as any)[key]}
                            onChange={() => setPersonelForm({ ...personelForm, yetkiler: { ...personelForm.yetkiler, [key]: !(personelForm.yetkiler as any)[key] } })} />
                          <div><p className="text-sm font-medium text-slate-700">{tanim.label}</p><p className="text-xs text-slate-400 mt-0.5">{tanim.aciklama}</p></div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-emerald-500" checked={personelForm.aktif} onChange={() => setPersonelForm({ ...personelForm, aktif: !personelForm.aktif })} />
                      <span className="text-sm font-medium text-slate-700">Hesap Aktif</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => { setPersonelFormAcik(false); setSeciliPersonel(null); }} className={btnS + ' flex items-center gap-1 flex-1 sm:flex-none justify-center'}><X size={14} />İptal</button>
                      <button onClick={personelKaydet} className={btnO + ' flex items-center gap-1 flex-1 sm:flex-none justify-center'}><Save size={14} />Kaydet</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="sm:hidden divide-y divide-slate-100">
                  {kullanicilar.filter(u => u.type === 'admin').map(p => (
                    <div key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div><p className="font-semibold text-slate-700 text-sm">{p.full_name}</p><p className="text-xs text-slate-400">{p.phone_number}</p></div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {p.aktif !== false
                            ? <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold"><CheckCircle2 size={10} className="mr-1" />Aktif</span>
                            : <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold"><XCircle size={10} className="mr-1" />Pasif</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2 bg-slate-50 px-3 py-2 rounded-lg">
                        <span className="font-mono text-xs text-slate-600 flex-1">{personelSifreGoster[p.id] ? (p.sifre_acik || '(kayıtlı değil)') : '••••••'}</span>
                        <button onClick={() => setPersonelSifreGoster(prev => ({ ...prev, [p.id]: !prev[p.id] }))} className="text-slate-400">{personelSifreGoster[p.id] ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => personelDuzenleAc(p)} className="flex-1 text-xs text-orange-500 border border-orange-200 bg-orange-50 py-1.5 rounded-lg flex items-center justify-center gap-1"><Edit2 size={12} />Düzenle</button>
                        <button onClick={() => kullaniciSil(p.id)} className="flex-1 text-xs text-red-500 border border-red-200 bg-red-50 py-1.5 rounded-lg flex items-center justify-center gap-1"><Trash2 size={12} />Sil</button>
                      </div>
                    </div>
                  ))}
                  {kullanicilar.filter(u => u.type === 'admin').length === 0 && <div className="p-8 text-center text-slate-400 text-sm">Henüz personel eklenmemiş</div>}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                        {['Personel', 'Telefon', 'Mevcut Şifre', 'Yetkiler', 'Durum', 'İşlemler'].map(h => (
                          <th key={h} className="p-4 font-semibold text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {kullanicilar.filter(u => u.type === 'admin').map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-4"><div className="font-semibold text-slate-700">{p.full_name}</div><div className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString('tr-TR')}</div></td>
                          <td className="p-4 text-slate-600">{p.phone_number}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{personelSifreGoster[p.id] ? (p.sifre_acik || '(kayıtlı değil)') : '••••••'}</span>
                              <button onClick={() => setPersonelSifreGoster(prev => ({ ...prev, [p.id]: !prev[p.id] }))} className="text-slate-400 hover:text-slate-600">{personelSifreGoster[p.id] ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {p.yetkiler && Object.entries(p.yetkiler).some(([, v]) => v)
                                ? Object.entries(p.yetkiler).map(([k, v]) => v ? <span key={k} className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-2 py-0.5 rounded-full">{PERSONEL_YETKI_TANIM[k]?.label || k}</span> : null)
                                : <span className="text-xs text-slate-400 italic">Yetki yok</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            {p.aktif !== false
                              ? <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold"><CheckCircle2 size={11} className="mr-1" />Aktif</span>
                              : <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold"><XCircle size={11} className="mr-1" />Pasif</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <button onClick={() => personelDuzenleAc(p)} className="p-1.5 text-slate-400 hover:text-orange-500" title="Düzenle"><Edit2 size={14} /></button>
                              <button onClick={() => kullaniciSil(p.id)} className="p-1.5 text-slate-400 hover:text-red-500" title="Sil"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {kullanicilar.filter(u => u.type === 'admin').length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm">Henüz personel eklenmemiş</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )
          )}

          {/* ─── LOGO YÖNETİMİ ─── */}
          {!yukleniyor && aktifSekme === 'logo' && (
            !isSuperAdmin ? <YetkisizUyari sekme="Logo Yönetimi" /> : (
            <div className="max-w-lg">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Image size={15} className="text-orange-500" /> Platform Logosu
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Yüklediğiniz logo, sitenin header bölümünde araç ikonu yerine görünecektir.
                </p>
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">Mevcut Logo</p>
                  {platformLogo ? (
                    <div className="relative inline-block">
                      <img src={platformLogo} alt="Platform Logo" className="h-16 w-auto object-contain border border-slate-200 rounded-lg p-2 bg-white" />
                      <button
                        onClick={async () => {
                          await supabase.from('ayarlar').delete().eq('anahtar', 'platform_logo');
                          setPlatformLogo('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >×</button>
                    </div>
                  ) : (
                    <div className="h-16 w-32 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-slate-300">Logo yok</span>
                    </div>
                  )}
                </div>
                <div
                  onClick={() => document.getElementById('logo-input')?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-8 text-center cursor-pointer transition"
                >
                  {logoYukleniyor ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-400">Yükleniyor...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Image size={24} className="text-slate-300" />
                      <p className="text-sm text-slate-500 font-medium">Logo yüklemek için tıkla</p>
                      <p className="text-xs text-slate-400">PNG, JPG, SVG · Şeffaf arka plan önerilir</p>
                    </div>
                  )}
                  <input id="logo-input" type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) logoYukle(f); e.target.value = ''; }} />
                </div>
                {platformLogo && (
                  <p className="text-xs text-green-600 mt-3 font-medium text-center">✓ Logo aktif — header'da görünüyor</p>
                )}
              </div>
            </div>
            )
          )}

        </div>
      </main>

      {/* ════ REKLAM DÜZENLEME MODAL ════ */}
      {duzenleReklam && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setDuzenleReklam(null); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <p className="font-bold text-slate-800 text-base flex items-center gap-2"><Edit2 size={16} className="text-orange-500" />Reklamı Düzenle</p>
              <button onClick={() => setDuzenleReklam(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <input className={ic} placeholder="Başlık (opsiyonel)" value={duzenleForm.baslik} onChange={e => setDuzenleForm({ ...duzenleForm, baslik: e.target.value })} />
              <input className={ic} placeholder="Tıklama linki" value={duzenleForm.link_url} onChange={e => setDuzenleForm({ ...duzenleForm, link_url: e.target.value })} />
              <select className={ic} value={duzenleForm.konum} onChange={e => setDuzenleForm({ ...duzenleForm, konum: e.target.value })}>
              <option value="liste">Liste Arası</option>
              <option value="header">Üst Alan</option>
              <option value="kenar_kucuk">Yan Alan - Küçük (8cm)</option>
              <option value="kenar_buyuk">Yan Alan - Büyük (12cm)</option>
              <option value="kenar_sol">Dikey Sol Kenar</option>
              <option value="kenar_sag">Dikey Sağ Kenar</option>
            </select>
              {/* Resim önizleme + değiştirme */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Reklam Görseli</p>
                {duzenleForm.resim_url && (
                  <div className="relative mb-2 rounded-xl overflow-hidden border border-slate-200">
                    <img src={duzenleForm.resim_url} className="w-full h-32 object-cover" alt="Önizleme" />
                    <button onClick={() => setDuzenleForm({ ...duzenleForm, resim_url: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow hover:bg-red-600 transition">×</button>
                  </div>
                )}
                <div
                  onDragOver={e => { e.preventDefault(); setDuzenleSurukle(true); }}
                  onDragLeave={() => setDuzenleSurukle(false)}
                  onDrop={e => { e.preventDefault(); setDuzenleSurukle(false); const f = e.dataTransfer.files[0]; if (f) dosyaYukle(f, 'duzenle'); }}
                  onClick={() => document.getElementById('duzenle-resim-input')?.click()}
                  className={'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ' + (duzenleSurukle ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50')}>
                  {duzenleResimYukleniyor
                    ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /><p className="text-xs text-slate-400">Yükleniyor...</p></div>
                    : <p className="text-xs text-slate-500">{duzenleForm.resim_url ? 'Farklı bir resim seç' : 'Sürükle bırak veya tıkla'}</p>}
                  <input id="duzenle-resim-input" type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) dosyaYukle(f, 'duzenle'); e.target.value = ''; }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setDuzenleReklam(null)} className={btnS + ' flex-1'}>İptal</button>
              <button onClick={reklamDuzenleKaydet} disabled={!duzenleForm.resim_url || duzenleResimYukleniyor}
                className={btnO + ' flex-1 flex items-center justify-center gap-1.5 disabled:opacity-60'}>
                <Save size={14} />Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ KULLANICI DETAY MODAL ════ */}
      {detayModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setDetayModal(null); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {(detayModal.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">{detayModal.full_name || 'İsimsiz Kullanıcı'}</p>
                  <p className="text-xs text-slate-400 font-mono hidden sm:block">{detayModal.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!detayDuzenle && (
                  <button onClick={() => setDetayDuzenle(true)} className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition">
                    <Edit2 size={12} />Düzenle
                  </button>
                )}
                <button onClick={() => setDetayModal(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X size={18} /></button>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Temel Bilgiler</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { label: 'Ad Soyad', value: detayModal.full_name, alan: 'full_name', ikon: <Users size={12} /> },
                    { label: 'Telefon', value: detayModal.phone_number, alan: 'phone_number', ikon: <Phone size={12} /> },
                    { label: 'E-posta', value: detayModal.email, alan: 'email', ikon: <Bell size={12} /> },
                    { label: 'Kullanıcı Tipi', value: detayModal.type === 'admin' ? 'Yönetici' : 'Üye', alan: null, ikon: <Shield size={12} /> },
                    { label: 'Kayıt Tarihi', value: detayModal.created_at ? new Date(detayModal.created_at).toLocaleString('tr-TR') : '—', alan: null, ikon: <Calendar size={12} /> },
                    { label: 'Son Giriş', value: detayModal.last_sign_in_at ? new Date(detayModal.last_sign_in_at).toLocaleString('tr-TR') : '—', alan: null, ikon: <Calendar size={12} /> },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">{item.ikon}<span>{item.label}</span></div>
                      {detayDuzenle && item.alan
                        ? <input className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400" value={(detayModal as any)[item.alan] || ''} onChange={e => setDetayModal({ ...detayModal, [item.alan!]: e.target.value })} />
                        : <p className="text-sm font-medium text-slate-700 break-all">{item.value || '—'}</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Hesap Durumu</p>
                {detayDuzenle ? (
                  <div className="flex gap-2">
                    <button onClick={() => setDetayModal({ ...detayModal, aktif: true })} className={'flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition ' + (detayModal.aktif !== false ? 'bg-green-500 text-white border-green-500' : 'text-slate-500 border-slate-200 bg-white')}>✓ Aktif</button>
                    <button onClick={() => setDetayModal({ ...detayModal, aktif: false })} className={'flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition ' + (detayModal.aktif === false ? 'bg-red-500 text-white border-red-500' : 'text-slate-500 border-slate-200 bg-white')}>✕ Pasif</button>
                  </div>
                ) : (
                  <span className={'inline-block text-sm font-semibold px-3 py-1.5 rounded-full ' + (detayModal.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                    {detayModal.aktif !== false ? '✓ Aktif' : '✕ Pasif'}
                  </span>
                )}
              </div>
              {isSuperAdmin && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Şifre Bilgisi</p>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-1.5">Mevcut Şifre</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 flex-1 break-all">{detaySifreGoster ? (detayModal.sifre_acik || '(kayıtlı değil)') : '••••••••'}</span>
                        <button onClick={() => setDetaySifreGoster(p => !p)} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg flex-shrink-0">{detaySifreGoster ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      </div>
                    </div>
                    {detayDuzenle && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Yeni Şifre Belirle</label>
                        <input type="text" className={ic} placeholder="Yeni şifre..." value={detaySifre} onChange={e => setDetaySifre(e.target.value)} />
                        <p className="text-xs text-slate-400 mt-1">Boş bırakırsan şifre değişmez.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Kullanıcı Kısıtlamaları</p>
                  <span className="text-xs text-slate-400">{Object.values(detayKisitlamalar).filter(Boolean).length} / {Object.keys(KISITLAMA_TANIM).length} aktif</span>
                </div>
                {!detayDuzenle && Object.values(detayKisitlamalar).every(v => !v) && <p className="text-xs text-slate-400 italic mb-3">Bu kullanıcıya hiçbir kısıtlama uygulanmamış.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(KISITLAMA_TANIM).map(([key, tanim]) => {
                    const aktif = !!(detayKisitlamalar as any)[key];
                    return (
                      <label key={key} className={'flex items-center gap-3 p-3 border rounded-xl transition-colors ' + (detayDuzenle ? 'cursor-pointer ' : 'cursor-default ') + (aktif ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50/50')}>
                        <input type="checkbox" className="w-4 h-4 accent-red-500 flex-shrink-0" checked={aktif} disabled={!detayDuzenle} onChange={() => { if (!detayDuzenle) return; setDetayKisitlamalar(p => ({ ...p, [key]: !aktif })); }} />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={aktif ? 'text-red-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'}>{tanim.ikon}</span>
                          <div className="min-w-0">
                            <p className={'text-xs font-medium ' + (aktif ? 'text-red-700' : 'text-slate-600')}>{tanim.label}</p>
                            <p className="text-[11px] text-slate-400 truncate">{tanim.aciklama}</p>
                          </div>
                        </div>
                        {aktif && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 whitespace-nowrap">Kısıtlı</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0">
              <button onClick={() => kullaniciSil(detayModal.id)} className={btnR + ' flex items-center justify-center gap-1.5 text-xs'}><Trash2 size={13} />Hesabı Kalıcı Sil</button>
              {detayDuzenle && (
                <div className="flex gap-2">
                  <button onClick={() => { setDetayDuzenle(false); setDetaySifre(''); setDetayKisitlamalar(detayModal.kisitlamalar || {}); }} className={btnS + ' flex items-center gap-1 text-xs py-2 flex-1 sm:flex-none justify-center'}><X size={13} />İptal</button>
                  <button onClick={detayKaydet} disabled={detayKaydediyor} className={btnO + ' flex items-center gap-1 text-xs disabled:opacity-60 flex-1 sm:flex-none justify-center'}>
                    {detayKaydediyor ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={13} />}
                    Değişiklikleri Kaydet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
