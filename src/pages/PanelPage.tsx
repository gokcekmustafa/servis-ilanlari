import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  kullaniciIlanlari, ilanSil, ilanGuncelle, araclarGetir, aracEkle, aracSil,
  favorileriGetir, favoriKaldir, gelenMesajlar, okunmamisMesajSayisi,
  mesajOkunduIsaretle, destekGonder
} from '../lib/ilanlar';
import { Ilan } from '../types';
import { ilceler } from '../data/ilceler';
import { mahalleler } from '../data/mahalleler';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  Eye, Trash2, Plus, Heart, Car, MessageSquare,
  HelpCircle, User, LogOut, Bell, Menu, X, Pencil, Save, Camera,
  Upload
} from 'lucide-react';

type Sekme = 'profil' | 'ilanlar' | 'araclar' | 'mesajlar' | 'favoriler' | 'destek';

type PanelPageProps = {
  onLogout: () => void;
  onIlanEkle: () => void;
  onIlanDetay: (ilan: Ilan) => void;
  userId: string;
};

const MARKA_MODELLER: Record<string, string[]> = {
  'Mercedes': ['Sprinter', 'Vito', 'V-Class', 'Tourismo', 'Travego', 'Citaro'],
  'Fiat': ['Ducato', 'Doblo', 'Scudo'],
  'Ford': ['Transit', 'Transit Custom', 'Tourneo'],
  'Volkswagen': ['Crafter', 'Transporter', 'Caravelle'],
  'Renault': ['Master', 'Trafic', 'Kangoo'],
  'Peugeot': ['Boxer', 'Expert', 'Traveller'],
  'Citroen': ['Jumper', 'Jumpy', 'SpaceTourer'],
  'Iveco': ['Daily', 'Crossway', 'Evadys'],
  'Temsa': ['MD9', 'Maraton', 'Safari', 'Avenue', 'Opalin'],
  'Isuzu': ['Novo', 'Turquoise', 'Citiport', 'Visigo'],
  'Toyota': ['HiAce', 'Proace'],
  'Hyundai': ['H350', 'Solati', 'County', 'Universe'],
  'MAN': ["Lion's City", "Lion's Coach", 'TGE'],
  'Scania': ['Touring', 'Interlink', 'OmniCity'],
  'Volvo': ['9700', '9900', 'B8R'],
  'Karsan': ['Jest', 'Atak', 'e-ATAK'],
  'Neoplan': ['Cityliner', 'Tourliner', 'Skyliner'],
  'Opel': ['Movano', 'Vivaro', 'Combo'],
};
const markalar = Object.keys(MARKA_MODELLER);
const iller = Object.keys(ilceler).sort();
const aracTipleri = ['Minibus 16+1', 'Midibus 27+1', 'Otobüs 45+1', 'Sedan', 'Van'];
const tumIller = Object.keys(ilceler).sort();
const MAX_RESIM = 6;

const KONUMLU_KATEGORILER = ['hostesim_is', 'soforum_is', 'plaka_satiyorum', 'aracimi_satiyorum'];
const RESIMLI_KATEGORILER = ['aracimi_satiyorum', 'aracim_var_is', 'hostesim_is', 'soforum_is'];

const ic = 'w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
const lb = 'text-xs font-medium text-slate-500 mb-1 block';
const btnO = 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition';
const btnS = 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-sm font-medium px-4 py-3 rounded-xl transition';

const toggleArr = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

// ─── Yardımcı: İl/İlçe/Mahalle ──────────────────────────────────────────────
function IlIlceMahalle({ il, ilce, mah, onIlChange, onIlceChange, onMahChange }: {
  il: string; ilce: string; mah: string;
  onIlChange: (v: string) => void; onIlceChange: (v: string) => void; onMahChange: (v: string) => void;
}) {
  const ilceleri = il ? (ilceler[il] || []) : [];
  const mahalleleri = il === 'Istanbul' && ilce ? ((mahalleler as any)[ilce] || []) : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div><label className={lb}>Şehir</label>
        <select value={il} onChange={e => onIlChange(e.target.value)} className={ic}>
          <option value="">İl Seç</option>{tumIller.map(i => <option key={i} value={i}>{i}</option>)}
        </select></div>
      <div><label className={lb}>İlçe</label>
        <select value={ilce} onChange={e => onIlceChange(e.target.value)} disabled={!il} className={ic + ' disabled:bg-slate-50'}>
          <option value="">İlçe Seç</option>{ilceleri.map(i => <option key={i} value={i}>{i}</option>)}
        </select></div>
      <div><label className={lb}>Mahalle</label>
        {il === 'Istanbul' ? (
          <select value={mah} onChange={e => onMahChange(e.target.value)} disabled={!ilce} className={ic + ' disabled:bg-slate-50'}>
            <option value="">Mahalle Seç</option>{mahalleleri.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input value={mah} onChange={e => onMahChange(e.target.value)} placeholder="Mahalle" className={ic} />
        )}
      </div>
    </div>
  );
}

// ─── Profil Resmi ─────────────────────────────────────────────────────────────
function ProfilResmiWidget({ userId, mevcutUrl, onGuncelle }: {
  userId: string; mevcutUrl: string; onGuncelle: (url: string) => void;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDosyaSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setHata('Dosya 5MB\'dan küçük olmalıdır.'); return; }
    setHata(''); setYukleniyor(true);
    try {
      const dosyaAdi = `profil-${userId}-${Date.now()}`;
      if (mevcutUrl) {
        const eskiPath = mevcutUrl.split('/profil-resimleri/')[1];
        if (eskiPath) await supabase.storage.from('profil-resimleri').remove([eskiPath]);
      }
      const { data, error } = await supabase.storage.from('profil-resimleri').upload(dosyaAdi, file, { upsert: true });
      if (error) { setHata('Yükleme hatası: ' + error.message); setYukleniyor(false); return; }
      const { data: urlData } = supabase.storage.from('profil-resimleri').getPublicUrl(data.path);
      const yeniUrl = urlData.publicUrl;
      await supabase.from('profiles').update({ avatar_url: yeniUrl }).eq('id', userId);
      const user = mevcutKullanici();
      if (user) localStorage.setItem('user', JSON.stringify({ ...user, avatar_url: yeniUrl }));
      onGuncelle(yeniUrl);
    } catch { setHata('Beklenmeyen bir hata oluştu.'); }
    setYukleniyor(false); e.target.value = '';
  };

  const handleResimSil = async () => {
    if (!mevcutUrl || !confirm('Profil resminizi silmek istiyor musunuz?')) return;
    setYukleniyor(true);
    const eskiPath = mevcutUrl.split('/profil-resimleri/')[1];
    if (eskiPath) await supabase.storage.from('profil-resimleri').remove([eskiPath]);
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
    const user = mevcutKullanici();
    if (user) { const { avatar_url, ...rest } = user as any; localStorage.setItem('user', JSON.stringify(rest)); }
    onGuncelle(''); setYukleniyor(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
          {mevcutUrl ? <img src={mevcutUrl} alt="Profil" className="w-full h-full object-cover" /> : <User size={36} className="text-slate-300" />}
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={yukleniyor}
          className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-50">
          {yukleniyor ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={13} />}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleDosyaSec} className="hidden" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => inputRef.current?.click()} disabled={yukleniyor}
          className="text-xs text-orange-500 hover:text-orange-700 font-semibold border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
          {mevcutUrl ? 'Değiştir' : 'Fotoğraf Ekle'}
        </button>
        {mevcutUrl && (
          <button onClick={handleResimSil} disabled={yukleniyor}
            className="text-xs text-red-400 hover:text-red-600 font-semibold border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
            Sil
          </button>
        )}
      </div>
      {hata && <p className="text-xs text-red-500 text-center">{hata}</p>}
      <p className="text-[11px] text-slate-400 text-center">JPEG, PNG, WEBP · Maks 5MB</p>
    </div>
  );
}

// ─── Resim Yükleme (ilan resimleri) ──────────────────────────────────────────
interface IlanResmi { file?: File; url: string; }

function ResimYukleme({ resimler, onEkle, onSil }: {
  resimler: IlanResmi[];
  onEkle: (files: File[]) => void;
  onSil: (index: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const kalan = MAX_RESIM - resimler.length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) onEkle(files);
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-700 text-sm">Araç Fotoğrafları</h3>
          <p className="text-xs text-slate-400">En fazla {MAX_RESIM} fotoğraf</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${resimler.length >= MAX_RESIM ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
          {resimler.length}/{MAX_RESIM}
        </span>
      </div>
      {kalan > 0 && (
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition mb-3 ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-300 hover:bg-slate-50'}`}>
          <Upload size={20} className={dragOver ? 'text-orange-400' : 'text-slate-300'} />
          <p className="text-sm text-slate-500 text-center">Fotoğraf sürükle veya tıkla</p>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => { const files = Array.from(e.target.files || []); if (files.length) onEkle(files); e.target.value = ''; }} className="hidden" />
        </div>
      )}
      {resimler.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {resimler.map((resim, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
              <img src={resim.url} alt={`Fotoğraf ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button type="button" onClick={e => { e.stopPropagation(); onSil(i); }}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"><X size={14} /></button>
              </div>
              <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{i + 1}</div>
              {i === 0 && <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Ana</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Düzenleme Modalı İçeriği (kategoriye göre) ───────────────────────────────
function DuzenleIcerik({ ilan, onKaydet, onKapat }: {
  ilan: Ilan;
  onKaydet: (updates: any) => void;
  onKapat: () => void;
}) {
  const kategori = ilan.kategori;
  const ek = ilan.ekbilgiler || {};

  const [aciklama, setAciklama] = useState(ilan.aciklama || '');

  const [resimler, setResimler] = useState<IlanResmi[]>(
    (ek.resimler || []).map((url: string) => ({ url }))
  );
  const [resimYukleniyor, setResimYukleniyor] = useState(false);

  const handleResimEkle = useCallback((files: File[]) => {
    setResimler(prev => {
      const kalan = MAX_RESIM - prev.length;
      return [...prev, ...files.slice(0, kalan).map(f => ({ file: f, url: URL.createObjectURL(f) }))];
    });
  }, []);
  const handleResimSil = useCallback((i: number) => setResimler(prev => prev.filter((_, idx) => idx !== i)), []);

  const [isimVarArac, setIsimVarArac] = useState({
    arac_markasi: ek.arac_markasi || '', model: ek.model || '', arac_yili: ek.arac_yili || '',
    arac_kapasitesi: ek.arac_kapasitesi || '', ucret: ek.ucret || '', km: ek.km || '',
    calisılacak_gun: ek.calisılacak_gun || '', servis_suresi: ek.servis_suresi || '',
    aracki_yolcu_sayisi: ek.aracki_yolcu_sayisi || '', servis_turu: ek.servis_turu || [] as string[],
  });

  const [aracimVarIs, setAracimVarIs] = useState({
    secilen_arac: ek.secilen_arac || '', calisma_yerleri: ek.calisma_yerleri || '',
  });

  const [soforAriyorum, setSoforAriyorum] = useState({
    odeme_sekli: ek.odeme_sekli || 'aylik', ucret: ek.ucret || '',
    aranan_tecrube: ek.aranan_tecrube || '', ortalama_servis_suresi: ek.ortalama_servis_suresi || '',
    yolcu_sayisi: ek.yolcu_sayisi || '', km: ek.km || '',
    calisılacak_gun: ek.calisılacak_gun || '', yabanci_diller: ek.yabanci_diller || [] as string[],
  });

  const [hostesAriyorum, setHostesAriyorum] = useState({
    ucret: ek.ucret || '', calisılacak_okul: ek.calisılacak_okul || '',
    aranan_tecrube: ek.aranan_tecrube || '', okul_turu: ek.okul_turu || 'Anaokulu Kres',
    yabanci_diller: ek.yabanci_diller || [] as string[],
  });

  const [hostesimIs, setHostesimIs] = useState({
    dogum_tarihi: ek.dogum_tarihi || '', dogum_yeri: ek.dogum_yeri || '',
    egitim_durumu: ek.egitim_durumu || '', yabanci_diller: ek.yabanci_diller || [] as string[],
    servis_tasimacilik_deneyimi: ek.servis_tasimacilik_deneyimi || 'var',
  });

  const [soforumIs, setSoforumIs] = useState({
    surucubelgesi: ek.surucubelgesi || '', ehliyet_alinma_tarihi: ek.ehliyet_alinma_tarihi || '',
    sinav_belgeleri: ek.sinav_belgeleri || '', dogum_tarihi: ek.dogum_tarihi || '',
    dogum_yeri: ek.dogum_yeri || '', arac_turu: ek.arac_turu || [] as string[],
    belgeler: ek.belgeler || [] as string[], yabanci_diller: ek.yabanci_diller || [] as string[],
    emekli: ek.emekli || 'hayir', mesleki_yeterlilik: ek.mesleki_yeterlilik || 'var',
    sabika_kaydi: ek.sabika_kaydi || 'var', tam_zamanlimi: ek.tam_zamanlimi || 'hayir',
    servis_tasimacilik_deneyimi: ek.servis_tasimacilik_deneyimi || 'var',
    baska_ise_gider_misiniz: ek.baska_ise_gider_misiniz || 'hayir',
  });

  const [plakaSatiyorum, setPlakaSatiyorum] = useState({
    plaka_il: ek.plaka_il || '', plaka_harf: ek.plaka_harf || '', plaka_no: ek.plaka_no || '',
    ucret: ek.ucret || '', aracla_birlikte: ek.aracla_birlikte || false,
    yol_belgesi_var: ek.yol_belgesi_var || false, noter_satisi: ek.noter_satisi || false, hisseli: ek.hisseli || false,
  });

  const [aracimiSatiyorum, setAracimiSatiyorum] = useState({
    marka: ek.marka || '', model: ek.model || '', yil: ek.yil || '', plaka: ek.plaka || '',
    koltuk_sayisi: ek.koltuk_sayisi || '', arac_tipi: ek.arac_tipi || '',
    km: ek.km || '', ucret: ek.ucret || '', hasar_kaydi: ek.hasar_kaydi || 'yok',
    noter_satisi: ek.noter_satisi || false, aracla_birlikte_plaka: ek.aracla_birlikte_plaka || false,
  });

  const konumGuzergah = (ilan.guzergahlar?.[0] || {}) as any;
  const [konumIl, setKonumIl] = useState(konumGuzergah.kalkis_il || '');
  const [konumIlce, setKonumIlce] = useState(konumGuzergah.kalkis_ilce || '');
  const [konumMah, setKonumMah] = useState(konumGuzergah.kalkis_mah || '');
  const [guzergahlar, setGuzergahlar] = useState<any[]>(
    ilan.guzergahlar && ilan.guzergahlar.length > 0
      ? ilan.guzergahlar
      : [{ giris_saati: '', kalkis_il: '', kalkis_ilce: '', kalkis_mah: '', varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '', baslangic_saati: '', bitis_saati: '' }]
  );

  const handleKaydet = async () => {
    let yeniEkbilgiler: any = { ...ek };
    let yeniGuzergahlar = ilan.guzergahlar ? [...ilan.guzergahlar] : [];

    setResimYukleniyor(true);
    const yuklenenUrller: string[] = [];
    for (const resim of resimler) {
      if (resim.file) {
        const ad = `ilan-resim-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const { data } = await supabase.storage.from('profil-resimleri').upload(ad, resim.file);
        if (data) { const { data: u } = supabase.storage.from('profil-resimleri').getPublicUrl(data.path); yuklenenUrller.push(u.publicUrl); }
      } else { yuklenenUrller.push(resim.url); }
    }
    setResimYukleniyor(false);

    if (kategori === 'isim_var_arac') {
      yeniEkbilgiler = { ...isimVarArac };
      yeniGuzergahlar = guzergahlar;
    } else if (kategori === 'aracim_var_is') {
      yeniEkbilgiler = { ...aracimVarIs, resimler: yuklenenUrller };
    } else if (kategori === 'sofor_ariyorum') {
      yeniEkbilgiler = { ...soforAriyorum };
    } else if (kategori === 'hostes_ariyorum') {
      yeniEkbilgiler = { ...hostesAriyorum };
    } else if (kategori === 'hostesim_is') {
      yeniEkbilgiler = { ...hostesimIs, resimler: yuklenenUrller };
      yeniGuzergahlar = [{ giris_saati: '', kalkis_il: konumIl, kalkis_ilce: konumIlce, kalkis_mah: konumMah, varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '' }];
    } else if (kategori === 'soforum_is') {
      yeniEkbilgiler = { ...soforumIs, resimler: yuklenenUrller };
      yeniGuzergahlar = [{ giris_saati: '', kalkis_il: konumIl, kalkis_ilce: konumIlce, kalkis_mah: konumMah, varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '' }];
    } else if (kategori === 'plaka_satiyorum') {
      yeniEkbilgiler = { ...plakaSatiyorum };
      yeniGuzergahlar = [{ giris_saati: '', kalkis_il: konumIl, kalkis_ilce: konumIlce, kalkis_mah: konumMah, varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '' }];
    } else if (kategori === 'aracimi_satiyorum') {
      yeniEkbilgiler = { ...aracimiSatiyorum, resimler: yuklenenUrller };
      yeniGuzergahlar = [{ giris_saati: '', kalkis_il: konumIl, kalkis_ilce: konumIlce, kalkis_mah: konumMah, varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '' }];
    }

    onKaydet({ aciklama, ekbilgiler: yeniEkbilgiler, guzergahlar: yeniGuzergahlar });
  };

  const dilSecenekleri = ['İngilizce', 'Arapça', 'Almanca', 'Fransızca', 'Diğer'];

  return (
    <div className="space-y-5">
      {/* İŞİM VAR ARAÇ */}
      {kategori === 'isim_var_arac' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Araç Bilgileri</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={lb}>Araç Markası</label>
              <select
                value={isimVarArac.arac_markasi}
                onChange={e => setIsimVarArac({ ...isimVarArac, arac_markasi: e.target.value, model: '' })}
                className={ic}
              >
                <option value="">Seçin</option>
                <option value="farketmez">Farketmez</option>
                {Object.keys(MARKA_MODELLER).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={lb}>Model</label>
              <select
                value={isimVarArac.model}
                onChange={e => setIsimVarArac({ ...isimVarArac, model: e.target.value })}
                disabled={!isimVarArac.arac_markasi || isimVarArac.arac_markasi === 'farketmez'}
                className={ic + ' disabled:bg-slate-50 disabled:text-slate-400'}
              >
                <option value="">Seçin</option>
                <option value="farketmez">Farketmez</option>
                {(MARKA_MODELLER[isimVarArac.arac_markasi] || []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={lb}>Araç Yılı</label>
              <select value={isimVarArac.arac_yili} onChange={e => setIsimVarArac({ ...isimVarArac, arac_yili: e.target.value })} className={ic}>
                <option value="">Seçin</option>
                <option value="farketmez">Farketmez</option>
                {Array.from({ length: 20 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={lb}>Kapasite</label>
              <select value={isimVarArac.arac_kapasitesi} onChange={e => setIsimVarArac({ ...isimVarArac, arac_kapasitesi: e.target.value })} className={ic}>
                <option value="">Seçin</option>
                <option value="farketmez">Farketmez</option>
                {['4+1', '8+1', '14+1', '16+1', '27+1', '36+1', '45+1'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div><label className={lb}>Ücret (TL)</label><input type="number" value={isimVarArac.ucret} onChange={e => setIsimVarArac({ ...isimVarArac, ucret: e.target.value })} className={ic} /></div>
            <div><label className={lb}>KM</label><input type="number" value={isimVarArac.km} onChange={e => setIsimVarArac({ ...isimVarArac, km: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Çalışacak Gün</label><input type="number" value={isimVarArac.calisılacak_gun} onChange={e => setIsimVarArac({ ...isimVarArac, calisılacak_gun: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Servis Süresi (Dk)</label><input type="number" value={isimVarArac.servis_suresi} onChange={e => setIsimVarArac({ ...isimVarArac, servis_suresi: e.target.value })} className={ic} /></div>
          </div>
          <div className="mb-4">
            <label className={lb}>Yolcu Sayısı</label>
            <input type="number" value={isimVarArac.aracki_yolcu_sayisi} onChange={e => setIsimVarArac({ ...isimVarArac, aracki_yolcu_sayisi: e.target.value })} className={ic + ' max-w-xs'} />
          </div>
          <div>
            <label className={lb + ' mb-2'}>Servis Türü</label>
            <div className="flex flex-wrap gap-3">
              {['Okul', 'Personel', 'Hafif Minibus', 'Turizm', 'Diğer'].map(t => (
                <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={isimVarArac.servis_turu.includes(t)} onChange={() => setIsimVarArac({ ...isimVarArac, servis_turu: toggleArr(isimVarArac.servis_turu, t) })} className="accent-orange-500 w-4 h-4" />{t}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GÜZERGAHLAR - isim_var_arac */}
      {kategori === 'isim_var_arac' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700 text-sm">Güzergahlar</h3>
            <button
              type="button"
              onClick={() => setGuzergahlar([...guzergahlar, { giris_saati: '', kalkis_il: '', kalkis_ilce: '', kalkis_mah: '', varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '' }])}
              className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg"
            >
              + Güzergah Ekle
            </button>
          </div>
          {guzergahlar.map((g, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 mb-3 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-500">Güzergah {i + 1}</span>
                {guzergahlar.length > 1 && (
                  <button onClick={() => setGuzergahlar(guzergahlar.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex flex-col gap-2">
                  <div>
                    <label className={lb}>Giriş Saati</label>
                    <input type="time" value={g.giris_saati} onChange={e => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, giris_saati: e.target.value } : x))} className={ic} />
                  </div>
                  <div>
                    <label className={lb}>Başlangıç Saati</label>
                    <input type="time" value={g.baslangic_saati || ''} onChange={e => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, baslangic_saati: e.target.value } : x))} className={ic} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className={lb}>Çıkış Saati</label>
                    <input type="time" value={g.cikis_saati} onChange={e => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, cikis_saati: e.target.value } : x))} className={ic} />
                  </div>
                  <div>
                    <label className={lb}>Bitiş Saati</label>
                    <input type="time" value={g.bitis_saati || ''} onChange={e => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, bitis_saati: e.target.value } : x))} className={ic} />
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Kalkış</p>
              <IlIlceMahalle
                il={g.kalkis_il} ilce={g.kalkis_ilce} mah={g.kalkis_mah}
                onIlChange={v => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, kalkis_il: v, kalkis_ilce: '', kalkis_mah: '' } : x))}
                onIlceChange={v => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, kalkis_ilce: v, kalkis_mah: '' } : x))}
                onMahChange={v => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, kalkis_mah: v } : x))}
              />
              <p className="text-xs font-semibold text-slate-400 mb-1 mt-2">Varış</p>
              <IlIlceMahalle
                il={g.varis_il} ilce={g.varis_ilce} mah={g.varis_mah}
                onIlChange={v => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, varis_il: v, varis_ilce: '', varis_mah: '' } : x))}
                onIlceChange={v => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, varis_ilce: v, varis_mah: '' } : x))}
                onMahChange={v => setGuzergahlar(guzergahlar.map((x, idx) => idx === i ? { ...x, varis_mah: v } : x))}
              />
            </div>
          ))}
        </div>
      )}

      {/* ARACIM VAR İŞ */}
      {kategori === 'aracim_var_is' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Araç Bilgileri</h3>
          <div className="mb-3"><label className={lb}>Seçilen Araç (Plaka)</label><input value={aracimVarIs.secilen_arac} onChange={e => setAracimVarIs({ ...aracimVarIs, secilen_arac: e.target.value })} className={ic} placeholder="Araç plakası" /></div>
          <div><label className={lb}>Çalışma Yerleri / İstenen Güzergah</label><input value={aracimVarIs.calisma_yerleri} onChange={e => setAracimVarIs({ ...aracimVarIs, calisma_yerleri: e.target.value })} placeholder="Kadıköy, Üsküdar, Beşiktaş" className={ic} /></div>
        </div>
      )}

      {/* ŞOFÖR ARIYORUM */}
      {kategori === 'sofor_ariyorum' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">İlan Detayları</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={lb}>Ödeme Şekli</label>
              <select value={soforAriyorum.odeme_sekli} onChange={e => setSoforAriyorum({ ...soforAriyorum, odeme_sekli: e.target.value })} className={ic}>
                <option value="aylik">Aylık</option><option value="haftalik">Haftalık</option><option value="gunluk">Günlük</option>
              </select></div>
            <div><label className={lb}>Ücret (TL)</label><input type="number" value={soforAriyorum.ucret} onChange={e => setSoforAriyorum({ ...soforAriyorum, ucret: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Aranan Tecrübe</label>
              <select value={soforAriyorum.aranan_tecrube} onChange={e => setSoforAriyorum({ ...soforAriyorum, aranan_tecrube: e.target.value })} className={ic}>
                <option value="">Farketmez</option><option value="1">1 Yıl</option><option value="2">2 Yıl</option><option value="3">3 Yıl+</option>
              </select></div>
            <div><label className={lb}>Ort. Servis Süresi (Dk)</label><input type="number" value={soforAriyorum.ortalama_servis_suresi} onChange={e => setSoforAriyorum({ ...soforAriyorum, ortalama_servis_suresi: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Yolcu Sayısı</label><input type="number" value={soforAriyorum.yolcu_sayisi} onChange={e => setSoforAriyorum({ ...soforAriyorum, yolcu_sayisi: e.target.value })} className={ic} /></div>
            <div><label className={lb}>KM</label><input type="number" value={soforAriyorum.km} onChange={e => setSoforAriyorum({ ...soforAriyorum, km: e.target.value })} className={ic} /></div>
          </div>
          <div className="mb-4"><label className={lb}>Çalışacak Gün</label><input type="number" value={soforAriyorum.calisılacak_gun} onChange={e => setSoforAriyorum({ ...soforAriyorum, calisılacak_gun: e.target.value })} className={ic + ' max-w-xs'} /></div>
          <div><label className={lb + ' mb-2'}>İstenen Yabancı Diller</label>
            <div className="flex flex-wrap gap-3">
              {dilSecenekleri.map(d => (
                <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={soforAriyorum.yabanci_diller.includes(d)} onChange={() => setSoforAriyorum({ ...soforAriyorum, yabanci_diller: toggleArr(soforAriyorum.yabanci_diller, d) })} className="accent-orange-500 w-4 h-4" />{d}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOSTES ARIYORUM */}
      {kategori === 'hostes_ariyorum' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">İlan Detayları</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={lb}>Ücret (TL)</label><input type="number" value={hostesAriyorum.ucret} onChange={e => setHostesAriyorum({ ...hostesAriyorum, ucret: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Çalışacak Okul</label><input value={hostesAriyorum.calisılacak_okul} onChange={e => setHostesAriyorum({ ...hostesAriyorum, calisılacak_okul: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Aranan Tecrübe</label>
              <select value={hostesAriyorum.aranan_tecrube} onChange={e => setHostesAriyorum({ ...hostesAriyorum, aranan_tecrube: e.target.value })} className={ic}>
                <option value="">Farketmez</option><option value="1">1 Yıl</option><option value="2">2 Yıl</option><option value="3">3 Yıl+</option>
              </select></div>
          </div>
          <div className="mb-4"><label className={lb + ' mb-2'}>Okul Türü</label>
            <div className="flex flex-wrap gap-4">
              {['Anaokulu Kres', 'İlk Öğretim', 'Lise'].map(t => (
                <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" checked={hostesAriyorum.okul_turu === t} onChange={() => setHostesAriyorum({ ...hostesAriyorum, okul_turu: t })} className="accent-orange-500" />{t}
                </label>
              ))}
            </div>
          </div>
          <div><label className={lb + ' mb-2'}>Yabancı Diller</label>
            <div className="flex flex-wrap gap-3">
              {dilSecenekleri.map(d => (
                <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={hostesAriyorum.yabanci_diller.includes(d)} onChange={() => setHostesAriyorum({ ...hostesAriyorum, yabanci_diller: toggleArr(hostesAriyorum.yabanci_diller, d) })} className="accent-orange-500 w-4 h-4" />{d}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOSTESİM İŞ */}
      {kategori === 'hostesim_is' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">İlan Detayları</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={lb}>Doğum Tarihi</label><input type="date" value={hostesimIs.dogum_tarihi} onChange={e => setHostesimIs({ ...hostesimIs, dogum_tarihi: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Doğum Yeri</label><input value={hostesimIs.dogum_yeri} onChange={e => setHostesimIs({ ...hostesimIs, dogum_yeri: e.target.value })} className={ic} /></div>
            <div className="col-span-2"><label className={lb}>Eğitim Durumu</label>
              <select value={hostesimIs.egitim_durumu} onChange={e => setHostesimIs({ ...hostesimIs, egitim_durumu: e.target.value })} className={ic}>
                <option value="">Seçiniz</option><option value="ilkokul">İlkokul</option><option value="ortaokul">Ortaokul</option><option value="lise">Lise</option><option value="universite">Üniversite</option>
              </select></div>
          </div>
          <div className="mb-4"><label className={lb + ' mb-2'}>Yabancı Diller</label>
            <div className="flex flex-wrap gap-3">
              {dilSecenekleri.map(d => (
                <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={hostesimIs.yabanci_diller.includes(d)} onChange={() => setHostesimIs({ ...hostesimIs, yabanci_diller: toggleArr(hostesimIs.yabanci_diller, d) })} className="accent-orange-500 w-4 h-4" />{d}
                </label>
              ))}
            </div>
          </div>
          <div><label className={lb + ' mb-2'}>Servis Taşımacılık Deneyimi</label>
            <div className="flex gap-4">
              {['var', 'yok'].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" checked={hostesimIs.servis_tasimacilik_deneyimi === v} onChange={() => setHostesimIs({ ...hostesimIs, servis_tasimacilik_deneyimi: v })} className="accent-orange-500" />{v === 'var' ? 'Var' : 'Yok'}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ŞOFÖRÜM İŞ */}
      {kategori === 'soforum_is' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Ehliyet ve Araç Bilgileri</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={lb}>Sürücü Belgesi</label>
              <select value={soforumIs.surucubelgesi} onChange={e => setSoforumIs({ ...soforumIs, surucubelgesi: e.target.value })} className={ic}>
                <option value="">Seçin</option>{['B', 'D', 'D1', 'D2', 'D+E'].map(b => <option key={b} value={b}>{b}</option>)}
              </select></div>
            <div><label className={lb}>Ehliyet Tarihi</label><input type="date" value={soforumIs.ehliyet_alinma_tarihi} onChange={e => setSoforumIs({ ...soforumIs, ehliyet_alinma_tarihi: e.target.value })} className={ic} /></div>
            <div><label className={lb}>SRC Belgeleri</label><input value={soforumIs.sinav_belgeleri} placeholder="SRC2, SRC3" onChange={e => setSoforumIs({ ...soforumIs, sinav_belgeleri: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Doğum Tarihi</label><input type="date" value={soforumIs.dogum_tarihi} onChange={e => setSoforumIs({ ...soforumIs, dogum_tarihi: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Doğum Yeri</label><input value={soforumIs.dogum_yeri} onChange={e => setSoforumIs({ ...soforumIs, dogum_yeri: e.target.value })} className={ic} /></div>
          </div>
          <div className="mb-4"><label className={lb + ' mb-2'}>Araç Türü</label>
            <div className="flex flex-wrap gap-3">
              {['Minibus', 'Midibus', 'Otobus', 'Van', 'Otomobil'].map(t => (
                <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={soforumIs.arac_turu.includes(t)} onChange={() => setSoforumIs({ ...soforumIs, arac_turu: toggleArr(soforumIs.arac_turu, t) })} className="accent-orange-500 w-4 h-4" />{t}
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className={lb + ' mb-2'}>Belgeler</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {['Src', 'Src1', 'Src2', 'Src3', 'Diğer', 'Tam Şoför Kart'].map(b => (
                <label key={b} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={soforumIs.belgeler.includes(b)} onChange={() => setSoforumIs({ ...soforumIs, belgeler: toggleArr(soforumIs.belgeler, b) })} className="accent-orange-500 w-4 h-4" />{b}
                </label>
              ))}
            </div>
            <label className={lb + ' mb-2'}>Yabancı Diller</label>
            <div className="flex flex-wrap gap-3">
              {dilSecenekleri.map(d => (
                <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={soforumIs.yabanci_diller.includes(d)} onChange={() => setSoforumIs({ ...soforumIs, yabanci_diller: toggleArr(soforumIs.yabanci_diller, d) })} className="accent-orange-500 w-4 h-4" />{d}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Emekli misiniz?', key: 'emekli' },
              { label: 'Mesleki Yeterlilik?', key: 'mesleki_yeterlilik' },
              { label: 'Sabıka kaydı?', key: 'sabika_kaydi' },
              { label: 'Tam zamanlı?', key: 'tam_zamanlimi' },
              { label: 'Servis Deneyimi?', key: 'servis_tasimacilik_deneyimi' },
              { label: 'Başka işe gider?', key: 'baska_ise_gider_misiniz' },
            ].map(item => (
              <div key={item.key}><label className={lb + ' mb-2'}>{item.label}</label>
                <div className="flex gap-3">
                  {['Evet', 'Hayır'].map(v => (
                    <label key={v} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                      <input type="radio" checked={(soforumIs as any)[item.key] === v.toLowerCase().replace('ı', 'i')} onChange={() => setSoforumIs({ ...soforumIs, [item.key]: v.toLowerCase().replace('ı', 'i') })} className="accent-orange-500" />{v}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLAKA SATIYORUM */}
      {kategori === 'plaka_satiyorum' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Plaka Bilgileri (Gizlenecektir)</h3>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <input value={plakaSatiyorum.plaka_il} placeholder="34" maxLength={2} onChange={e => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_il: e.target.value })} className="w-16 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input value={plakaSatiyorum.plaka_harf} placeholder="LAL" maxLength={3} onChange={e => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_harf: e.target.value.toUpperCase() })} className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input value={plakaSatiyorum.plaka_no} placeholder="454" maxLength={4} onChange={e => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_no: e.target.value })} className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <div className="flex items-center gap-2">
              <input type="number" value={plakaSatiyorum.ucret} placeholder="1.000.000" onChange={e => setPlakaSatiyorum({ ...plakaSatiyorum, ucret: e.target.value })} className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <span className="text-sm text-slate-500 font-medium">TL</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {[{ key: 'aracla_birlikte', label: 'Araçla Birlikte' }, { key: 'yol_belgesi_var', label: 'Yol Belgesi Var' }, { key: 'noter_satisi', label: 'Noter Satışı' }, { key: 'hisseli', label: 'Hisseli' }].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={(plakaSatiyorum as any)[item.key]} onChange={e => setPlakaSatiyorum({ ...plakaSatiyorum, [item.key]: e.target.checked })} className="accent-orange-500 w-4 h-4" />{item.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ARACIMI SATIYORUM */}
      {kategori === 'aracimi_satiyorum' && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Araç Bilgileri</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={lb}>Marka</label>
              <select value={aracimiSatiyorum.marka} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, marka: e.target.value })} className={ic}>
                <option value="">Seçin</option>{markalar.map(m => <option key={m} value={m}>{m}</option>)}
              </select></div>
            <div><label className={lb}>Model</label><input value={aracimiSatiyorum.model} placeholder="Sprinter, Ducato..." onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, model: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Yıl</label>
              <select value={aracimiSatiyorum.yil} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, yil: e.target.value })} className={ic}>
                <option value="">Seçin</option>{Array.from({ length: 20 }, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select></div>
            <div><label className={lb}>Plaka (Gizlenecektir)</label><input value={aracimiSatiyorum.plaka} placeholder="34 ABC 123" onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, plaka: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Koltuk Sayısı</label>
              <select value={aracimiSatiyorum.koltuk_sayisi} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, koltuk_sayisi: e.target.value })} className={ic}>
                <option value="">Seçin</option>{['4+1', '8+1', '14+1', '16+1', '27+1', '36+1', '45+1'].map(k => <option key={k} value={k}>{k}</option>)}
              </select></div>
            <div><label className={lb}>Araç Tipi</label>
              <select value={aracimiSatiyorum.arac_tipi} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, arac_tipi: e.target.value })} className={ic}>
                <option value="">Seçin</option>{['Minibus', 'Midibus', 'Otobus', 'Van', 'Sedan'].map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className={lb}>KM</label><input type="number" value={aracimiSatiyorum.km} placeholder="150000" onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, km: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Fiyat (TL)</label><input type="number" value={aracimiSatiyorum.ucret} placeholder="1200000" onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, ucret: e.target.value })} className={ic} /></div>
            <div><label className={lb}>Hasar Kaydı</label>
              <select value={aracimiSatiyorum.hasar_kaydi} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, hasar_kaydi: e.target.value })} className={ic}>
                <option value="yok">Yok</option><option value="var">Var</option>
              </select></div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={aracimiSatiyorum.noter_satisi} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, noter_satisi: e.target.checked })} className="accent-orange-500 w-4 h-4" />Noter Satışı</label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={aracimiSatiyorum.aracla_birlikte_plaka} onChange={e => setAracimiSatiyorum({ ...aracimiSatiyorum, aracla_birlikte_plaka: e.target.checked })} className="accent-orange-500 w-4 h-4" />Plakayla Birlikte</label>
          </div>
        </div>
      )}

      {/* RESİM YÜKLEME */}
      {RESIMLI_KATEGORILER.includes(kategori) && (
        <ResimYukleme resimler={resimler} onEkle={handleResimEkle} onSil={handleResimSil} />
      )}

      {/* KONUM */}
      {KONUMLU_KATEGORILER.includes(kategori) && (
        <div className="border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-700 mb-1 text-sm">Konum Bilgisi</h3>
          <p className="text-xs text-orange-500 mb-4 font-medium">Bulunduğunuz şehir, ilçe ve mahalleyi seçin</p>
          <IlIlceMahalle
            il={konumIl} ilce={konumIlce} mah={konumMah}
            onIlChange={v => { setKonumIl(v); setKonumIlce(''); setKonumMah(''); }}
            onIlceChange={v => { setKonumIlce(v); setKonumMah(''); }}
            onMahChange={setKonumMah}
          />
        </div>
      )}

      {/* AÇIKLAMA */}
      <div className="border border-slate-200 rounded-xl p-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">İlan Açıklaması</label>
        <textarea className={ic + ' resize-none'} rows={4} value={aciklama}
          onChange={e => setAciklama(e.target.value)} placeholder="İlan açıklaması..." />
      </div>

      {/* KAYDET */}
      <div className="flex gap-3 pt-2">
        <button onClick={onKapat} className={btnS + ' flex-1'}>İptal</button>
        <button onClick={handleKaydet} disabled={resimYukleniyor}
          className={btnO + ' flex-1 flex items-center justify-center gap-2 disabled:opacity-60'}>
          {resimYukleniyor ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
          {resimYukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

// ─── Araç Düzenleme Modalı ───────────────────────────────────────────────────
function AracDuzenleModal({ arac, onKaydet, onKapat }: {
  arac: any;
  onKaydet: (updates: any) => void;
  onKapat: () => void;
}) {
  const [form, setForm] = useState({
    marka: arac.marka || '',
    model: arac.model || '',
    yil: arac.yil || '',
    plaka: arac.plaka || '',
    koltuk_sayisi: arac.koltuk_sayisi || '',
    arac_tipi: arac.arac_tipi || '',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-orange-500 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <Car size={16} className="text-white" />
            <h3 className="font-bold text-white text-sm">Aracı Düzenle</h3>
          </div>
          <button onClick={onKapat} className="text-white/80 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lb}>Marka</label>
              <select value={form.marka} onChange={e => setForm({ ...form, marka: e.target.value })} className={ic}>
                <option value="">Seçin</option>{markalar.map(m => <option key={m} value={m}>{m}</option>)}
              </select></div>
            <div><label className={lb}>Model</label>
              <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Sprinter, Transit..." className={ic} /></div>
            <div><label className={lb}>Yıl</label>
              <input value={form.yil} onChange={e => setForm({ ...form, yil: e.target.value })} placeholder="2020" className={ic} /></div>
            <div><label className={lb}>Plaka</label>
              <input value={form.plaka} onChange={e => setForm({ ...form, plaka: e.target.value })} placeholder="34 ABC 123" className={ic} /></div>
            <div><label className={lb}>Koltuk Sayısı</label>
              <input value={form.koltuk_sayisi} onChange={e => setForm({ ...form, koltuk_sayisi: e.target.value })} placeholder="16+1" className={ic} /></div>
            <div><label className={lb}>Araç Tipi</label>
              <select value={form.arac_tipi} onChange={e => setForm({ ...form, arac_tipi: e.target.value })} className={ic}>
                <option value="">Seçin</option>{aracTipleri.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onKapat} className={btnS + ' flex-1'}>İptal</button>
            <button onClick={() => onKaydet(form)} className={btnO + ' flex-1 flex items-center justify-center gap-2'}>
              <Save size={14} /> Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function PanelPage({ onLogout, onIlanEkle, onIlanDetay, userId }: PanelPageProps) {
  const [aktifSekme, setAktifSekme] = useState<Sekme>('profil');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [araclar, setAraclar] = useState<any[]>([]);
  const [favoriler, setFavoriler] = useState<any[]>([]);
  const [mesajlar, setMesajlar] = useState<any[]>([]);
  const [okunmamisSayi, setOkunmamisSayi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basari, setBasari] = useState('');
  const [hata, setHata] = useState('');
  const [aracFormAcik, setAracFormAcik] = useState(false);
  const [duzenleArac, setDuzenleArac] = useState<any>(null);
  const [destekGonderildi, setDestekGonderildi] = useState(false);
  const [destekForm, setDestekForm] = useState({ konu: '', mesaj: '' });
  const [aracForm, setAracForm] = useState({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
  const [menuAcik, setMenuAcik] = useState(false);
  const [notlar, setNotlar] = useState<Record<string, string>>({});
const [notDuzenle, setNotDuzenle] = useState<string | null>(null); // hangi favori notunun açık olduğu
const [notMetin, setNotMetin] = useState('');
  const [duzenleIlan, setDuzenleIlan] = useState<Ilan | null>(null);
  const [duzenleYukleniyor, setDuzenleYukleniyor] = useState(false);

  const user = mevcutKullanici();
  const [avatarUrl, setAvatarUrl] = useState<string>((user as any)?.avatar_url || '');
  const [profil, setProfil] = useState({
    ad: user?.full_name || '',
    telefon: user?.phone_number || '',
    adres: (user as any)?.adres || '',
    il: (user as any)?.il || '',
    ilce: (user as any)?.ilce || '',
    yeniSifre: '',
  });

  useEffect(() => {
    okunmamisMesajSayisi(userId).then(({ count }) => { if (count) setOkunmamisSayi(count); });
  }, [userId]);

  useEffect(() => {
    if (aktifSekme === 'ilanlar') ilanlariYukle();
    if (aktifSekme === 'araclar') araclarimYukle();
    if (aktifSekme === 'favoriler') favorileriYukle();
    if (aktifSekme === 'mesajlar') mesajlariYukle();
  }, [aktifSekme]);

  useEffect(() => {
    document.body.style.overflow = menuAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAcik]);

  const ilanlariYukle = async () => { setYukleniyor(true); const { data } = await kullaniciIlanlari(userId); if (data) setIlanlar(data as Ilan[]); setYukleniyor(false); };
  const araclarimYukle = async () => { setYukleniyor(true); const { data } = await araclarGetir(userId); if (data) setAraclar(data); setYukleniyor(false); };
  const favorileriYukle = async () => {
  setYukleniyor(true);
  const { data } = await favorileriGetir(userId);
  if (data) {
    setFavoriler(data);
    // Notları localStorage'dan yükle
    const kayitliNotlar = JSON.parse(localStorage.getItem(`favori_notlar_${userId}`) || '{}');
    setNotlar(kayitliNotlar);
  }
  setYukleniyor(false);
};
  const mesajlariYukle = async () => { setYukleniyor(true); const { data } = await gelenMesajlar(userId); if (data) setMesajlar(data); setYukleniyor(false); };

  const handleIlanSil = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    const { error } = await ilanSil(id);
    if (!error) setIlanlar(ilanlar.filter(i => i.id !== id));
  };

  const handleAracEkle = async () => {
    if (!aracForm.marka || !aracForm.model || !aracForm.plaka) { setHata('Marka, model ve plaka zorunludur.'); return; }
    setHata('');
    const { data, error } = await aracEkle({ ...aracForm, user_id: userId });
    if (!error && data) {
      setAraclar([...araclar, data[0]]);
      setAracForm({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
      setAracFormAcik(false);
      setBasari('Araç başarıyla eklendi!');
      setTimeout(() => setBasari(''), 3000);
    }
  };

  const handleAracSil = async (id: string) => {
    if (!confirm('Bu aracı silmek istediğinizden emin misiniz?')) return;
    const { error } = await aracSil(id);
    if (!error) setAraclar(araclar.filter(a => a.id !== id));
  };

  const handleAracGuncelle = async (updates: any) => {
    if (!duzenleArac) return;
    const { error } = await supabase.from('araclar').update(updates).eq('id', duzenleArac.id);
    if (!error) {
      setAraclar(araclar.map(a => a.id === duzenleArac.id ? { ...a, ...updates } : a));
      setDuzenleArac(null);
      setBasari('Araç başarıyla güncellendi!');
      setTimeout(() => setBasari(''), 3000);
    }
  };

  const handleFavoriKaldir = async (ilanId: string) => {
    await favoriKaldir(userId, ilanId);
    setFavoriler(favoriler.filter(f => f.ilan_id !== ilanId));
  };
  const handleNotKaydet = (ilanId: string) => {
  const yeniNotlar = { ...notlar, [ilanId]: notMetin };
  setNotlar(yeniNotlar);
  localStorage.setItem(`favori_notlar_${userId}`, JSON.stringify(yeniNotlar));
  setNotDuzenle(null);
  setNotMetin('');
};

const handleNotSil = (ilanId: string) => {
  const yeniNotlar = { ...notlar };
  delete yeniNotlar[ilanId];
  setNotlar(yeniNotlar);
  localStorage.setItem(`favori_notlar_${userId}`, JSON.stringify(yeniNotlar));
};

  const handleMesajOku = async (mesajId: string) => {
    await mesajOkunduIsaretle(mesajId);
    setMesajlar(mesajlar.map(m => m.id === mesajId ? { ...m, okundu: true } : m));
    setOkunmamisSayi(Math.max(0, okunmamisSayi - 1));
  };

  const handleProfilGuncelle = async () => {
    setHata(''); setBasari('');
    const updates: any = { full_name: profil.ad, adres: profil.adres, il: profil.il, ilce: profil.ilce };
    if (profil.yeniSifre) {
      const enc = new TextEncoder();
      const data = enc.encode(profil.yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
      updates.sifre_acik = profil.yeniSifre;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) { setHata('Yükleme hatası: ' + error.message); }
    else {
      const u = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(u));
      setBasari('Bilgileriniz başarıyla güncellendi!');
      setProfil({ ...profil, yeniSifre: '' });
      setTimeout(() => setBasari(''), 3000);
    }
  };

  const handleHesapSil = async () => {
    if (!confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('user_id', userId);
    await supabase.from('araclar').delete().eq('user_id', userId);
    await supabase.from('favoriler').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    localStorage.removeItem('user');
    onLogout();
  };

  const handleDestekGonder = async () => {
    if (!destekForm.konu || !destekForm.mesaj) { setHata('Konu ve mesaj alanları zorunludur.'); return; }
    const { error } = await destekGonder({ user_id: userId, ...destekForm });
    if (!error) { setDestekGonderildi(true); setDestekForm({ konu: '', mesaj: '' }); }
  };

  const handleDuzenleKaydet = async (updates: any) => {
    if (!duzenleIlan) return;
    setDuzenleYukleniyor(true);
    const { error } = await ilanGuncelle(duzenleIlan.id, updates);
    setDuzenleYukleniyor(false);
    if (!error) {
      setIlanlar(ilanlar.map(i => i.id === duzenleIlan.id ? { ...i, ...updates } : i));
      setDuzenleIlan(null);
      setBasari('İlan başarıyla güncellendi!');
      setTimeout(() => setBasari(''), 3000);
    } else {
      setHata('Güncelleme sırasında hata oluştu.');
    }
  };

  const sekmeSecildi = (id: Sekme) => { setAktifSekme(id); setMenuAcik(false); };
  const ilceleri = profil.il ? (ilceler[profil.il] || []) : [];

  const menuItems = [
    { id: 'profil', label: 'Profilim', icon: User },
    { id: 'ilanlar', label: 'İlanlarım', icon: Eye },
    { id: 'araclar', label: 'Araçlarım', icon: Car },
    { id: 'mesajlar', label: 'Mesajlar', icon: MessageSquare, badge: okunmamisSayi },
    { id: 'favoriler', label: 'Favorilerim', icon: Heart },
    { id: 'destek', label: 'Destek', icon: HelpCircle },
  ];

  const sekmeBulunan = menuItems.find(m => m.id === aktifSekme);

  const SidebarIcerik = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 px-4 py-5 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-full bg-slate-600 border-2 border-slate-500 overflow-hidden flex items-center justify-center">
            {avatarUrl ? <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" /> : <User size={24} className="text-slate-300" />}
          </div>
        </div>
        <p className="text-white font-semibold text-sm truncate w-full">{user?.full_name || 'Kullanıcı'}</p>
        <p className="text-slate-400 text-xs truncate w-full">{user?.phone_number}</p>
      </div>
      <nav className="py-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const aktif = aktifSekme === item.id;
          return (
            <button key={item.id} onClick={() => sekmeSecildi(item.id as Sekme)}
              className={'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition ' +
                (aktif ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}>
              <span className="flex items-center gap-2.5"><Icon size={15} />{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={'text-xs px-1.5 py-0.5 rounded-full font-bold ' + (aktif ? 'bg-white/20 text-white' : 'bg-red-500 text-white')}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
        <button onClick={() => { onIlanEkle(); setMenuAcik(false); }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5">
          <Plus size={13} /> İlan Ver
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-red-500 text-xs py-2.5 rounded-lg hover:bg-red-50 transition">
          <LogOut size={13} /> Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuAcik(true)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu size={20} /></button>
          <span className="font-semibold text-slate-800 text-sm">{sekmeBulunan?.label || 'Panel'}</span>
        </div>
        <div className="flex items-center gap-2">
          {okunmamisSayi > 0 && (
            <button onClick={() => sekmeSecildi('mesajlar')} className="relative p-1.5 text-slate-400">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{okunmamisSayi}</span>
            </button>
          )}
          <button onClick={onIlanEkle} className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">+ İlan Ver</button>
        </div>
      </div>

      {menuAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMenuAcik(false)} />
          <div className="w-72 bg-slate-100 h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
              <span className="text-white font-semibold text-sm">Hesabım</span>
              <button onClick={() => setMenuAcik(false)} className="p-1 text-slate-300 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-3 flex-1"><SidebarIcerik /></div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          <aside className="hidden lg:block w-52 flex-shrink-0"><SidebarIcerik /></aside>
          <main className="flex-1 min-w-0">

            {/* PROFİL */}
            {aktifSekme === 'profil' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-base mb-5">Profil Bilgilerim</h2>
                {basari && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{basari}</div>}
                {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{hata}</div>}
                <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
                  <ProfilResmiWidget userId={userId} mevcutUrl={avatarUrl} onGuncelle={url => setAvatarUrl(url)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Ad Soyad</label><input className={ic} value={profil.ad} onChange={e => setProfil({ ...profil, ad: e.target.value })} placeholder="Ad Soyadınız" /></div>
                  <div><label className="text-xs font-semibold text-slate-500 mb-1 block">GSM Numaranız</label><input className={ic + ' bg-slate-50 text-slate-400 cursor-not-allowed'} value={profil.telefon} disabled /></div>
                </div>
                <div className="mb-3"><label className="text-xs font-semibold text-slate-500 mb-1 block">Adres</label><textarea className={ic + ' resize-none'} value={profil.adres} onChange={e => setProfil({ ...profil, adres: e.target.value })} placeholder="Adresiniz" rows={3} /></div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className="text-xs font-semibold text-slate-500 mb-1 block">İl</label>
                    <select className={ic} value={profil.il} onChange={e => setProfil({ ...profil, il: e.target.value, ilce: '' })}>
                      <option value="">Seçiniz</option>{iller.map(il => <option key={il} value={il}>{il}</option>)}
                    </select></div>
                  <div><label className="text-xs font-semibold text-slate-500 mb-1 block">İlçe</label>
                    <select className={ic} value={profil.ilce} disabled={!profil.il} onChange={e => setProfil({ ...profil, ilce: e.target.value })}>
                      <option value="">Seçiniz</option>{ilceleri.map(ilce => <option key={ilce} value={ilce}>{ilce}</option>)}
                    </select></div>
                </div>
                <div className="mb-5"><label className="text-xs font-semibold text-slate-500 mb-1 block">Yeni Şifre</label><input type="password" className={ic} value={profil.yeniSifre} onChange={e => setProfil({ ...profil, yeniSifre: e.target.value })} placeholder="Değiştirmek istemiyorsanız boş bırakın" /></div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button onClick={handleHesapSil} className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition text-center">Hesabı Kapat</button>
                  <button onClick={handleProfilGuncelle} className={btnO}>Bilgileri Güncelle</button>
                </div>
              </div>
            )}

            {/* İLANLARIM */}
            {aktifSekme === 'ilanlar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">İlanlarım</h2>
                  <button onClick={onIlanEkle} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5"><Plus size={13} /> Yeni İlan</button>
                </div>
                {basari && <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{basari}</div>}
                {yukleniyor ? (
                  <div className="p-4 flex flex-col gap-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
                ) : ilanlar.length === 0 ? (
                  <div className="text-center py-16 text-slate-400"><p className="text-sm font-medium mb-3">Henüz ilanınız yok</p><button onClick={onIlanEkle} className={btnO}>İlan Ver</button></div>
                ) : (
                  <>
                    <div className="sm:hidden divide-y divide-slate-100">
                      {ilanlar.map(ilan => (
                        <div key={ilan.id} className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-slate-700 font-medium text-sm line-clamp-2 flex-1">{ilan.aciklama}</p>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => onIlanDetay(ilan)} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 rounded-lg"><Eye size={14} /></button>
                              <button onClick={() => setDuzenleIlan(ilan)} className="p-2 text-slate-400 hover:text-orange-500 bg-slate-50 rounded-lg"><Pencil size={14} /></button>
                              <button onClick={() => handleIlanSil(ilan.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{ilan.kategori.replace(/_/g, ' ')}</span>
                            <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>{ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}</span>
                            <span className="text-xs text-slate-400">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 border-b border-slate-200">{['İlan', 'Kategori', 'Tarih', 'Durum', 'İşlem'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
                        <tbody>
                          {ilanlar.map(ilan => (
                            <tr key={ilan.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                              <td className="px-4 py-3"><p className="text-slate-700 font-medium text-sm line-clamp-1 max-w-xs">{ilan.aciklama}</p></td>
                              <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">{ilan.kategori.replace(/_/g, ' ')}</span></td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                              <td className="px-4 py-3"><span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>{ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}</span></td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => onIlanDetay(ilan)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye size={14} /></button>
                                  <button onClick={() => setDuzenleIlan(ilan)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"><Pencil size={14} /></button>
                                  <button onClick={() => handleIlanSil(ilan.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ARAÇLARIM */}
            {aktifSekme === 'araclar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Araçlarım</h2>
                  <button onClick={() => setAracFormAcik(!aracFormAcik)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5"><Plus size={13} /> Araç Ekle</button>
                </div>
                {basari && <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{basari}</div>}
                {hata && <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{hata}</div>}
                {aracFormAcik && (
                  <div className="mx-4 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Yeni Araç Ekle</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
  {/* Marka */}
  <div>
    <label className="text-xs text-slate-500 mb-1 block">Marka</label>
    <select className={ic} value={aracForm.marka}
      onChange={e => setAracForm({ ...aracForm, marka: e.target.value, model: '' })}>
      <option value="">Seçin</option>
      {markalar.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  </div>

  {/* Model */}
  <div>
    <label className="text-xs text-slate-500 mb-1 block">Model</label>
    <select className={ic} value={aracForm.model} disabled={!aracForm.marka}
      onChange={e => setAracForm({ ...aracForm, model: e.target.value })}>
      <option value="">Seçin</option>
      {(MARKA_MODELLER[aracForm.marka] || []).map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  </div>

  {/* Yıl */}
  <div>
    <label className="text-xs text-slate-500 mb-1 block">Yıl</label>
    <input className={ic} value={aracForm.yil} placeholder="2020"
      onChange={e => setAracForm({ ...aracForm, yil: e.target.value })} />
  </div>

  {/* Plaka */}
  <div>
    <label className="text-xs text-slate-500 mb-1 block">Plaka</label>
    <input className={ic} value={aracForm.plaka} placeholder="34 ABC 123"
      onChange={e => setAracForm({ ...aracForm, plaka: e.target.value })} />
  </div>

  {/* Koltuk Sayısı */}
  <div>
    <label className="text-xs text-slate-500 mb-1 block">Koltuk Sayısı</label>
    <input className={ic} value={aracForm.koltuk_sayisi} placeholder="16+1"
      onChange={e => setAracForm({ ...aracForm, koltuk_sayisi: e.target.value })} />
  </div>

  {/* Araç Tipi */}
  <div>
    <label className="text-xs text-slate-500 mb-1 block">Araç Tipi</label>
    <select className={ic} value={aracForm.arac_tipi}
      onChange={e => setAracForm({ ...aracForm, arac_tipi: e.target.value })}>
      <option value="">Seçin</option>
      {aracTipleri.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  </div>
</div>
                    <div className="flex gap-2">
                      <button onClick={() => setAracFormAcik(false)} className={btnS + ' flex-1'}>İptal</button>
                      <button onClick={handleAracEkle} className={btnO + ' flex-1'}>Kaydet</button>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">{[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                  ) : araclar.length === 0 ? (
                    <div className="text-center py-12 text-slate-400"><Car size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">Henüz araç eklemediniz</p></div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {araclar.map(arac => (
                        <div key={arac.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0"><Car size={18} className="text-slate-500" /></div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700 text-sm">{arac.marka} {arac.model} {arac.yil}</p>
                              <p className="text-xs text-slate-400 truncate">{arac.plaka} · {arac.koltuk_sayisi} koltuk · {arac.arac_tipi}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <button onClick={() => setDuzenleArac(arac)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition"><Pencil size={14} /></button>
                            <button onClick={() => handleAracSil(arac.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MESAJLAR */}
            {aktifSekme === 'mesajlar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">İlan Mesajları</h2>
                  {okunmamisSayi > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{okunmamisSayi} okunmamış</span>}
                </div>
                <div className="p-4 sm:p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">{[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                  ) : mesajlar.length === 0 ? (
                    <div className="text-center py-12 text-slate-400"><MessageSquare size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">Henüz mesajınız yok</p></div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {mesajlar.map(mesaj => (
                        <div key={mesaj.id} onClick={() => !mesaj.okundu && handleMesajOku(mesaj.id)}
                          className={'border rounded-xl p-4 cursor-pointer transition ' + (mesaj.okundu ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50 active:bg-orange-100')}>
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700 text-sm">{mesaj.gonderen?.full_name || mesaj.gonderen?.phone_number}</p>
                              <p className="text-xs text-slate-400 truncate">{mesaj.ilanlar?.aciklama}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!mesaj.okundu && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
                              <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(mesaj.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{mesaj.mesaj}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FAVORİLER */}
            {aktifSekme === 'favoriler' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-slate-100"><h2 className="font-bold text-slate-800 text-base">Favori İlanlarım</h2></div>
                <div className="p-4 sm:p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">{[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                  ) : favoriler.length === 0 ? (
                    <div className="text-center py-12 text-slate-400"><Heart size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">Henüz favori ilanınız yok</p></div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {favoriler.map(fav => (
                        <div key={fav.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-orange-200 transition">
  <div className="p-4 flex items-center justify-between">
    <div className="min-w-0">
      <p className="font-semibold text-slate-700 text-sm line-clamp-1">{fav.ilanlar?.aciklama}</p>
      <p className="text-xs text-slate-400 mt-0.5">{fav.ilanlar?.ilan_veren} · {fav.ilanlar?.kategori?.replace(/_/g, ' ')}</p>
      {notlar[fav.ilan_id] && notDuzenle !== fav.ilan_id && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-2 line-clamp-2">
          📝 {notlar[fav.ilan_id]}
        </p>
      )}
    </div>
    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
      <button
        onClick={() => { setNotDuzenle(notDuzenle === fav.ilan_id ? null : fav.ilan_id); setNotMetin(notlar[fav.ilan_id] || ''); }}
        className={`p-2 rounded-xl transition ${notlar[fav.ilan_id] ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
        title="Not ekle"
      >
        <Pencil size={14} />
      </button>
      <button onClick={() => onIlanDetay(fav.ilanlar)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition"><Eye size={14} /></button>
      <button onClick={() => handleFavoriKaldir(fav.ilan_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"><Heart size={14} /></button>
    </div>
  </div>
  {notDuzenle === fav.ilan_id && (
    <div className="px-4 pb-4 border-t border-slate-100 pt-3 bg-amber-50/50">
      <p className="text-xs font-semibold text-slate-500 mb-2">📝 Kişisel Not (Sadece sen görebilirsin)</p>
      <textarea
        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none"
        rows={3}
        placeholder="Bu ilan hakkında notunuzu yazın..."
        value={notMetin}
        onChange={e => setNotMetin(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => setNotDuzenle(null)} className="flex-1 text-xs text-slate-500 border border-slate-200 py-1.5 rounded-lg hover:bg-slate-100 transition">İptal</button>
        {notlar[fav.ilan_id] && (
          <button onClick={() => handleNotSil(fav.ilan_id)} className="text-xs text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Sil</button>
        )}
        <button onClick={() => handleNotKaydet(fav.ilan_id)} className="flex-1 text-xs bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded-lg font-semibold transition">Kaydet</button>
      </div>
    </div>
  )}
</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DESTEK */}
            {aktifSekme === 'destek' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-base mb-4">Destek</h2>
                {destekGonderildi ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-green-600 text-xl font-bold">✓</span></div>
                    <p className="font-semibold text-green-700 mb-1">Talebiniz Alındı</p>
                    <p className="text-green-600 text-sm mb-4">En kısa sürede size döneceğiz.</p>
                    <button onClick={() => setDestekGonderildi(false)} className={btnO}>Yeni Talep Gönder</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{hata}</div>}
                    <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Konu</label><input className={ic} value={destekForm.konu} placeholder="Destek konusu" onChange={e => setDestekForm({ ...destekForm, konu: e.target.value })} /></div>
                    <div><label className="text-xs font-semibold text-slate-500 mb-1 block">Mesaj</label><textarea className={ic + ' resize-none'} value={destekForm.mesaj} placeholder="Mesajınızı yazın..." rows={5} onChange={e => setDestekForm({ ...destekForm, mesaj: e.target.value })} /></div>
                    <button onClick={handleDestekGonder} className={btnO}>Gönder</button>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* İLAN DÜZENLEME MODALI */}
      {duzenleIlan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-orange-500 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <Pencil size={16} className="text-white" />
                <div>
                  <h3 className="font-bold text-white text-sm">İlanı Düzenle</h3>
                  <p className="text-white/70 text-xs capitalize">{duzenleIlan.kategori.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button onClick={() => setDuzenleIlan(null)} className="text-white/80 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {duzenleYukleniyor ? (
                <div className="flex items-center justify-center py-20">
                  <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <DuzenleIcerik
                  ilan={duzenleIlan}
                  onKaydet={handleDuzenleKaydet}
                  onKapat={() => setDuzenleIlan(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARAÇ DÜZENLEME MODALI */}
      {duzenleArac && (
        <AracDuzenleModal
          arac={duzenleArac}
          onKaydet={handleAracGuncelle}
          onKapat={() => setDuzenleArac(null)}
        />
      )}
    </div>
  );
}
