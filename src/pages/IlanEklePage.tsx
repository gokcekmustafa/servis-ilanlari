import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, X, ImagePlus, Upload } from 'lucide-react';
import { KategoriType } from '../types';
import { ilanEkle } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';
import { ilceler } from '../data/ilceler';
import { mahalleler } from '../data/mahalleler';
import { supabase } from '../lib/supabase';

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
  'MAN': ['Lion\'s City', 'Lion\'s Coach', 'TGE'],
  'Scania': ['Touring', 'Interlink', 'OmniCity'],
  'Volvo': ['9700', '9900', 'B8R'],
  'Karsan': ['Jest', 'Atak', 'e-ATAK'],
  'Neoplan': ['Cityliner', 'Tourliner', 'Skyliner'],
  'Opel': ['Movano', 'Vivaro', 'Combo'],
};
const kategoriler = [
  { id: 'isim_var_arac' as KategoriType, label: 'Isim Var Arac Ariyorum', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { id: 'aracim_var_is' as KategoriType, label: 'Aracim Var Is Ariyorum', color: 'border-green-400 bg-green-50 text-green-700' },
  { id: 'sofor_ariyorum' as KategoriType, label: 'Sofor Ariyorum', color: 'border-orange-400 bg-orange-50 text-orange-700' },
  { id: 'hostes_ariyorum' as KategoriType, label: 'Hostes Ariyorum', color: 'border-purple-400 bg-purple-50 text-purple-700' },
  { id: 'hostesim_is' as KategoriType, label: 'Hostesim Is Ariyorum', color: 'border-pink-400 bg-pink-50 text-pink-700' },
  { id: 'soforum_is' as KategoriType, label: 'Soforum Is Ariyorum', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { id: 'plaka_satiyorum' as KategoriType, label: 'Plakami Satiyorum', color: 'border-red-400 bg-red-50 text-red-700' },
  { id: 'aracimi_satiyorum' as KategoriType, label: 'Aracimi Satiyorum', color: 'border-teal-400 bg-teal-50 text-teal-700' },
];

const kategoriRenk: Record<string, string> = {
  isim_var_arac: 'bg-blue-600',
  aracim_var_is: 'bg-green-600',
  sofor_ariyorum: 'bg-orange-500',
  hostes_ariyorum: 'bg-purple-600',
  hostesim_is: 'bg-pink-600',
  soforum_is: 'bg-yellow-600',
  plaka_satiyorum: 'bg-red-600',
  aracimi_satiyorum: 'bg-teal-600',
};

const tumIller = Object.keys(ilceler).sort();
const MAX_RESIM = 12;

interface Guzergah {
  giris_saati: string;
  kalkis_il: string;
  kalkis_ilce: string;
  kalkis_mah: string;
  varis_il: string;
  varis_ilce: string;
  varis_mah: string;
  cikis_saati: string;
  baslangic_saati: string;
  bitis_saati: string;
}

interface IlanResmi {
  file: File;
  url: string;
}

const bosGuzergah = (): Guzergah => ({
  giris_saati: '', kalkis_il: '', kalkis_ilce: '', kalkis_mah: '',
  varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '',
  baslangic_saati: '', bitis_saati: '',
});

const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
const lb = 'text-xs font-medium text-slate-500 mb-1 block';

// ─── Resim Yükleme Bileşeni ───────────────────────────────────────────────────
function ResimYukleme({ resimler, onEkle, onSil, onDegistir }: {
  resimler: IlanResmi[];
  onEkle: (files: File[]) => void;
  onSil: (index: number) => void;
  onDegistir: (index: number, file: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const degistirRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const kalan = MAX_RESIM - resimler.length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) onEkle(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onEkle(files);
    e.target.value = '';
  };

  const handleDegistirInput = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onDegistir(index, file);
    e.target.value = '';
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-700">Fotograf Ekle</h3>
          <p className="text-xs text-slate-400 mt-0.5">En fazla {MAX_RESIM} fotograf · JPEG, PNG, WEBP</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${resimler.length >= MAX_RESIM ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
          {resimler.length}/{MAX_RESIM}
        </span>
      </div>

      {/* Sürükle-bırak alanı */}
      {kalan > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition mb-3 ${
            dragOver ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-300 hover:bg-slate-50'
          }`}
        >
          <Upload size={22} className={dragOver ? 'text-orange-400' : 'text-slate-300'} />
          <p className="text-sm font-medium text-slate-500 text-center">
            {dragOver ? 'Fotograflari birak!' : 'Fotograflari buraya surukleys veya tikla'}
          </p>
          <p className="text-xs text-slate-400 text-center">{kalan} slot kaldi · Birden fazla secebilirsiniz</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
            multiple onChange={handleFileInput} className="hidden" />
        </div>
      )}

      {/* Resim grid */}
      {resimler.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {resimler.map((resim, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
              <img src={resim.url} alt={`Fotograf ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); degistirRefs.current[i]?.click(); }}
                  className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-lg transition" title="Degistir">
                  <ImagePlus size={14} />
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onSil(i); }}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition" title="Sil">
                  <X size={14} />
                </button>
              </div>
              <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{i + 1}</div>
              {i === 0 && (
                <div className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Ana</div>
              )}
              <input ref={(el) => { degistirRefs.current[i] = el; }}
                type="file" accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => handleDegistirInput(i, e)} className="hidden" />
            </div>
          ))}
          {kalan > 0 && (
            <div onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50 flex flex-col items-center justify-center cursor-pointer transition group">
              <Plus size={18} className="text-slate-300 group-hover:text-orange-400 transition" />
              <span className="text-[10px] text-slate-400 group-hover:text-orange-500 font-medium mt-1 transition">Ekle</span>
            </div>
          )}
        </div>
      )}
      {resimler.length === 0 && <p className="text-xs text-slate-400 text-center mt-1">Henuz fotograf eklenmedi</p>}
    </div>
  );
}

// ─── Saat Seçici ──────────────────────────────────────────────────────────────
function SaatSecici({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [saat, setSaat] = React.useState(() => value ? value.split(':')[0] : '');
  const [dakika, setDakika] = React.useState(() => value ? value.split(':')[1] : '');
  const saatler = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const dakikalar = ['00','05','10','15','20','25','30','35','40','45','50','55'];

  const handleSaatChange = (s: string) => { setSaat(s); if (s && dakika) onChange(`${s}:${dakika}`); else if (!s) onChange(''); };
  const handleDakikaChange = (d: string) => { setDakika(d); if (saat && d) onChange(`${saat}:${d}`); };

  React.useEffect(() => {
    if (value) { const parts = value.split(':'); setSaat(parts[0] || ''); setDakika(parts[1] || ''); }
    else { setSaat(''); setDakika(''); }
  }, [value]);

  return (
    <div className="inline-flex flex-col">
      <label className={lb}>{label}</label>
      <div className="inline-flex items-center gap-0.5">
        <select value={saat} onChange={(e) => handleSaatChange(e.target.value)}
          className="w-14 border border-slate-200 rounded-l-lg px-1 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-center font-semibold appearance-none">
          <option value="">--</option>{saatler.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="bg-slate-100 border-y border-slate-200 px-1 py-2 text-slate-500 font-bold text-sm select-none">:</span>
        <select value={dakika} onChange={(e) => handleDakikaChange(e.target.value)} disabled={!saat}
          className="w-14 border border-slate-200 rounded-r-lg px-1 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-center font-semibold appearance-none disabled:bg-slate-50 disabled:text-slate-300">
          <option value="">--</option>{dakikalar.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {saat && dakika && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span className="text-[11px] text-orange-500 font-semibold">{saat}:{dakika}</span>
        </div>
      )}
    </div>
  );
}

// ─── İl/İlçe/Mahalle ─────────────────────────────────────────────────────────
function IlIlceMahalle({ il, ilce, mah, onIlChange, onIlceChange, onMahChange }: {
  il: string; ilce: string; mah: string;
  onIlChange: (v: string) => void; onIlceChange: (v: string) => void; onMahChange: (v: string) => void;
}) {
  const ilceleri = il ? (ilceler[il] || []) : [];
  const mahalleleri = il === 'Istanbul' && ilce ? (mahalleler[ilce] || []) : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div><label className={lb}>Sehir</label>
        <select value={il} onChange={(e) => onIlChange(e.target.value)} className={ic}>
          <option value="">Il Sec</option>{tumIller.map((i) => <option key={i} value={i}>{i}</option>)}
        </select></div>
      <div><label className={lb}>Ilce</label>
        <select value={ilce} onChange={(e) => onIlceChange(e.target.value)} disabled={!il} className={ic + ' disabled:bg-slate-50'}>
          <option value="">Ilce Sec</option>{ilceleri.map((i) => <option key={i} value={i}>{i}</option>)}
        </select></div>
      <div><label className={lb}>Mahalle</label>
        {il === 'Istanbul' ? (
          <select value={mah} onChange={(e) => onMahChange(e.target.value)} disabled={!ilce} className={ic + ' disabled:bg-slate-50'}>
            <option value="">Mahalle Sec</option>{mahalleleri.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input value={mah} onChange={(e) => onMahChange(e.target.value)} placeholder="Mahalle" className={ic} />
        )}
      </div>
    </div>
  );
}

// ─── Güzergah Satırı ──────────────────────────────────────────────────────────
function GuzergahSatiri({ guzergah, index, onGuncelle, onRemove, showRemove }: {
  guzergah: Guzergah; index: number;
  onGuncelle: (index: number, yeniGuzergah: Guzergah) => void;
  onRemove: (index: number) => void; showRemove: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 mb-3 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-600">Guzergah {index + 1}</span>
        {showRemove && <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
  <div className="flex flex-col gap-3">
    <SaatSecici label="Giriş Saati" value={guzergah.giris_saati} onChange={(v) => onGuncelle(index, { ...guzergah, giris_saati: v })} />
    <SaatSecici label="Başlangıç Saati" value={guzergah.baslangic_saati} onChange={(v) => onGuncelle(index, { ...guzergah, baslangic_saati: v })} />
  </div>
  <div className="flex flex-col gap-3">
    <SaatSecici label="Çıkış Saati" value={guzergah.cikis_saati} onChange={(v) => onGuncelle(index, { ...guzergah, cikis_saati: v })} />
    <SaatSecici label="Bitiş Saati" value={guzergah.bitis_saati} onChange={(v) => onGuncelle(index, { ...guzergah, bitis_saati: v })} />
  </div>
</div>
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Kalkis</p>
        <IlIlceMahalle il={guzergah.kalkis_il} ilce={guzergah.kalkis_ilce} mah={guzergah.kalkis_mah}
          onIlChange={(v) => onGuncelle(index, { ...guzergah, kalkis_il: v, kalkis_ilce: '', kalkis_mah: '' })}
          onIlceChange={(v) => onGuncelle(index, { ...guzergah, kalkis_ilce: v, kalkis_mah: '' })}
          onMahChange={(v) => onGuncelle(index, { ...guzergah, kalkis_mah: v })} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Varis</p>
        <IlIlceMahalle il={guzergah.varis_il} ilce={guzergah.varis_ilce} mah={guzergah.varis_mah}
          onIlChange={(v) => onGuncelle(index, { ...guzergah, varis_il: v, varis_ilce: '', varis_mah: '' })}
          onIlceChange={(v) => onGuncelle(index, { ...guzergah, varis_ilce: v, varis_mah: '' })}
          onMahChange={(v) => onGuncelle(index, { ...guzergah, varis_mah: v })} />
      </div>
    </div>
  );
}

// ─── Konum Bilgisi ────────────────────────────────────────────────────────────
function KonumBilgisi({ il, ilce, mah, giris, cikis, onIlChange, onIlceChange, onMahChange, onGirisChange, onCikisChange }: {
  il: string; ilce: string; mah: string; giris: string; cikis: string;
  onIlChange: (v: string) => void; onIlceChange: (v: string) => void; onMahChange: (v: string) => void;
  onGirisChange: (v: string) => void; onCikisChange: (v: string) => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 md:p-5 bg-white">
      <h3 className="font-semibold text-slate-700 mb-1">Konum Bilgisi</h3>
      <p className="text-xs text-orange-500 mb-4 font-medium">LUTFEN ASAGIDA BOS OLDUGUNUZ YERLERI VE SAATLERI EKLEYINIZ</p>
      <IlIlceMahalle il={il} ilce={ilce} mah={mah} onIlChange={onIlChange} onIlceChange={onIlceChange} onMahChange={onMahChange} />
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
type IlanEklePageProps = { onGoBack: () => void; onSuccess: () => void; userId: string; };

export default function IlanEklePage({ onGoBack, onSuccess, userId }: IlanEklePageProps) {
  const [adim, setAdim] = useState<number>(() => {
    const savedUserId = sessionStorage.getItem('ilan-ekle-userId');
    if (savedUserId !== userId) { sessionStorage.removeItem('ilan-ekle-adim'); sessionStorage.removeItem('ilan-ekle-kategori'); sessionStorage.removeItem('ilan-ekle-userId'); return 1; }
    const saved = sessionStorage.getItem('ilan-ekle-adim');
    return saved ? parseInt(saved) : 1;
  });
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(() => {
    const savedUserId = sessionStorage.getItem('ilan-ekle-userId');
    if (savedUserId !== userId) return null;
    return sessionStorage.getItem('ilan-ekle-kategori') as KategoriType | null;
  });

  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [guzergahlar, setGuzergahlar] = useState<Guzergah[]>([bosGuzergah()]);
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [konumIl, setKonumIl] = useState('');
  const [konumIlce, setKonumIlce] = useState('');
  const [konumMah, setKonumMah] = useState('');
  const [konumGiris, setKonumGiris] = useState('');
  const [konumCikis, setKonumCikis] = useState('');
  const [profilResim, setProfilResim] = useState<File | null>(null);
  const [profilResimUrl, setProfilResimUrl] = useState('');
  const [kullaniciaraclari, setKullaniciaraclari] = useState<any[]>([]);
  const [ilanResimleri, setIlanResimleri] = useState<IlanResmi[]>([]);

  const handleResimEkle = useCallback((files: File[]) => {
    setIlanResimleri(prev => {
      const kalan = MAX_RESIM - prev.length;
      return [...prev, ...files.slice(0, kalan).map(f => ({ file: f, url: URL.createObjectURL(f) }))];
    });
  }, []);
  const handleResimSil = useCallback((i: number) => setIlanResimleri(prev => prev.filter((_, idx) => idx !== i)), []);
  const handleResimDegistir = useCallback((i: number, file: File) => {
    setIlanResimleri(prev => prev.map((r, idx) => idx === i ? { file, url: URL.createObjectURL(file) } : r));
  }, []);

  const [yeniAracForm, setYeniAracForm] = useState({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
  const [yeniAracEkleniyor, setYeniAracEkleniyor] = useState(false);
  const [aracFormAcik, setAracFormAcik] = useState(false);

  const [isimVarArac, setIsimVarArac] = useState({ arac_markasi: '', model: '', arac_yili: '', arac_kapasitesi: '', ucret: '', km: '', calisılacak_gun: '', servis_suresi: '', aracki_yolcu_sayisi: '', servis_turu: [] as string[] });
  const [aracimVarIs, setAracimVarIs] = useState({ secilen_arac: '', calisma_yerleri: '' });
  const [soforAriyorum, setSoforAriyorum] = useState({ odeme_sekli: 'aylik', ucret: '', aranan_tecrube: '', ortalama_servis_suresi: '', yolcu_sayisi: '', km: '', calisılacak_gun: '', yabanci_diller: [] as string[] });
  const [hostesAriyorum, setHostesAriyorum] = useState({ ucret: '', calisılacak_okul: '', aranan_tecrube: '', okul_turu: 'Anaokulu Kres', yabanci_diller: [] as string[] });
  const [hostesimIs, setHostesimIs] = useState({ dogum_tarihi: '', dogum_yeri: '', egitim_durumu: '', yabanci_diller: [] as string[], servis_tasimacilik_deneyimi: 'var' });
  const [soforumIs, setSoforumIs] = useState({ surucubelgesi: '', ehliyet_alinma_tarihi: '', sinav_belgeleri: '', dogum_tarihi: '', dogum_yeri: '', arac_turu: [] as string[], belgeler: [] as string[], yabanci_diller: [] as string[], emekli: 'hayir', mesleki_yeterlilik: 'var', sabika_kaydi: 'var', tam_zamanlimi: 'hayir', servis_tasimacilik_deneyimi: 'var', baska_ise_gider_misiniz: 'hayir' });
  const [plakaSatiyorum, setPlakaSatiyorum] = useState({ plaka_il: '', plaka_harf: '', plaka_no: '', ucret: '', aracla_birlikte: false, yol_belgesi_var: false, noter_satisi: false, hisseli: false });
  const [aracimiSatiyorum, setAracimiSatiyorum] = useState({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '', km: '', ucret: '', hasar_kaydi: 'yok', noter_satisi: false, aracla_birlikte_plaka: false });

  React.useEffect(() => {
    if (selectedKategori === 'aracim_var_is') {
      supabase.from('araclar').select('*').eq('user_id', userId).then(({ data }) => { if (data) setKullaniciaraclari(data); });
    }
  }, [selectedKategori]);

  const handleGuzergahGuncelle = (index: number, yeniGuzergah: Guzergah) => {
    const yeni = [...guzergahlar]; yeni[index] = yeniGuzergah; setGuzergahlar(yeni);
  };
  const toggleArray = (arr: string[], val: string) => arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  const handleProfilResimSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setProfilResim(file); setProfilResimUrl(URL.createObjectURL(file));
  };
  const setAdimVeKaydet = (yeniAdim: number) => {
    setAdim(yeniAdim); sessionStorage.setItem('ilan-ekle-adim', String(yeniAdim)); sessionStorage.setItem('ilan-ekle-userId', userId);
  };
  const handleAdim1 = () => { if (!selectedKategori) { setHata('Lutfen bir kategori secin.'); return; } setHata(''); setAdimVeKaydet(2); };
  const handleAdim2 = () => {
  if (!baslik) { setHata('İlan başlığı zorunludur.'); return; }
  if (!aciklama) { setHata('İlan detayı zorunludur.'); return; }
  setHata('');
  setAdimVeKaydet(3);
};
  const handleGeriDon = () => {
    if (adim > 1) { setAdimVeKaydet(adim - 1); }
    else { sessionStorage.removeItem('ilan-ekle-adim'); sessionStorage.removeItem('ilan-ekle-kategori'); onGoBack(); }
  };

  const handleYeniAracEkle = async () => {
    if (!yeniAracForm.marka || !yeniAracForm.model || !yeniAracForm.plaka) { setHata('Marka, model ve plaka zorunludur.'); return; }
    setYeniAracEkleniyor(true);
    const { data, error } = await supabase.from('araclar').insert([{ ...yeniAracForm, user_id: userId }]).select();
    setYeniAracEkleniyor(false);
    if (error) { setHata('Arac eklenirken hata olustu: ' + error.message); return; }
    if (data && data[0]) { setKullaniciaraclari([...kullaniciaraclari, data[0]]); setAracimVarIs({ ...aracimVarIs, secilen_arac: data[0].plaka }); }
    setYeniAracForm({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
    setAracFormAcik(false); setHata('');
  };

  const handleYayinla = async () => {
    if (!aciklama) { setHata('Ilan detayi zorunludur.'); return; }
    setYukleniyor(true);
    const user = mevcutKullanici();

    let resimUrl = '';
    if (profilResim) {
      const { data } = await supabase.storage.from('profil-resimleri').upload('ilan-' + Date.now(), profilResim);
      if (data) { const { data: u } = supabase.storage.from('profil-resimleri').getPublicUrl(data.path); resimUrl = u.publicUrl; }
    }

    const yuklenenResimUrller: string[] = [];
    for (const resim of ilanResimleri) {
      const dosyaAdi = `ilan-resim-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const { data } = await supabase.storage.from('profil-resimleri').upload(dosyaAdi, resim.file);
      if (data) { const { data: u } = supabase.storage.from('profil-resimleri').getPublicUrl(data.path); yuklenenResimUrller.push(u.publicUrl); }
    }

    const ilanGuzergahlar = ['hostesim_is','soforum_is','plaka_satiyorum','aracimi_satiyorum'].includes(selectedKategori!) ? [{
      giris_saati: '', kalkis_il: konumIl, kalkis_ilce: konumIlce, kalkis_mah: konumMah,
      varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '',
    }] : guzergahlar;

    let ekbilgiler: any = {};
    if (selectedKategori === 'isim_var_arac') ekbilgiler = isimVarArac;
    else if (selectedKategori === 'aracim_var_is') ekbilgiler = { ...aracimVarIs, resimler: yuklenenResimUrller };
    else if (selectedKategori === 'sofor_ariyorum') ekbilgiler = soforAriyorum;
    else if (selectedKategori === 'hostes_ariyorum') ekbilgiler = hostesAriyorum;
    else if (selectedKategori === 'hostesim_is') ekbilgiler = { ...hostesimIs, profil_resmi: resimUrl };
    else if (selectedKategori === 'soforum_is') ekbilgiler = { ...soforumIs, profil_resmi: resimUrl };
    else if (selectedKategori === 'plaka_satiyorum') ekbilgiler = plakaSatiyorum;
    else if (selectedKategori === 'aracimi_satiyorum') ekbilgiler = { ...aracimiSatiyorum, resimler: yuklenenResimUrller };

    const { error } = await ilanEkle({
  kategori: selectedKategori!,
  baslik,                         // ← EKLE
  servis_turu: isimVarArac.servis_turu,
  aciklama,
  ilan_veren: user?.full_name || user?.phone_number || '',
  user_id: user?.id || userId,
  guzergahlar: ilanGuzergahlar,
  ekbilgiler,
} as any);
    setYukleniyor(false);
    if (error) { setHata('Hata: ' + error.message); return; }
    sessionStorage.removeItem('ilan-ekle-adim'); sessionStorage.removeItem('ilan-ekle-kategori');
    onSuccess();
  };

  const selectedKategoriLabel = kategoriler.find((k) => k.id === selectedKategori)?.label;
  const resimliKategori = selectedKategori === 'aracimi_satiyorum' || selectedKategori === 'aracim_var_is' || selectedKategori === 'hostesim_is' || selectedKategori === 'soforum_is';

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={handleGeriDon} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition">
          <ArrowLeft size={15} />{adim > 1 ? 'Onceki Adim' : 'Geri Don'}
        </button>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base">Ucretsiz Ilan Ver</h2>
              <p className="text-slate-400 text-xs mt-0.5">{adim === 1 ? 'Kategori secin' : adim === 2 ? 'Ilan detaylarini girin' : 'Ilani kontrol edin'}</p>
            </div>
            <div className="flex items-center gap-2">
              {[1,2,3].map((s) => (
                <React.Fragment key={s}>
                  <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ' + (adim > s ? 'bg-green-500 text-white' : adim === s ? 'bg-orange-500 text-white' : 'bg-slate-600 text-slate-400')}>
                    {adim > s ? <Check size={12} /> : s}
                  </div>
                  {s < 3 && <div className={'w-6 h-0.5 rounded ' + (adim > s ? 'bg-green-400' : 'bg-slate-600')} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {selectedKategori && <div className={kategoriRenk[selectedKategori] + ' text-white px-4 py-2 rounded-lg mb-4 text-xs font-semibold'}>Secilen Kategori: {selectedKategoriLabel}</div>}
            {hata && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{hata}</div>}

            {/* ADIM 1 */}
            {adim === 1 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-4">Ilan kategorisini secin</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {kategoriler.map((kat) => (
                    <button key={kat.id} onClick={() => { setSelectedKategori(kat.id); sessionStorage.setItem('ilan-ekle-kategori', kat.id); }}
                      className={'border-2 rounded-xl p-4 text-sm font-semibold text-left transition ' + (selectedKategori === kat.id ? kat.color : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50')}>
                      {kat.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleAdim1} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  Devam Et <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ADIM 2 */}
            {adim === 2 && (
              <div className="flex flex-col gap-5">

                {/* İŞİM VAR ARAÇ */}
                {selectedKategori === 'isim_var_arac' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Arac Bilgileri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div><label className={lb}>Arac Markasi</label>
  <select value={isimVarArac.arac_markasi} onChange={(e) => setIsimVarArac({...isimVarArac, arac_markasi: e.target.value, model: ''})} className={ic}>
    <option value="">Secin</option>
    <option value="farketmez">Farketmez</option>
    {Object.keys(MARKA_MODELLER).map(m=><option key={m} value={m}>{m}</option>)}
  </select></div>
<div><label className={lb}>Model</label>
  <select value={isimVarArac.model} onChange={(e) => setIsimVarArac({...isimVarArac, model: e.target.value})} disabled={!isimVarArac.arac_markasi || isimVarArac.arac_markasi === 'farketmez'} className={ic + ' disabled:bg-slate-50 disabled:text-slate-400'}>
    <option value="">Secin</option>
    <option value="farketmez">Farketmez</option>
    {(MARKA_MODELLER[isimVarArac.arac_markasi] || []).map(m=><option key={m} value={m}>{m}</option>)}
  </select></div>
                      <div><label className={lb}>Arac Yili</label><select value={isimVarArac.arac_yili} onChange={(e) => setIsimVarArac({...isimVarArac,arac_yili:e.target.value})} className={ic}><option value="">Secin</option><option value="farketmez">Farketmez</option>{Array.from({length:20},(_,i)=>2025-i).map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                      <div><label className={lb}>Kapasite</label><select value={isimVarArac.arac_kapasitesi} onChange={(e) => setIsimVarArac({...isimVarArac,arac_kapasitesi:e.target.value})} className={ic}><option value="">Secin</option><option value="farketmez">Farketmez</option>{['4+1','8+1','14+1','16+1','27+1','36+1','45+1'].map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div><label className={lb}>Ucret (TL)</label><input type="number" value={isimVarArac.ucret} placeholder="500" onChange={(e)=>setIsimVarArac({...isimVarArac,ucret:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Km</label><input type="number" value={isimVarArac.km} placeholder="50" onChange={(e)=>setIsimVarArac({...isimVarArac,km:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Calisacak Gun</label><input type="number" value={isimVarArac.calisılacak_gun} placeholder="22" onChange={(e)=>setIsimVarArac({...isimVarArac,calisılacak_gun:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Servis Suresi (Dk)</label><input type="number" value={isimVarArac.servis_suresi} placeholder="60" onChange={(e)=>setIsimVarArac({...isimVarArac,servis_suresi:e.target.value})} className={ic}/></div>
                    </div>
                    <div className="mb-4"><label className={lb}>Yolcu Sayisi</label><input type="number" value={isimVarArac.aracki_yolcu_sayisi} placeholder="16" onChange={(e)=>setIsimVarArac({...isimVarArac,aracki_yolcu_sayisi:e.target.value})} className={ic+' max-w-xs'}/></div>
                    <div><label className={lb+' mb-2'}>Servis Turu</label><div className="flex flex-wrap gap-4">{['Okul','Personel','Hafif Minibus','Turizm','Diger'].map(t=><label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={isimVarArac.servis_turu.includes(t)} onChange={()=>setIsimVarArac({...isimVarArac,servis_turu:toggleArray(isimVarArac.servis_turu,t)})} className="accent-orange-500 w-4 h-4"/>{t}</label>)}</div></div>
                  </div>
                )}

                {/* ARACIM VAR İŞ */}
                {selectedKategori === 'aracim_var_is' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h3 className="font-semibold text-slate-700">Secilen Arac: <span className="text-orange-500">{aracimVarIs.secilen_arac||'Secilmedi'}</span></h3>
                      <button onClick={()=>setAracFormAcik(!aracFormAcik)} className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition"><Plus size={12}/>{aracFormAcik?'Iptal':'Yeni Arac Ekle'}</button>
                    </div>
                    {aracFormAcik && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-slate-600 mb-3">Yeni Arac Bilgileri</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                          <div><label className={lb}>Marka</label><select className={ic} value={yeniAracForm.marka} onChange={(e)=>setYeniAracForm({...yeniAracForm,marka:e.target.value})}><option value="">Secin</option>{['Mercedes','Fiat','Ford','Volkswagen','Renault','Peugeot','Citroen','Iveco','Temsa','Isuzu'].map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                          <div><label className={lb}>Model</label><input className={ic} value={yeniAracForm.model} placeholder="Sprinter, Ducato, Transit..." onChange={(e)=>setYeniAracForm({...yeniAracForm,model:e.target.value})}/></div>
                          <div><label className={lb}>Yil</label><input className={ic} value={yeniAracForm.yil} placeholder="2020" onChange={(e)=>setYeniAracForm({...yeniAracForm,yil:e.target.value})}/></div>
                          <div><label className={lb}>Plaka</label><input className={ic} value={yeniAracForm.plaka} placeholder="34 ABC 123" onChange={(e)=>setYeniAracForm({...yeniAracForm,plaka:e.target.value})}/></div>
                          <div><label className={lb}>Koltuk Sayisi</label><input className={ic} value={yeniAracForm.koltuk_sayisi} placeholder="16+1" onChange={(e)=>setYeniAracForm({...yeniAracForm,koltuk_sayisi:e.target.value})}/></div>
                          <div><label className={lb}>Arac Tipi</label><select className={ic} value={yeniAracForm.arac_tipi} onChange={(e)=>setYeniAracForm({...yeniAracForm,arac_tipi:e.target.value})}><option value="">Secin</option>{['Minibus 16+1','Midibus 27+1','Otobus 45+1','Sedan','Van'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        </div>
                        <button onClick={handleYeniAracEkle} disabled={yeniAracEkleniyor} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">{yeniAracEkleniyor?'Ekleniyor...':'Araci Ekle ve Sec'}</button>
                      </div>
                    )}
                    {kullaniciaraclari.length===0&&!aracFormAcik?(
                      <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <p className="text-sm font-medium mb-1">Henuz arac eklemediniz</p>
                        <p className="text-xs mb-3">Yukardaki butona tiklayarak arac ekleyebilirsiniz</p>
                        <button onClick={()=>setAracFormAcik(true)} className="bg-orange-500 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">Arac Ekle</button>
                      </div>
                    ):kullaniciaraclari.length>0?(
                      <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
                        <table className="w-full text-sm min-w-max">
                          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="px-3 py-2 text-left text-xs font-semibold text-slate-500"></th><th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">PLAKA</th><th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">MARKA MODEL</th><th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">KOLTUK</th><th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">TARIH</th></tr></thead>
                          <tbody>{kullaniciaraclari.map(arac=><tr key={arac.id} className={'border-b border-slate-50 hover:bg-slate-50 cursor-pointer '+(aracimVarIs.secilen_arac===arac.plaka?'bg-orange-50':'')} onClick={()=>setAracimVarIs({...aracimVarIs,secilen_arac:arac.plaka})}><td className="px-3 py-2"><input type="radio" checked={aracimVarIs.secilen_arac===arac.plaka} onChange={()=>setAracimVarIs({...aracimVarIs,secilen_arac:arac.plaka})} className="accent-orange-500"/></td><td className="px-3 py-2 font-medium text-slate-700">{arac.plaka}</td><td className="px-3 py-2 text-slate-600">{arac.yil} - {arac.marka} {arac.model}</td><td className="px-3 py-2 text-slate-600">{arac.koltuk_sayisi}</td><td className="px-3 py-2 text-slate-400 text-xs">{new Date(arac.created_at).toLocaleDateString('tr-TR')}</td></tr>)}</tbody>
                        </table>
                      </div>
                    ):null}
                    <div><label className={lb}>Calisma Yerleri / Istenen Guzergah</label><input value={aracimVarIs.calisma_yerleri} onChange={(e)=>setAracimVarIs({...aracimVarIs,calisma_yerleri:e.target.value})} placeholder="Ornek: Kadikoy, Uskudar, Besiktas" className={ic}/></div>
                  </div>
                )}

                {/* ŞOFÖR ARIYORUM */}
                {selectedKategori === 'sofor_ariyorum' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ilan Detaylari</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div><label className={lb}>Odeme Sekli</label><select value={soforAriyorum.odeme_sekli} onChange={(e)=>setSoforAriyorum({...soforAriyorum,odeme_sekli:e.target.value})} className={ic}><option value="aylik">Aylik</option><option value="haftalik">Haftalik</option><option value="gunluk">Gunluk</option></select></div>
                      <div><label className={lb}>Ucret (TL)</label><input type="number" value={soforAriyorum.ucret} onChange={(e)=>setSoforAriyorum({...soforAriyorum,ucret:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Aranan Tecrube</label><select value={soforAriyorum.aranan_tecrube} onChange={(e)=>setSoforAriyorum({...soforAriyorum,aranan_tecrube:e.target.value})} className={ic}><option value="">Farketmez</option><option value="1">1 Yil</option><option value="2">2 Yil</option><option value="3">3 Yil ve uzeri</option></select></div>
                      <div><label className={lb}>Ort. Servis Suresi (Dk)</label><input type="number" value={soforAriyorum.ortalama_servis_suresi} onChange={(e)=>setSoforAriyorum({...soforAriyorum,ortalama_servis_suresi:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Yolcu Sayisi</label><input type="number" value={soforAriyorum.yolcu_sayisi} onChange={(e)=>setSoforAriyorum({...soforAriyorum,yolcu_sayisi:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Km</label><input type="number" value={soforAriyorum.km} onChange={(e)=>setSoforAriyorum({...soforAriyorum,km:e.target.value})} className={ic}/></div>
                    </div>
                    <div className="mb-4"><label className={lb}>Calisacak Gun</label><input type="number" value={soforAriyorum.calisılacak_gun} onChange={(e)=>setSoforAriyorum({...soforAriyorum,calisılacak_gun:e.target.value})} className={ic+' max-w-xs'}/></div>
                    <div><label className={lb+' mb-2'}>Istenen Yabanci Diller</label><div className="flex flex-wrap gap-3">{['Ingilizce','Arapca','Almanca','Fransizca','Diger'].map(d=><label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={soforAriyorum.yabanci_diller.includes(d)} onChange={()=>setSoforAriyorum({...soforAriyorum,yabanci_diller:toggleArray(soforAriyorum.yabanci_diller,d)})} className="accent-orange-500 w-4 h-4"/>{d}</label>)}</div></div>
                  </div>
                )}

                {/* HOSTES ARIYORUM */}
                {selectedKategori === 'hostes_ariyorum' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ilan Detaylari</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div><label className={lb}>Ucret (TL)</label><input type="number" value={hostesAriyorum.ucret} onChange={(e)=>setHostesAriyorum({...hostesAriyorum,ucret:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Calisacak Okul</label><input value={hostesAriyorum.calisılacak_okul} onChange={(e)=>setHostesAriyorum({...hostesAriyorum,calisılacak_okul:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Aranan Tecrube</label><select value={hostesAriyorum.aranan_tecrube} onChange={(e)=>setHostesAriyorum({...hostesAriyorum,aranan_tecrube:e.target.value})} className={ic}><option value="">Farketmez</option><option value="1">1 Yil</option><option value="2">2 Yil</option><option value="3">3 Yil ve uzeri</option></select></div>
                    </div>
                    <div className="mb-4"><label className={lb+' mb-2'}>Okul Turu</label><div className="flex flex-wrap gap-4">{['Anaokulu Kres','Ilk Ogretim','Lise'].map(t=><label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="radio" checked={hostesAriyorum.okul_turu===t} onChange={()=>setHostesAriyorum({...hostesAriyorum,okul_turu:t})} className="accent-orange-500"/>{t}</label>)}</div></div>
                    <div><label className={lb+' mb-2'}>Yabanci Diller</label><div className="flex flex-wrap gap-3">{['Ingilizce','Arapca','Almanca','Fransizca','Diger'].map(d=><label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={hostesAriyorum.yabanci_diller.includes(d)} onChange={()=>setHostesAriyorum({...hostesAriyorum,yabanci_diller:toggleArray(hostesAriyorum.yabanci_diller,d)})} className="accent-orange-500 w-4 h-4"/>{d}</label>)}</div></div>
                  </div>
                )}

                {/* HOSTESİM İŞ */}
                {selectedKategori === 'hostesim_is' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ilan Detaylari</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div><label className={lb}>Dogum Tarihi</label><input type="date" value={hostesimIs.dogum_tarihi} onChange={(e)=>setHostesimIs({...hostesimIs,dogum_tarihi:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Dogum Yeri</label><input value={hostesimIs.dogum_yeri} onChange={(e)=>setHostesimIs({...hostesimIs,dogum_yeri:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Egitim Durumu</label><select value={hostesimIs.egitim_durumu} onChange={(e)=>setHostesimIs({...hostesimIs,egitim_durumu:e.target.value})} className={ic}><option value="">Seciniz</option><option value="ilkokul">Ilkokul</option><option value="ortaokul">Ortaokul</option><option value="lise">Lise</option><option value="universite">Universite</option></select></div>
                    </div>
                    <div className="mb-4"><label className={lb+' mb-2'}>Yabanci Diller</label><div className="flex flex-wrap gap-3">{['Ingilizce','Arapca','Almanca','Fransizca','Diger'].map(d=><label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={hostesimIs.yabanci_diller.includes(d)} onChange={()=>setHostesimIs({...hostesimIs,yabanci_diller:toggleArray(hostesimIs.yabanci_diller,d)})} className="accent-orange-500 w-4 h-4"/>{d}</label>)}</div></div>
                    <div><label className={lb+' mb-2'}>Servis Tasimacilik Deneyimi</label><div className="flex gap-4">{['var','yok'].map(v=><label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="radio" checked={hostesimIs.servis_tasimacilik_deneyimi===v} onChange={()=>setHostesimIs({...hostesimIs,servis_tasimacilik_deneyimi:v})} className="accent-orange-500"/>{v==='var'?'Var':'Yok'}</label>)}</div></div>
                  </div>
                )}

                {/* ŞOFÖRÜM İŞ */}
                {selectedKategori === 'soforum_is' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ehliyet ve Arac Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div><label className={lb}>Surucubelgesi</label><select value={soforumIs.surucubelgesi} onChange={(e)=>setSoforumIs({...soforumIs,surucubelgesi:e.target.value})} className={ic}><option value="">Secin</option>{['B','D','D1','D2','D+E'].map(b=><option key={b} value={b}>{b}</option>)}</select></div>
                      <div><label className={lb}>Ehliyet Tarihi</label><input type="date" value={soforumIs.ehliyet_alinma_tarihi} onChange={(e)=>setSoforumIs({...soforumIs,ehliyet_alinma_tarihi:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>SRC Belgeleri</label><input value={soforumIs.sinav_belgeleri} placeholder="SRC2, SRC3" onChange={(e)=>setSoforumIs({...soforumIs,sinav_belgeleri:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Dogum Tarihi</label><input type="date" value={soforumIs.dogum_tarihi} onChange={(e)=>setSoforumIs({...soforumIs,dogum_tarihi:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Dogum Yeri</label><input value={soforumIs.dogum_yeri} onChange={(e)=>setSoforumIs({...soforumIs,dogum_yeri:e.target.value})} className={ic}/></div>
                    </div>
                    <div className="mb-4"><label className={lb+' mb-2'}>Arac Turu</label><div className="flex flex-wrap gap-3">{['Minibus','Midibus','Otobus','Van','Otomobil'].map(t=><label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={soforumIs.arac_turu.includes(t)} onChange={()=>setSoforumIs({...soforumIs,arac_turu:toggleArray(soforumIs.arac_turu,t)})} className="accent-orange-500 w-4 h-4"/>{t}</label>)}</div></div>
                    <div className="mb-4">
                      <label className={lb+' mb-2'}>Belgeler</label>
                      <div className="flex flex-wrap gap-3 mb-3">{['Src','Src1','Src2','Src3','Diger','Tam Sofor Kart'].map(b=><label key={b} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={soforumIs.belgeler.includes(b)} onChange={()=>setSoforumIs({...soforumIs,belgeler:toggleArray(soforumIs.belgeler,b)})} className="accent-orange-500 w-4 h-4"/>{b}</label>)}</div>
                      <label className={lb+' mb-2'}>Yabanci Diller</label>
                      <div className="flex flex-wrap gap-3">{['Ingilizce','Arapca','Almanca','Fransizca','Diger'].map(d=><label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={soforumIs.yabanci_diller.includes(d)} onChange={()=>setSoforumIs({...soforumIs,yabanci_diller:toggleArray(soforumIs.yabanci_diller,d)})} className="accent-orange-500 w-4 h-4"/>{d}</label>)}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[{label:'Emekli misiniz?',key:'emekli'},{label:'Mesleki Yeterlilik?',key:'mesleki_yeterlilik'},{label:'Sabika kaydi?',key:'sabika_kaydi'},{label:'Tam zamanli?',key:'tam_zamanlimi'},{label:'Servis Deneyimi?',key:'servis_tasimacilik_deneyimi'},{label:'Baska ise gider?',key:'baska_ise_gider_misiniz'}].map(item=>(
                        <div key={item.key}><label className={lb+' mb-2'}>{item.label}</label>
                          <div className="flex gap-3">{['Evet','Hayir'].map(v=><label key={v} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer"><input type="radio" checked={(soforumIs as any)[item.key]===v.toLowerCase()} onChange={()=>setSoforumIs({...soforumIs,[item.key]:v.toLowerCase()})} className="accent-orange-500"/>{v}</label>)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PLAKA SATIYORUM */}
                {selectedKategori === 'plaka_satiyorum' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Arac Plakasi (Plakaniz Gizlenecektir)</h3>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <input value={plakaSatiyorum.plaka_il} placeholder="34" maxLength={2} onChange={(e)=>setPlakaSatiyorum({...plakaSatiyorum,plaka_il:e.target.value})} className="w-16 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                      <input value={plakaSatiyorum.plaka_harf} placeholder="LAL" maxLength={3} onChange={(e)=>setPlakaSatiyorum({...plakaSatiyorum,plaka_harf:e.target.value.toUpperCase()})} className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                      <input value={plakaSatiyorum.plaka_no} placeholder="454" maxLength={4} onChange={(e)=>setPlakaSatiyorum({...plakaSatiyorum,plaka_no:e.target.value})} className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                      <div className="flex items-center gap-2"><input type="number" value={plakaSatiyorum.ucret} placeholder="1.000.000" onChange={(e)=>setPlakaSatiyorum({...plakaSatiyorum,ucret:e.target.value})} className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/><span className="text-sm text-slate-500 font-medium">TL</span></div>
                    </div>
                    <div className="flex flex-wrap gap-4">{[{key:'aracla_birlikte',label:'Aracla Birlikte'},{key:'yol_belgesi_var',label:'Yol Belgesi Var'},{key:'noter_satisi',label:'Noter Satisi'},{key:'hisseli',label:'Hisseli'}].map(item=><label key={item.key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={(plakaSatiyorum as any)[item.key]} onChange={(e)=>setPlakaSatiyorum({...plakaSatiyorum,[item.key]:e.target.checked})} className="accent-orange-500 w-4 h-4"/>{item.label}</label>)}</div>
                  </div>
                )}

                {/* ARACIMI SATIYORUM */}
                {selectedKategori === 'aracimi_satiyorum' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Arac Bilgileri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div><label className={lb}>Marka</label><select value={aracimiSatiyorum.marka} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,marka:e.target.value})} className={ic}><option value="">Secin</option>{['Mercedes','Fiat','Ford','Volkswagen','Renault','Peugeot','Citroen','Iveco','Temsa','Isuzu'].map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                      <div><label className={lb}>Model</label><input value={aracimiSatiyorum.model} placeholder="Sprinter, Ducato, Transit..." onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,model:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Yil</label><select value={aracimiSatiyorum.yil} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,yil:e.target.value})} className={ic}><option value="">Secin</option>{Array.from({length:20},(_,i)=>2025-i).map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                      <div><label className={lb}>Plaka (Gizlenecektir)</label><input value={aracimiSatiyorum.plaka} placeholder="34 ABC 123" onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,plaka:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Koltuk Sayisi</label><select value={aracimiSatiyorum.koltuk_sayisi} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,koltuk_sayisi:e.target.value})} className={ic}><option value="">Secin</option>{['4+1','8+1','14+1','16+1','27+1','36+1','45+1'].map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                      <div><label className={lb}>Arac Tipi</label><select value={aracimiSatiyorum.arac_tipi} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,arac_tipi:e.target.value})} className={ic}><option value="">Secin</option>{['Minibus','Midibus','Otobus','Van','Sedan'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                      <div><label className={lb}>KM</label><input type="number" value={aracimiSatiyorum.km} placeholder="150000" onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,km:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Fiyat (TL)</label><input type="number" value={aracimiSatiyorum.ucret} placeholder="1200000" onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,ucret:e.target.value})} className={ic}/></div>
                      <div><label className={lb}>Hasar Kaydi</label><select value={aracimiSatiyorum.hasar_kaydi} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,hasar_kaydi:e.target.value})} className={ic}><option value="yok">Yok</option><option value="var">Var</option></select></div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={aracimiSatiyorum.noter_satisi} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,noter_satisi:e.target.checked})} className="accent-orange-500 w-4 h-4"/>Noter Satisi</label>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={aracimiSatiyorum.aracla_birlikte_plaka} onChange={(e)=>setAracimiSatiyorum({...aracimiSatiyorum,aracla_birlikte_plaka:e.target.checked})} className="accent-orange-500 w-4 h-4"/>Plakayla Birlikte</label>
                    </div>
                  </div>
                )}

                {/* ── FOTOĞRAF YÜKLEME ── */}
                {resimliKategori && (
                  <ResimYukleme resimler={ilanResimleri} onEkle={handleResimEkle} onSil={handleResimSil} onDegistir={handleResimDegistir} />
                )}

                {/* GÜZERGAH */}
                {selectedKategori!=='hostesim_is'&&selectedKategori!=='soforum_is'&&selectedKategori!=='aracimi_satiyorum'&&selectedKategori!=='plaka_satiyorum'&&selectedKategori!=='aracim_var_is'&&(
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div><h3 className="font-semibold text-slate-700">Guzergah Listesi</h3><p className="text-xs text-orange-500 mt-1 font-medium">LUTFEN GUZERGAHLARINIZIN BASLANGIC VE BITIS YERLERINI EKLEYINIZ</p></div>
                      <button onClick={()=>setGuzergahlar([...guzergahlar,bosGuzergah()])} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"><Plus size={12}/> Guzergah Ekle</button>
                    </div>
                    {guzergahlar.map((g,i)=><GuzergahSatiri key={i} guzergah={g} index={i} onGuncelle={handleGuzergahGuncelle} onRemove={(idx)=>setGuzergahlar(guzergahlar.filter((_,ii)=>ii!==idx))} showRemove={guzergahlar.length>1}/>)}
                  </div>
                )}

                {/* KONUM - saatli */}
                {(selectedKategori==='hostesim_is'||selectedKategori==='soforum_is')&&(
                  <KonumBilgisi il={konumIl} ilce={konumIlce} mah={konumMah} giris={konumGiris} cikis={konumCikis}
                    onIlChange={(v)=>{setKonumIl(v);setKonumIlce('');setKonumMah('');}} onIlceChange={(v)=>{setKonumIlce(v);setKonumMah('');}}
                    onMahChange={setKonumMah} onGirisChange={setKonumGiris} onCikisChange={setKonumCikis}/>
                )}

                {/* KONUM - saat yok */}
                {(selectedKategori==='plaka_satiyorum'||selectedKategori==='aracimi_satiyorum'||selectedKategori==='aracim_var_is')&&(
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-1">Konum Bilgisi</h3>
                    <p className="text-xs text-orange-500 mb-4 font-medium">Aracin bulundugu sehir, ilce ve mahalleyi secin</p>
                    <IlIlceMahalle il={konumIl} ilce={konumIlce} mah={konumMah}
                      onIlChange={(v)=>{setKonumIl(v);setKonumIlce('');setKonumMah('');}} onIlceChange={(v)=>{setKonumIlce(v);setKonumMah('');}} onMahChange={setKonumMah}/>
                  </div>
                )}

                {/* PROFİL RESMİ */}
                {(selectedKategori==='hostesim_is'||selectedKategori==='soforum_is')&&(
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Kisisel Bilgiler</h3>
                    <div className="flex flex-col items-start gap-3">
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                        {profilResimUrl?<img src={profilResimUrl} alt="Profil" className="w-full h-full object-cover"/>:<svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>}
                      </div>
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">Dosya Sec<input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleProfilResimSec} className="hidden"/></label>
                      {profilResim&&<p className="text-xs text-green-600">{profilResim.name}</p>}
                      <p className="text-xs text-slate-400">Maks 20MB, JPEG/PNG/GIF</p>
                    </div>
                  </div>
                )}

                {/* İLAN DETAYI */}
<div className="border border-slate-200 rounded-xl p-4 md:p-5">
  <h3 className="font-semibold text-slate-700 mb-3">İlan Bilgileri</h3>

  {/* BAŞLIK */}
  <div className="mb-3">
    <label className={lb}>İlan Başlığı <span className="text-red-400">*</span></label>
    <input
      value={baslik}
      onChange={(e) => setBaslik(e.target.value)}
      placeholder="Örnek: Kadıköy - Ataşehir Personel Servisi, 16+1 Araç Arıyorum"
      maxLength={100}
      className={ic}
    />
    <p className="text-[10px] text-slate-400 mt-1">{baslik.length}/100 karakter</p>
  </div>

  {/* AÇIKLAMA */}
  <label className={lb}>İlan Açıklaması</label>
  <textarea
    value={aciklama}
    onChange={(e) => setAciklama(e.target.value)}
    placeholder="İlan detaylarını yazın..."
    rows={5}
    className={ic + ' resize-none'}
  />
</div>
<div className="flex gap-3">
  <button onClick={() => setAdimVeKaydet(1)} className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"><ArrowLeft size={15} /> Geri</button>
  <button onClick={handleAdim2} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">Önizleme <ArrowRight size={15} /></button>
</div>
</div>
)}

            {/* ADIM 3 */}
            {adim === 3 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-4">Ilan Onizleme</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                  <div className="mb-3">
  <span className={kategoriRenk[selectedKategori!] + ' text-white text-xs font-bold px-3 py-1 rounded-full uppercase'}>
    {selectedKategoriLabel}
  </span>
  {baslik && (
    <p className="text-base font-bold text-slate-800 mt-3">{baslik}</p>
  )}
</div>
                  <p className="text-sm text-slate-600 mb-4">{aciklama}</p>
                  {ilanResimleri.length>0&&(
                    <div className="mb-4">
                      <p className="text-xs text-slate-400 font-medium mb-2">{ilanResimleri.length} fotograf eklenecek</p>
                      <div className="flex gap-2 flex-wrap">{ilanResimleri.map((r,i)=><img key={i} src={r.url} alt={`Fotograf ${i+1}`} className="w-16 h-16 object-cover rounded-lg border border-slate-200"/>)}</div>
                    </div>
                  )}
                  {guzergahlar.length>0&&guzergahlar[0].kalkis_il&&(
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs rounded-xl overflow-hidden min-w-max">
                        <thead><tr className="bg-slate-800 text-white"><th className="px-3 py-2 text-left font-medium">Giris</th><th className="px-3 py-2 text-left font-medium">Nereden</th><th className="px-3 py-2 text-left font-medium">Nereye</th><th className="px-3 py-2 text-left font-medium">Cikis</th></tr></thead>
                        <tbody>{guzergahlar.map((g,i)=><tr key={i} className={i%2===0?'bg-white':'bg-slate-50'}><td className="px-3 py-2 text-orange-600 font-bold">{g.giris_saati||'--:--'}</td><td className="px-3 py-2 text-slate-600">{g.kalkis_mah} {g.kalkis_ilce} / {g.kalkis_il}</td><td className="px-3 py-2 text-slate-600">{g.varis_mah} {g.varis_ilce} / {g.varis_il}</td><td className="px-3 py-2 text-orange-600 font-bold">{g.cikis_saati||'--:--'}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>setAdimVeKaydet(2)} className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"><ArrowLeft size={15}/> Duzenle</button>
                  <button onClick={handleYayinla} disabled={yukleniyor} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"><Check size={15}/>{yukleniyor?'Yayinlaniyor...':'Ilani Kaydet ve Yayinla'}</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
