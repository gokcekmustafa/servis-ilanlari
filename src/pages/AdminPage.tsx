import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';
import {
  LayoutDashboard, Users, FileText, Megaphone,
  Image, HeadphonesIcon, LogOut, Trash2, PlusCircle, RefreshCw,
  Shield, UserPlus, CheckCircle2, XCircle, Edit2, Save, X, Lock
} from 'lucide-react';

// Yetkiler tipi
export type Yetkiler = {
  ilan_onay?: boolean;
  kullanici_yonetimi?: boolean;
  destek_yonetimi?: boolean;
  reklam_yonetimi?: boolean;
  duyuru_yonetimi?: boolean;
  ilan_sil?: boolean;
};

type AdminPageProps = {
  onLogout: () => void;
  onIlanDetay: (ilan: Ilan) => void;
  // App.tsx'ten gelen rol ve yetki bilgileri
  isSuperAdmin: boolean;
  yetkiler: Yetkiler;
};

type Sekme =
  | 'istatistik'
  | 'ilanlar'
  | 'kullanicilar'
  | 'reklamlar'
  | 'duyurular'
  | 'destek'
  | 'personel';

// Her sekme için gereken yetki anahtarı
const SEKME_YETKI: Partial<Record<Sekme, keyof Yetkiler>> = {
  ilanlar: 'ilan_onay',
  kullanicilar: 'kullanici_yonetimi',
  reklamlar: 'reklam_yonetimi',
  duyurular: 'duyuru_yonetimi',
  destek: 'destek_yonetimi',
};

export default function AdminPage({ onLogout, onIlanDetay, isSuperAdmin, yetkiler }: AdminPageProps) {
  const [aktifSekme, setAktifSekme] = useState<Sekme>('istatistik');
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [yeniReklam, setYeniReklam] = useState({ baslik: '', resim_url: '', link_url: '', konum: 'liste' });
  const [reklamYukleniyor, setReklamYukleniyor] = useState(false);
  const [surukleAktif, setSurukleAktif] = useState(false);

  const [yeniDuyuru, setYeniDuyuru] = useState({ baslik: '', mesaj: '', resim_url: '', saniye: 2 });
  const [yeniKullanici, setYeniKullanici] = useState({ full_name: '', phone_number: '', password: '', type: 'staff' });
  const [seciliKullanici, setSeciliKullanici] = useState<any>(null);
  const [yeniSifre, setYeniSifre] = useState('');
  const [seciliDestek, setSeciliDestek] = useState<any>(null);
  const [destekCevap, setDestekCevap] = useState('');

  // Personel yönetimi
  const [isPersonelFormOpen, setIsPersonelFormOpen] = useState(false);
  const [seciliPersonel, setSeciliPersonel] = useState<any>(null);
  const [personelForm, setPersonelForm] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    aktif: true,
    yetkiler: {
      ilan_onay: false,
      ilan_sil: false,
      kullanici_yonetimi: false,
      destek_yonetimi: false,
      reklam_yonetimi: false,
      duyuru_yonetimi: false,
    } as Yetkiler
  });

  // Yetki kontrolü: superadmin her şeyi görebilir, personel sadece yetkili sekmeleri
  const sekmeYetkiVarMi = (sekme: Sekme): boolean => {
    if (isSuperAdmin) return true;
    if (sekme === 'istatistik') return true; // İstatistik herkese açık
    if (sekme === 'personel') return false;  // Personel sekmesi sadece superadmin
    const gerekliYetki = SEKME_YETKI[sekme];
    if (!gerekliYetki) return true;
    return !!yetkiler[gerekliYetki];
  };

  useEffect(() => {
    hepsiniYukle();
  }, []);

  const hepsiniYukle = async () => {
    setYukleniyor(true);
    const [u, i, r, d, ds] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('ilanlar').select('*').order('created_at', { ascending: false }),
      supabase.from('reklamlar').select('*').order('id', { ascending: false }),
      supabase.from('duyurular').select('*').order('id', { ascending: false }),
      supabase.from('destek').select('*').order('created_at', { ascending: false }),
    ]);
    setKullanicilar(u.data || []);
    setIlanlar(i.data || []);
    setReklamlar(r.data || []);
    setDuyurular(d.data || []);
    setDestekler(ds.data || []);
    setYukleniyor(false);
  };

  const hashPassword = async (pass: string) => {
    const enc = new TextEncoder().encode(pass + 'servis-ilanlari-salt');
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const dosyaYukle = async (dosya: File) => {
    if (!dosya.type.startsWith('image/')) {
      alert('Sadece resim dosyası yükleyebilirsiniz');
      return;
    }
    setReklamYukleniyor(true);
    const dosyaAdi = Date.now() + '-' + dosya.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const { error } = await supabase.storage
      .from('reklamlar')
      .upload(dosyaAdi, dosya, { contentType: dosya.type });
    if (error) {
      alert('Yüklerken hata oluştu: ' + error.message);
      setReklamYukleniyor(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('reklamlar').getPublicUrl(dosyaAdi);
    setYeniReklam(prev => ({ ...prev, resim_url: urlData.publicUrl }));
    setReklamYukleniyor(false);
  };

  const surukBirak = (e: React.DragEvent) => {
    e.preventDefault();
    setSurukleAktif(false);
    const dosya = e.dataTransfer.files[0];
    if (dosya) dosyaYukle(dosya);
  };

  const ilanSil = async (id: string) => {
    // İlan silme için hem ilan_onay hem ilan_sil yetkisi gerekebilir
    if (!isSuperAdmin && !yetkiler.ilan_sil && !yetkiler.ilan_onay) return;
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('id', id);
    hepsiniYukle();
  };

  const ilanDurumDegistir = async (id: string, durum: string) => {
    if (!sekmeYetkiVarMi('ilanlar')) return;
    await supabase.from('ilanlar').update({ durum }).eq('id', id);
    hepsiniYukle();
  };

  const kullaniciSil = async (id: string) => {
    if (!isSuperAdmin && !yetkiler.kullanici_yonetimi) return;
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    hepsiniYukle();
  };

  const kullaniciGuncelle = async () => {
    if (!seciliKullanici) return;
    const guncelleme: any = {
      full_name: seciliKullanici.full_name,
      phone_number: seciliKullanici.phone_number,
      aktif: seciliKullanici.aktif,
    };
    if (yeniSifre) {
      guncelleme.password_hash = await hashPassword(yeniSifre);
      guncelleme.sifre_acik = yeniSifre;
    }
    await supabase.from('profiles').update(guncelleme).eq('id', seciliKullanici.id);
    setYeniSifre('');
    setSeciliKullanici(null);
    hepsiniYukle();
  };

  const kullaniciEkle = async () => {
    if (!yeniKullanici.full_name || !yeniKullanici.phone_number || !yeniKullanici.password) return;
    const hash = await hashPassword(yeniKullanici.password);
    await supabase.from('profiles').insert([{
      full_name: yeniKullanici.full_name,
      phone_number: yeniKullanici.phone_number,
      type: yeniKullanici.type,
      sifre_acik: yeniKullanici.password,
      password_hash: hash,
      aktif: true,
      yetkiler: { ilan_sil: true, kullanici_sil: false },
    }]);
    setYeniKullanici({ full_name: '', phone_number: '', password: '', type: 'staff' });
    hepsiniYukle();
  };

  // Personel kaydetme — yetkileri doğru şekilde kaydeder
  const personelKaydet = async () => {
    if (!personelForm.full_name || !personelForm.phone_number) {
      alert('Lütfen ad soyad ve telefon numarası giriniz.');
      return;
    }
    if (seciliPersonel) {
      const guncelleme: any = {
        full_name: personelForm.full_name,
        phone_number: personelForm.phone_number,
        aktif: personelForm.aktif,
        yetkiler: personelForm.yetkiler,
        type: 'admin', // Personel her zaman admin tipinde
      };
      if (personelForm.password) {
        guncelleme.password_hash = await hashPassword(personelForm.password);
        guncelleme.sifre_acik = personelForm.password;
      }
      await supabase.from('profiles').update(guncelleme).eq('id', seciliPersonel.id);
    } else {
      if (!personelForm.password) {
        alert('Yeni personel için şifre belirlemelisiniz.');
        return;
      }
      const hash = await hashPassword(personelForm.password);
      await supabase.from('profiles').insert([{
        full_name: personelForm.full_name,
        phone_number: personelForm.phone_number,
        type: 'admin',
        sifre_acik: personelForm.password,
        password_hash: hash,
        aktif: personelForm.aktif,
        yetkiler: personelForm.yetkiler,
      }]);
    }
    setSeciliPersonel(null);
    setIsPersonelFormOpen(false);
    setPersonelForm({
      full_name: '', phone_number: '', password: '', aktif: true,
      yetkiler: { ilan_onay: false, ilan_sil: false, kullanici_yonetimi: false, destek_yonetimi: false, reklam_yonetimi: false, duyuru_yonetimi: false }
    });
    hepsiniYukle();
  };

  const personelDuzenleAc = (personel: any) => {
    setSeciliPersonel(personel);
    setPersonelForm({
      full_name: personel.full_name,
      phone_number: personel.phone_number,
      password: '',
      aktif: personel.aktif ?? true,
      yetkiler: {
        ilan_onay: false,
        ilan_sil: false,
        kullanici_yonetimi: false,
        destek_yonetimi: false,
        reklam_yonetimi: false,
        duyuru_yonetimi: false,
        ...(personel.yetkiler || {}),
      }
    });
    setIsPersonelFormOpen(true);
  };

  const reklamEkle = async () => {
    if (!yeniReklam.resim_url) return;
    await supabase.from('reklamlar').insert([{ ...yeniReklam, aktif: true }]);
    setYeniReklam({ baslik: '', resim_url: '', link_url: '', konum: 'liste' });
    hepsiniYukle();
  };

  const reklamSil = async (id: string) => {
    await supabase.from('reklamlar').delete().eq('id', id);
    hepsiniYukle();
  };

  const reklamToggle = async (id: string, aktif: boolean) => {
    await supabase.from('reklamlar').update({ aktif: !aktif }).eq('id', id);
    hepsiniYukle();
  };

  const duyuruEkle = async () => {
    if (!yeniDuyuru.baslik || !yeniDuyuru.mesaj) return;
    await supabase.from('duyurular').insert([{ ...yeniDuyuru, aktif: true }]);
    setYeniDuyuru({ baslik: '', mesaj: '', resim_url: '', saniye: 2 });
    hepsiniYukle();
  };

  const duyuruSil = async (id: string) => {
    await supabase.from('duyurular').delete().eq('id', id);
    hepsiniYukle();
  };

  const duyuruToggle = async (id: string, aktif: boolean) => {
    await supabase.from('duyurular').update({ aktif: !aktif }).eq('id', id);
    hepsiniYukle();
  };

  const destekCevapla = async () => {
    if (!seciliDestek || !destekCevap) return;
    await supabase.from('destek').update({
      cevap: destekCevap,
      durum: 'cevaplandi',
      cevap_tarihi: new Date().toISOString(),
    }).eq('id', seciliDestek.id);
    setDestekCevap('');
    setSeciliDestek(null);
    hepsiniYukle();
  };

  // Yetki etiketi için Türkçe isimler ve açıklamalar
  const yetkiTanimlar: Record<string, { label: string; aciklama: string }> = {
    ilan_onay:         { label: 'İlan Onay',       aciklama: 'İlanları aktif/pasif yapabilir' },
    ilan_sil:          { label: 'İlan Sil',         aciklama: 'İlanları silebilir' },
    kullanici_yonetimi:{ label: 'Kullanıcı',        aciklama: 'Kullanıcıları düzenleyip silebilir' },
    destek_yonetimi:   { label: 'Destek',           aciklama: 'Destek taleplerini cevaplayabilir' },
    reklam_yonetimi:   { label: 'Reklam',           aciklama: 'Reklam ekleyip yönetebilir' },
    duyuru_yonetimi:   { label: 'Duyuru',           aciklama: 'Duyuru ekleyip yönetebilir' },
  };

  // Menü öğelerini yetkiye göre filtrele
  const tumMenuItems = [
    { id: 'istatistik',  label: 'İstatistikler', icon: LayoutDashboard },
    { id: 'ilanlar',     label: 'İlanlar',        icon: FileText,         sayi: ilanlar.length },
    { id: 'kullanicilar',label: 'Kullanıcılar',   icon: Users,            sayi: kullanicilar.length },
    { id: 'reklamlar',   label: 'Reklamlar',      icon: Image,            sayi: reklamlar.length },
    { id: 'duyurular',   label: 'Duyurular',      icon: Megaphone,        sayi: duyurular.length },
    { id: 'destek',      label: 'Destek',         icon: HeadphonesIcon,   sayi: destekler.filter(d => d.durum === 'bekliyor').length },
    // Sadece superadmin görür
    ...(isSuperAdmin ? [{ id: 'personel', label: 'Personel', icon: Shield, sayi: kullanicilar.filter(u => u.type === 'admin').length }] : []),
  ];

  // Yetkisi olmayan sekmeleri kilitle (göster ama grileştir)
  const menuItems = tumMenuItems.map(item => ({
    ...item,
    kilitli: !sekmeYetkiVarMi(item.id as Sekme),
  }));

  const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
  const btnO = 'bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition';
  const btnS = 'bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition';

  // Yetkisiz sekme mesajı
  const YetkisizUyari = ({ sekme }: { sekme: string }) => (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <Lock size={36} className="mb-3 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">Bu bölüme erişim yetkiniz yok</p>
      <p className="text-xs mt-1">Superadmin'den "{sekme}" yetkisi talep ediniz.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">

      <aside className="w-56 bg-slate-800 flex-shrink-0 flex flex-col">
        <div className="px-4 py-5 border-b border-slate-700">
          <p className="text-white font-bold text-base">Admin Panel</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {isSuperAdmin ? '⭐ Superadmin' : '🔑 Personel'}
          </p>
        </div>
        <nav className="flex-1 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const aktif = aktifSekme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.kilitli) return; // Kilitli sekmeye geçiş engelle
                  setAktifSekme(item.id as Sekme);
                }}
                className={
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition ' +
                  (item.kilitli
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : aktif
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white')
                }
                title={item.kilitli ? 'Bu bölüm için yetkiniz yok' : ''}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {item.label}
                </span>
                <span className="flex items-center gap-1">
                  {item.kilitli && <Lock size={10} className="text-slate-500" />}
                  {(item as any).sayi !== undefined && (item as any).sayi > 0 && !item.kilitli && (
                    <span className={'text-xs px-1.5 py-0.5 rounded-full font-bold ' + (aktif ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-300')}>
                      {(item as any).sayi}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Mevcut personelin yetkileri — sidebar alt kısmında */}
        {!isSuperAdmin && (
          <div className="px-4 py-3 border-t border-slate-700">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Yetkilerim</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(yetkiler).filter(([, v]) => v).map(([k]) => (
                <span key={k} className="text-[10px] bg-orange-900/40 text-orange-300 px-1.5 py-0.5 rounded-full">
                  {yetkiTanimlar[k]?.label || k}
                </span>
              ))}
              {Object.values(yetkiler).every(v => !v) && (
                <span className="text-[10px] text-slate-500">Yetki atanmamış</span>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm py-2 transition"
          >
            <LogOut size={15} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-slate-800 font-bold text-lg">
            {menuItems.find(m => m.id === aktifSekme)?.label}
          </h1>
          <button onClick={hepsiniYukle} className={btnS + ' flex items-center gap-1.5'}>
            <RefreshCw size={14} />
            Yenile
          </button>
        </div>

        {yukleniyor && (
          <div className="text-center py-20 text-slate-400 text-sm">Yükleniyor...</div>
        )}

        {/* ─── İSTATİSTİK ─── */}
        {!yukleniyor && aktifSekme === 'istatistik' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Toplam İlan',     value: ilanlar.length,                                       renk: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Toplam Üye',      value: kullanicilar.filter(u => u.type !== 'admin').length,  renk: 'bg-green-50 text-green-700 border-green-200' },
                { label: 'Aktif Reklam',    value: reklamlar.filter(r => r.aktif).length,                renk: 'bg-orange-50 text-orange-700 border-orange-200' },
                { label: 'Bekleyen Destek', value: destekler.filter(d => d.durum === 'bekliyor').length, renk: 'bg-red-50 text-red-700 border-red-200' },
              ].map((stat) => (
                <div key={stat.label} className={'rounded-xl border p-4 ' + stat.renk}>
                  <p className="text-xs font-medium opacity-70 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Son İlanlar</p>
                {ilanlar.slice(0, 5).map(i => (
                  <div key={i.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600 truncate">{i.ilan_veren || 'Anonim'}</span>
                    <span className="text-xs text-slate-400">{new Date(i.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Son Üyeler</p>
                {kullanicilar.filter(u => u.type !== 'admin').slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{u.full_name || 'İsimsiz'}</span>
                    <span className="text-xs text-slate-400">{u.phone_number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PERSONEL (sadece superadmin) ─── */}
        {!yukleniyor && aktifSekme === 'personel' && (
          isSuperAdmin ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-end mb-4">
              {!isPersonelFormOpen && (
                <button
                  onClick={() => {
                    setSeciliPersonel(null);
                    setPersonelForm({
                      full_name: '', phone_number: '', password: '', aktif: true,
                      yetkiler: { ilan_onay: false, ilan_sil: false, kullanici_yonetimi: false, destek_yonetimi: false, reklam_yonetimi: false, duyuru_yonetimi: false }
                    });
                    setIsPersonelFormOpen(true);
                  }}
                  className={btnO + ' flex items-center shadow-sm'}
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Personel Ekle
                </button>
              )}
            </div>

            {isPersonelFormOpen && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                  {seciliPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Ad Soyad</label>
                    <input type="text" className={ic}
                      value={personelForm.full_name}
                      onChange={(e) => setPersonelForm({ ...personelForm, full_name: e.target.value })}
                      placeholder="Ör: Ahmet Yılmaz" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Telefon Numarası</label>
                    <input type="text" className={ic}
                      value={personelForm.phone_number}
                      onChange={(e) => setPersonelForm({ ...personelForm, phone_number: e.target.value })}
                      placeholder="Ör: 05551234567" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      {seciliPersonel ? 'Yeni Şifre (Boş bırakılabilir)' : 'Şifre Belirle'}
                    </label>
                    <input type="password" className={ic}
                      value={personelForm.password}
                      onChange={(e) => setPersonelForm({ ...personelForm, password: e.target.value })}
                      placeholder="******" />
                  </div>
                </div>

                {/* Yetki Ayarları — her yetki için açıklama ile */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-800 mb-1">Yetkilendirme Ayarları</label>
                  <p className="text-xs text-slate-400 mb-3">Personelin hangi bölümlere erişip işlem yapabileceğini seçin.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(yetkiTanimlar).map(([key, tanim]) => (
                      <label key={key}
                        className={'flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ' +
                          ((personelForm.yetkiler as any)[key] ? 'border-orange-300 bg-orange-50' : 'border-slate-100 hover:bg-slate-50')}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-orange-500 mt-0.5 flex-shrink-0"
                          checked={!!(personelForm.yetkiler as any)[key]}
                          onChange={() => setPersonelForm({
                            ...personelForm,
                            yetkiler: { ...personelForm.yetkiler, [key]: !(personelForm.yetkiler as any)[key] }
                          })}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{tanim.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{tanim.aciklama}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-emerald-500"
                      checked={personelForm.aktif}
                      onChange={() => setPersonelForm({ ...personelForm, aktif: !personelForm.aktif })} />
                    <span className="text-sm font-medium text-slate-700">Hesap Aktif</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => { setIsPersonelFormOpen(false); setSeciliPersonel(null); }} className={btnS + ' flex items-center'}>
                      <X className="w-4 h-4 mr-1" /> İptal
                    </button>
                    <button onClick={personelKaydet} className={btnO + ' flex items-center'}>
                      <Save className="w-4 h-4 mr-1" /> Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="p-4 font-semibold">Personel</th>
                    <th className="p-4 font-semibold">İletişim</th>
                    <th className="p-4 font-semibold">Yetkiler</th>
                    <th className="p-4 font-semibold text-center">Durum</th>
                    <th className="p-4 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {kullanicilar.filter(u => u.type === 'admin').map((personel) => (
                    <tr key={personel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{personel.full_name}</div>
                        <div className="text-xs text-slate-400">Kayıt: {new Date(personel.created_at).toLocaleDateString('tr-TR')}</div>
                      </td>
                      <td className="p-4 text-slate-600">{personel.phone_number}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {personel.yetkiler && Object.entries(personel.yetkiler).length > 0
                            ? Object.entries(personel.yetkiler).map(([key, value]) =>
                                value ? (
                                  <span key={key} className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                    {yetkiTanimlar[key]?.label || key}
                                  </span>
                                ) : null
                              )
                            : <span className="text-xs text-slate-400 italic">Yetki yok</span>
                          }
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {personel.aktif !== false ? (
                          <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <XCircle className="w-3 h-3 mr-1" /> Pasif
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => personelDuzenleAc(personel)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors inline-block" title="Düzenle">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => kullaniciSil(personel.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors inline-block ml-1" title="Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {kullanicilar.filter(u => u.type === 'admin').length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                        Henüz personel eklenmemiş.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          ) : <YetkisizUyari sekme="Personel Yönetimi" />
        )}

        {/* ─── İLANLAR ─── */}
        {!yukleniyor && aktifSekme === 'ilanlar' && (
          !sekmeYetkiVarMi('ilanlar') ? <YetkisizUyari sekme="İlan Onay" /> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">İlan Veren</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {ilanlar.map((ilan) => (
                  <tr key={ilan.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700 font-medium">{ilan.ilan_veren || 'Anonim'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{ilan.kategori}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="px-4 py-3">
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                        (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : ilan.durum === 'pasif' ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-700')}>
                        {ilan.durum || 'aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onIlanDetay(ilan)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Detay</button>
                        <button onClick={() => ilanDurumDegistir(ilan.id, ilan.durum === 'aktif' ? 'pasif' : 'aktif')} className="text-xs text-orange-500 hover:text-orange-700 font-medium">
                          {ilan.durum === 'aktif' ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                        {/* İlan silme sadece ilan_sil veya superadmin */}
                        {(isSuperAdmin || yetkiler.ilan_sil) && (
                          <button onClick={() => ilanSil(ilan.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ilanlar.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Hiç ilan yok</div>}
          </div>
          )
        )}

        {/* ─── KULLANICILAR ─── */}
        {!yukleniyor && aktifSekme === 'kullanicilar' && (
          !sekmeYetkiVarMi('kullanicilar') ? <YetkisizUyari sekme="Kullanıcı Yönetimi" /> : (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ad Soyad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {kullanicilar.filter(u => u.type !== 'admin').map((u) => (
                    <tr key={u.id} onClick={() => setSeciliKullanici(u)}
                      className={'border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ' + (seciliKullanici?.id === u.id ? 'bg-orange-50' : '')}>
                      <td className="px-4 py-3 text-slate-700 font-medium">{u.full_name || 'İsimsiz'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.phone_number}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {u.type || 'üye'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                          (u.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                          {u.aktif !== false ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); kullaniciSil(u.id); }} className="text-red-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              {seciliKullanici && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Kullanıcı Düzenle</p>
                  <input className={ic + ' mb-2'} value={seciliKullanici.full_name || ''}
                    onChange={e => setSeciliKullanici({ ...seciliKullanici, full_name: e.target.value })} placeholder="Ad Soyad" />
                  <input className={ic + ' mb-2'} value={seciliKullanici.phone_number || ''}
                    onChange={e => setSeciliKullanici({ ...seciliKullanici, phone_number: e.target.value })} placeholder="Telefon" />
                  <input className={ic + ' mb-2'} value={yeniSifre} type="password"
                    onChange={e => setYeniSifre(e.target.value)} placeholder="Yeni şifre (boş bırakılabilir)" />
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setSeciliKullanici({ ...seciliKullanici, aktif: true })}
                      className={'flex-1 text-xs py-1.5 rounded-lg border font-medium transition ' +
                        (seciliKullanici.aktif !== false ? 'bg-green-500 text-white border-green-500' : 'text-slate-500 border-slate-200')}>Aktif</button>
                    <button onClick={() => setSeciliKullanici({ ...seciliKullanici, aktif: false })}
                      className={'flex-1 text-xs py-1.5 rounded-lg border font-medium transition ' +
                        (seciliKullanici.aktif === false ? 'bg-red-500 text-white border-red-500' : 'text-slate-500 border-slate-200')}>Pasif</button>
                  </div>
                  <button onClick={kullaniciGuncelle} className={btnO + ' w-full'}>Kaydet</button>
                </div>
              )}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                  <PlusCircle size={15} className="text-orange-500" /> Yeni Kullanıcı
                </p>
                <input className={ic + ' mb-2'} placeholder="Ad Soyad" value={yeniKullanici.full_name}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, full_name: e.target.value })} />
                <input className={ic + ' mb-2'} placeholder="Telefon" value={yeniKullanici.phone_number}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, phone_number: e.target.value })} />
                <input className={ic + ' mb-2'} placeholder="Şifre" type="password" value={yeniKullanici.password}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, password: e.target.value })} />
                <select className={ic + ' mb-3'} value={yeniKullanici.type}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, type: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="uye">Üye</option>
                </select>
                <button onClick={kullaniciEkle} className={btnO + ' w-full'}>Kullanıcı Oluştur</button>
              </div>
            </div>
          </div>
          )
        )}

        {/* ─── REKLAMLAR ─── */}
        {!yukleniyor && aktifSekme === 'reklamlar' && (
          !sekmeYetkiVarMi('reklamlar') ? <YetkisizUyari sekme="Reklam Yönetimi" /> : (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-3">
              {reklamlar.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <img src={r.resim_url} alt={r.baslik}
                    className="w-32 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                    onError={(e: any) => { e.target.style.display = 'none'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 text-sm">{r.baslik || 'Başlıksız'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{r.link_url || 'Link yok'}</p>
                    <span className={'text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ' +
                      (r.konum === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500')}>
                      {r.konum === 'header' ? 'Header' : 'Liste'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => reklamToggle(r.id, r.aktif)}
                      className={'text-xs font-semibold px-3 py-1.5 rounded-lg border transition ' +
                        (r.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                      {r.aktif ? 'Aktif' : 'Pasif'}
                    </button>
                    <button onClick={() => reklamSil(r.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {reklamlar.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">Hiç reklam eklenmemiş</div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <PlusCircle size={15} className="text-orange-500" /> Yeni Reklam Ekle
              </p>
              <input className={ic + ' mb-2'} placeholder="Başlık (opsiyonel)" value={yeniReklam.baslik}
                onChange={e => setYeniReklam({ ...yeniReklam, baslik: e.target.value })} />
              <input className={ic + ' mb-2'} placeholder="Tıklama linki" value={yeniReklam.link_url}
                onChange={e => setYeniReklam({ ...yeniReklam, link_url: e.target.value })} />
              <select className={ic + ' mb-3'} value={yeniReklam.konum}
                onChange={e => setYeniReklam({ ...yeniReklam, konum: e.target.value })}>
                <option value="liste">Liste Arası</option>
                <option value="header">Header</option>
              </select>
              {yeniReklam.resim_url ? (
                <div className="mb-3 relative">
                  <img src={yeniReklam.resim_url} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                  <button onClick={() => setYeniReklam({ ...yeniReklam, resim_url: '' })}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">x</button>
                  <p className="text-xs text-green-600 mt-1 font-medium">Resim yüklendi</p>
                </div>
              ) : (
                <div onDragOver={e => { e.preventDefault(); setSurukleAktif(true); }}
                  onDragLeave={() => setSurukleAktif(false)}
                  onDrop={surukBirak}
                  onClick={() => document.getElementById('reklam-dosya-input')?.click()}
                  className={'mb-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ' +
                    (surukleAktif ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50')}>
                  {reklamYukleniyor ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400">Yükleniyor...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Image size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Sürükle bırak veya tıkla</p>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF desteklenir</p>
                    </div>
                  )}
                  <input id="reklam-dosya-input" type="file" accept="image/*" className="hidden"
                    onChange={e => { const d = e.target.files?.[0]; if (d) dosyaYukle(d); }} />
                </div>
              )}
              <button onClick={reklamEkle} disabled={!yeniReklam.resim_url || reklamYukleniyor}
                className={btnO + ' w-full disabled:opacity-50 disabled:cursor-not-allowed'}>
                Reklam Ekle
              </button>
            </div>
          </div>
          )
        )}

        {/* ─── DUYURULAR ─── */}
        {!yukleniyor && aktifSekme === 'duyurular' && (
          !sekmeYetkiVarMi('duyurular') ? <YetkisizUyari sekme="Duyuru Yönetimi" /> : (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-3">
              {duyurular.map((d) => (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{d.baslik}</p>
                      <p className="text-xs text-slate-500 mt-1">{d.mesaj}</p>
                      <p className="text-xs text-slate-400 mt-1">{d.saniye} saniye sonra göster</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <button onClick={() => duyuruToggle(d.id, d.aktif)}
                        className={'text-xs font-semibold px-3 py-1.5 rounded-lg border transition ' +
                          (d.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}>
                        {d.aktif ? 'Aktif' : 'Pasif'}
                      </button>
                      <button onClick={() => duyuruSil(d.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {duyurular.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">Hiç duyuru eklenmemiş</div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <PlusCircle size={15} className="text-orange-500" /> Yeni Duyuru
              </p>
              <input className={ic + ' mb-2'} placeholder="Başlık" value={yeniDuyuru.baslik}
                onChange={e => setYeniDuyuru({ ...yeniDuyuru, baslik: e.target.value })} />
              <textarea className={ic + ' mb-2 resize-none'} placeholder="Mesaj" rows={3}
                value={yeniDuyuru.mesaj} onChange={e => setYeniDuyuru({ ...yeniDuyuru, mesaj: e.target.value })} />
              <input className={ic + ' mb-2'} placeholder="Resim URL (opsiyonel)" value={yeniDuyuru.resim_url}
                onChange={e => setYeniDuyuru({ ...yeniDuyuru, resim_url: e.target.value })} />
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-slate-500 flex-shrink-0">Gecikme (sn):</label>
                <input className={ic} type="number" min={0} max={30} value={yeniDuyuru.saniye}
                  onChange={e => setYeniDuyuru({ ...yeniDuyuru, saniye: Number(e.target.value) })} />
              </div>
              <button onClick={duyuruEkle} className={btnO + ' w-full'}>Duyuru Ekle</button>
            </div>
          </div>
          )
        )}

        {/* ─── DESTEK ─── */}
        {!yukleniyor && aktifSekme === 'destek' && (
          !sekmeYetkiVarMi('destek') ? <YetkisizUyari sekme="Destek Yönetimi" /> : (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-3">
              {destekler.map((d) => (
                <div key={d.id} onClick={() => { setSeciliDestek(d); setDestekCevap(d.cevap || ''); }}
                  className={'bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300 transition ' +
                    (seciliDestek?.id === d.id ? 'border-orange-400' : 'border-slate-200')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{d.konu}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.mesaj}</p>
                    </div>
                    <span className={'ml-4 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ' +
                      (d.durum === 'cevaplandi' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {d.durum === 'cevaplandi' ? 'Cevaplandı' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
              {destekler.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">Hiç destek talebi yok</div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
              {seciliDestek ? (
                <>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{seciliDestek.konu}</p>
                  <p className="text-xs text-slate-500 mb-3">{seciliDestek.mesaj}</p>
                  <textarea className={ic + ' mb-3 resize-none'} placeholder="Cevabın..." rows={5}
                    value={destekCevap} onChange={e => setDestekCevap(e.target.value)} />
                  <button onClick={destekCevapla} className={btnO + ' w-full'}>Cevapla</button>
                </>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Cevaplamak için bir talep seç</p>
              )}
            </div>
          </div>
          )
        )}

      </main>
    </div>
  );
}
