import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { KategoriType } from '../types';
import { ilanEkle } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';
import { ilceler } from '../data/ilceler';
import { mahalleler } from '../data/mahalleler';
import { supabase } from '../lib/supabase';

const kategoriler = [
  { id: 'isim_var_arac' as KategoriType, label: 'Isim Var Arac Ariyorum', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { id: 'aracim_var_is' as KategoriType, label: 'Aracim Var Is Ariyorum', color: 'border-green-400 bg-green-50 text-green-700' },
  { id: 'sofor_ariyorum' as KategoriType, label: 'Sofor Ariyorum', color: 'border-orange-400 bg-orange-50 text-orange-700' },
  { id: 'hostes_ariyorum' as KategoriType, label: 'Hostes Ariyorum', color: 'border-purple-400 bg-purple-50 text-purple-700' },
  { id: 'hostesim_is' as KategoriType, label: 'Hostesim Is Ariyorum', color: 'border-pink-400 bg-pink-50 text-pink-700' },
  { id: 'soforum_is' as KategoriType, label: 'Soforum Is Ariyorum', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { id: 'plaka_satiyorum' as KategoriType, label: 'Plakami Satiyorum', color: 'border-red-400 bg-red-50 text-red-700' },
  { id: 'aracimi_satiyorum_satiyorum' as KategoriType, label: 'Aracimi Satiyorum', color: 'border-red-400 bg-red-50 text-red-700' },
];

const kategoriRenk: Record<string, string> = {
  isim_var_arac: 'bg-blue-600',
  aracim_var_is: 'bg-green-600',
  sofor_ariyorum: 'bg-orange-500',
  hostes_ariyorum: 'bg-purple-600',
  hostesim_is: 'bg-pink-600',
  soforum_is: 'bg-yellow-600',
  plaka_satiyorum: 'bg-red-600',
};

const tumIller = Object.keys(ilceler).sort();

interface Guzergah {
  giris_saati: string;
  kalkis_il: string;
  kalkis_ilce: string;
  kalkis_mah: string;
  varis_il: string;
  varis_ilce: string;
  varis_mah: string;
  cikis_saati: string;
}

const bosGuzergah = (): Guzergah => ({
  giris_saati: '', kalkis_il: '', kalkis_ilce: '', kalkis_mah: '',
  varis_il: '', varis_ilce: '', varis_mah: '', cikis_saati: '',
});

const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
const lb = 'text-xs font-medium text-slate-500 mb-1 block';

function IlIlceMahalle({ il, ilce, mah, onIlChange, onIlceChange, onMahChange }: {
  il: string; ilce: string; mah: string;
  onIlChange: (v: string) => void;
  onIlceChange: (v: string) => void;
  onMahChange: (v: string) => void;
}) {
  const ilceleri = il ? (ilceler[il] || []) : [];
  const mahalleleri = il === 'Istanbul' && ilce ? (mahalleler[ilce] || []) : [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className={lb}>Sehir</label>
        <select value={il} onChange={(e) => onIlChange(e.target.value)} className={ic}>
          <option value="">Il Sec</option>
          {tumIller.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className={lb}>Ilce</label>
        <select value={ilce} onChange={(e) => onIlceChange(e.target.value)} disabled={!il}
          className={ic + ' disabled:bg-slate-50'}>
          <option value="">Ilce Sec</option>
          {ilceleri.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className={lb}>Mahalle</label>
        {il === 'Istanbul' ? (
          <select value={mah} onChange={(e) => onMahChange(e.target.value)} disabled={!ilce}
            className={ic + ' disabled:bg-slate-50'}>
            <option value="">Mahalle Sec</option>
            {mahalleleri.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input value={mah} onChange={(e) => onMahChange(e.target.value)}
            placeholder="Mahalle" className={ic} />
        )}
      </div>
    </div>
  );
}

function GuzergahSatiri({ guzergah, index, onGuncelle, onRemove, showRemove }: {
  guzergah: Guzergah; index: number;
  onGuncelle: (index: number, yeniGuzergah: Guzergah) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 mb-3 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-600">Guzergah {index + 1}</span>
        {showRemove && (
          <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 transition">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={lb}>Giris Saati</label>
          <input type="time" value={guzergah.giris_saati}
            onChange={(e) => onGuncelle(index, { ...guzergah, giris_saati: e.target.value })}
            className={ic} />
        </div>
        <div>
          <label className={lb}>Cikis Saati</label>
          <input type="time" value={guzergah.cikis_saati}
            onChange={(e) => onGuncelle(index, { ...guzergah, cikis_saati: e.target.value })}
            className={ic} />
        </div>
      </div>
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Kalkis</p>
        <IlIlceMahalle
          il={guzergah.kalkis_il} ilce={guzergah.kalkis_ilce} mah={guzergah.kalkis_mah}
          onIlChange={(v) => onGuncelle(index, { ...guzergah, kalkis_il: v, kalkis_ilce: '', kalkis_mah: '' })}
          onIlceChange={(v) => onGuncelle(index, { ...guzergah, kalkis_ilce: v, kalkis_mah: '' })}
          onMahChange={(v) => onGuncelle(index, { ...guzergah, kalkis_mah: v })}
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Varis</p>
        <IlIlceMahalle
          il={guzergah.varis_il} ilce={guzergah.varis_ilce} mah={guzergah.varis_mah}
          onIlChange={(v) => onGuncelle(index, { ...guzergah, varis_il: v, varis_ilce: '', varis_mah: '' })}
          onIlceChange={(v) => onGuncelle(index, { ...guzergah, varis_ilce: v, varis_mah: '' })}
          onMahChange={(v) => onGuncelle(index, { ...guzergah, varis_mah: v })}
        />
      </div>
    </div>
  );
}

function KonumBilgisi({ il, ilce, mah, giris, cikis, onIlChange, onIlceChange, onMahChange, onGirisChange, onCikisChange }: {
  il: string; ilce: string; mah: string; giris: string; cikis: string;
  onIlChange: (v: string) => void; onIlceChange: (v: string) => void;
  onMahChange: (v: string) => void; onGirisChange: (v: string) => void;
  onCikisChange: (v: string) => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 md:p-5 bg-white">
      <h3 className="font-semibold text-slate-700 mb-1">Konum Bilgisi</h3>
      <p className="text-xs text-orange-500 mb-4 font-medium">
        LUTFEN ASAGIDA BOS OLDUGUNUZ YERLERI VE SAATLERI EKLEYINIZ
      </p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={lb}>Baslangic Saati</label>
          <input type="time" value={giris} onChange={(e) => onGirisChange(e.target.value)} className={ic} />
        </div>
        <div>
          <label className={lb}>Bitis Saati</label>
          <input type="time" value={cikis} onChange={(e) => onCikisChange(e.target.value)} className={ic} />
        </div>
      </div>
      <IlIlceMahalle
        il={il} ilce={ilce} mah={mah}
        onIlChange={onIlChange} onIlceChange={onIlceChange} onMahChange={onMahChange}
      />
    </div>
  );
}

type IlanEklePageProps = {
  onGoBack: () => void;
  onSuccess: () => void;
  userId: string;
};

export default function IlanEklePage({ onGoBack, onSuccess, userId }: IlanEklePageProps) {
  const [adim, setAdim] = useState<number>(() => {
  const savedUserId = sessionStorage.getItem('ilan-ekle-userId');
  if (savedUserId !== userId) {
    sessionStorage.removeItem('ilan-ekle-adim');
    sessionStorage.removeItem('ilan-ekle-kategori');
    sessionStorage.removeItem('ilan-ekle-userId');
    return 1;
  }
  const saved = sessionStorage.getItem('ilan-ekle-adim');
  return saved ? parseInt(saved) : 1;
});

const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(() => {
  const savedUserId = sessionStorage.getItem('ilan-ekle-userId');
  if (savedUserId !== userId) return null;
  const saved = sessionStorage.getItem('ilan-ekle-kategori');
  return saved as KategoriType | null;
});
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [guzergahlar, setGuzergahlar] = useState<Guzergah[]>([bosGuzergah()]);
  const [aciklama, setAciklama] = useState('');
  const [konumIl, setKonumIl] = useState('');
  const [konumIlce, setKonumIlce] = useState('');
  const [konumMah, setKonumMah] = useState('');
  const [konumGiris, setKonumGiris] = useState('');
  const [konumCikis, setKonumCikis] = useState('');
  const [profilResim, setProfilResim] = useState<File | null>(null);
  const [profilResimUrl, setProfilResimUrl] = useState('');
  const [kullaniciaraclari, setKullaniciaraclari] = useState<any[]>([]);

  // Yeni arac ekleme state'leri
  const [yeniAracForm, setYeniAracForm] = useState({
    marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: ''
  });
  const [yeniAracEkleniyor, setYeniAracEkleniyor] = useState(false);
  const [aracFormAcik, setAracFormAcik] = useState(false);

  const [isimVarArac, setIsimVarArac] = useState({
  arac_markasi: '', model: '', arac_yili: '', arac_kapasitesi: '',
  ucret: '', km: '', calisılacak_gun: '', servis_suresi: '',
  aracki_yolcu_sayisi: '', servis_turu: [] as string[],
});
  const [aracimVarIs, setAracimVarIs] = useState({ secilen_arac: '', calisma_yerleri: '' });
  const [soforAriyorum, setSoforAriyorum] = useState({
  odeme_sekli: 'aylik',
  ucret: '',
  aranan_tecrube: '',
  ortalama_servis_suresi: '',
  yolcu_sayisi: '',
  km: '',
  calisılacak_gun: '',
  yabanci_diller: [] as string[],
});
  const [hostesAriyorum, setHostesAriyorum] = useState({
    ucret: '', calisılacak_okul: '', aranan_tecrube: '',
    okul_turu: 'Anaokulu Kres', yabanci_diller: [] as string[],
  });
  const [hostesimIs, setHostesimIs] = useState({
    dogum_tarihi: '', dogum_yeri: '', egitim_durumu: '',
    yabanci_diller: [] as string[], servis_tasimacilik_deneyimi: 'var',
  });
  const [soforumIs, setSoforumIs] = useState({
    surucubelgesi: '', ehliyet_alinma_tarihi: '', sinav_belgeleri: '',
    dogum_tarihi: '', dogum_yeri: '',
    arac_turu: [] as string[], belgeler: [] as string[], yabanci_diller: [] as string[],
    emekli: 'hayir', mesleki_yeterlilik: 'var', sabika_kaydi: 'var',
    tam_zamanlimi: 'hayir', servis_tasimacilik_deneyimi: 'var', baska_ise_gider_misiniz: 'hayir',
  });
  const [plakaSatiyorum, setPlakaSatiyorum] = useState({
    plaka_il: '', plaka_harf: '', plaka_no: '', ucret: '',
    aracla_birlikte: false, yol_belgesi_var: false, noter_satisi: false, hisseli: false,
  });

  React.useEffect(() => {
  if (selectedKategori === 'aracim_var_is') {
    supabase.from('araclar').select('*').eq('user_id', userId).then(({ data }) => {
      if (data) setKullaniciaraclari(data);
    });
  }
}, [selectedKategori]);

  const handleGuzergahGuncelle = (index: number, yeniGuzergah: Guzergah) => {
    const yeni = [...guzergahlar];
    yeni[index] = yeniGuzergah;
    setGuzergahlar(yeni);
  };

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleProfilResimSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilResim(file);
    setProfilResimUrl(URL.createObjectURL(file));
  };

  const setAdimVeKaydet = (yeniAdim: number) => {
  setAdim(yeniAdim);
  sessionStorage.setItem('ilan-ekle-adim', String(yeniAdim));
  sessionStorage.setItem('ilan-ekle-userId', userId);
};

  const handleAdim1 = () => {
    if (!selectedKategori) { setHata('Lutfen bir kategori secin.'); return; }
    setHata('');
    setAdimVeKaydet(2);
  };

  const handleAdim2 = () => {
    if (!aciklama) { setHata('Ilan detayi zorunludur.'); return; }
    setHata('');
    setAdimVeKaydet(3);
  };

  const handleGeriDon = () => {
    if (adim > 1) {
      setAdimVeKaydet(adim - 1);
    } else {
      sessionStorage.removeItem('ilan-ekle-adim');
      sessionStorage.removeItem('ilan-ekle-kategori');
      onGoBack();
    }
  };

  // Yeni arac ekleme fonksiyonu
  const handleYeniAracEkle = async () => {
    if (!yeniAracForm.marka || !yeniAracForm.model || !yeniAracForm.plaka) {
      setHata('Marka, model ve plaka zorunludur.');
      return;
    }
    setYeniAracEkleniyor(true);
    const { data, error } = await supabase
      .from('araclar')
      .insert([{ ...yeniAracForm, user_id: userId }])
      .select();
    setYeniAracEkleniyor(false);
    if (error) {
      setHata('Arac eklenirken hata olustu: ' + error.message);
      return;
    }
    if (data && data[0]) {
      setKullaniciaraclari([...kullaniciaraclari, data[0]]);
      setAracimVarIs({ ...aracimVarIs, secilen_arac: data[0].plaka });
    }
    setYeniAracForm({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
    setAracFormAcik(false);
    setHata('');
  };

  const handleYayinla = async () => {
  if (!aciklama) { setHata('Ilan detayi zorunludur.'); return; }
  setYukleniyor(true);
  const user = mevcutKullanici();

  let resimUrl = '';
  if (profilResim) {
    const { data } = await supabase.storage
      .from('profil-resimleri')
      .upload('ilan-' + Date.now(), profilResim);
    if (data) {
      const { data: urlData } = supabase.storage
        .from('profil-resimleri')
        .getPublicUrl(data.path);
      resimUrl = urlData.publicUrl;
    }
  }

  const ilanGuzergahlar = ['hostesim_is', 'soforum_is'].includes(selectedKategori!) ? [{
    giris_saati: konumGiris,
    kalkis_il: konumIl,
    kalkis_ilce: konumIlce,
    kalkis_mah: konumMah,
    varis_il: '',
    varis_ilce: '',
    varis_mah: '',
    cikis_saati: konumCikis,
  }] : guzergahlar;

  let ekbilgiler: any = {};
  if (selectedKategori === 'isim_var_arac') {
    ekbilgiler = isimVarArac;
  } else if (selectedKategori === 'aracim_var_is') {
    ekbilgiler = aracimVarIs;
  } else if (selectedKategori === 'sofor_ariyorum') {
    ekbilgiler = soforAriyorum;
  } else if (selectedKategori === 'hostes_ariyorum') {
    ekbilgiler = hostesAriyorum;
  } else if (selectedKategori === 'hostesim_is') {
    ekbilgiler = { ...hostesimIs, profil_resmi: resimUrl };
  } else if (selectedKategori === 'soforum_is') {
    ekbilgiler = { ...soforumIs, profil_resmi: resimUrl };
  } else if (selectedKategori === 'plaka_satiyorum') {
    ekbilgiler = plakaSatiyorum;
  }

  const { error } = await ilanEkle({
    kategori: selectedKategori!,
    servis_turu: isimVarArac.servis_turu,
    aciklama,
    ilan_veren: user?.full_name || user?.phone_number || '',
    user_id: user?.id || userId,
    guzergahlar: ilanGuzergahlar,
    ekbilgiler,
  } as any);

  setYukleniyor(false);
  if (error) { setHata('Hata: ' + error.message); return; }
  sessionStorage.removeItem('ilan-ekle-adim');
  sessionStorage.removeItem('ilan-ekle-kategori');
  onSuccess();
};

  const selectedKategoriLabel = kategoriler.find((k) => k.id === selectedKategori)?.label;

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">

        <button onClick={handleGeriDon}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition">
          <ArrowLeft size={15} />
          {adim > 1 ? 'Onceki Adim' : 'Geri Don'}
        </button>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

          <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base">Ucretsiz Ilan Ver</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {adim === 1 ? 'Kategori secin' : adim === 2 ? 'Ilan detaylarini girin' : 'Ilani kontrol edin'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ' +
                    (adim > s ? 'bg-green-500 text-white' : adim === s ? 'bg-orange-500 text-white' : 'bg-slate-600 text-slate-400')
                  }>
                    {adim > s ? <Check size={12} /> : s}
                  </div>
                  {s < 3 && <div className={'w-6 h-0.5 rounded ' + (adim > s ? 'bg-green-400' : 'bg-slate-600')} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-6">

            {selectedKategori && (
              <div className={kategoriRenk[selectedKategori] + ' text-white px-4 py-2 rounded-lg mb-4 text-xs font-semibold'}>
                Secilen Kategori: {selectedKategoriLabel}
              </div>
            )}

            {hata && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {hata}
              </div>
            )}

            {/* ADIM 1 */}
            {adim === 1 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-4">Ilan kategorisini secin</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {kategoriler.map((kat) => (
                    <button key={kat.id}
                      onClick={() => { setSelectedKategori(kat.id); sessionStorage.setItem('ilan-ekle-kategori', kat.id); }}
                      className={
                        'border-2 rounded-xl p-4 text-sm font-semibold text-left transition ' +
                        (selectedKategori === kat.id ? kat.color : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50')
                      }>
                      {kat.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleAdim1}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  Devam Et <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ADIM 2 */}
            {adim === 2 && (
              <div className="flex flex-col gap-5">

                {/* ISIM VAR ARAC */}
                {selectedKategori === 'isim_var_arac' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Arac Bilgileri</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div>
        <label className={lb}>Arac Markasi</label>
        <select value={isimVarArac.arac_markasi} onChange={(e) => setIsimVarArac({ ...isimVarArac, arac_markasi: e.target.value })} className={ic}>
          <option value="">Secin</option>
          <option value="farketmez">Farketmez</option>
          {['Mercedes', 'Ford', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Iveco', 'Temsa', 'Isuzu'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={lb}>Model</label>
        <select value={isimVarArac.model} onChange={(e) => setIsimVarArac({ ...isimVarArac, model: e.target.value })} className={ic}>
          <option value="">Secin</option>
          <option value="farketmez">Farketmez</option>
          {['Sprinter', 'Transit', 'Crafter', 'Jumper', 'Boxer', 'Daily', 'Minibus'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={lb}>Arac Yili</label>
        <select value={isimVarArac.arac_yili} onChange={(e) => setIsimVarArac({ ...isimVarArac, arac_yili: e.target.value })} className={ic}>
          <option value="">Secin</option>
          <option value="farketmez">Farketmez</option>
          {Array.from({ length: 20 }, (_, i) => 2025 - i).map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label className={lb}>Kapasite</label>
        <select value={isimVarArac.arac_kapasitesi} onChange={(e) => setIsimVarArac({ ...isimVarArac, arac_kapasitesi: e.target.value })} className={ic}>
          <option value="">Secin</option>
          <option value="farketmez">Farketmez</option>
          {['4+1', '8+1', '14+1', '16+1', '27+1', '36+1', '45+1'].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div>
        <label className={lb}>Ucret (TL)</label>
        <input type="number" value={isimVarArac.ucret} placeholder="500" onChange={(e) => setIsimVarArac({ ...isimVarArac, ucret: e.target.value })} className={ic} />
      </div>
      <div>
        <label className={lb}>Km</label>
        <input type="number" value={isimVarArac.km} placeholder="50" onChange={(e) => setIsimVarArac({ ...isimVarArac, km: e.target.value })} className={ic} />
      </div>
      <div>
        <label className={lb}>Calisacak Gun</label>
        <input type="number" value={isimVarArac.calisılacak_gun} placeholder="22" onChange={(e) => setIsimVarArac({ ...isimVarArac, calisılacak_gun: e.target.value })} className={ic} />
      </div>
      <div>
        <label className={lb}>Servis Suresi (Dk)</label>
        <input type="number" value={isimVarArac.servis_suresi} placeholder="60" onChange={(e) => setIsimVarArac({ ...isimVarArac, servis_suresi: e.target.value })} className={ic} />
      </div>
    </div>
    <div className="mb-4">
      <label className={lb}>Yolcu Sayisi</label>
      <input type="number" value={isimVarArac.aracki_yolcu_sayisi} placeholder="16" onChange={(e) => setIsimVarArac({ ...isimVarArac, aracki_yolcu_sayisi: e.target.value })} className={ic + ' max-w-xs'} />
    </div>
    <div>
      <label className={lb + ' mb-2'}>Servis Turu</label>
      <div className="flex flex-wrap gap-4">
        {['Okul', 'Personel', 'Hafif Minibus', 'Turizm', 'Diger'].map((t) => (
          <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={isimVarArac.servis_turu.includes(t)}
              onChange={() => setIsimVarArac({ ...isimVarArac, servis_turu: toggleArray(isimVarArac.servis_turu, t) })}
              className="accent-orange-500 w-4 h-4" />
            {t}
          </label>
        ))}
      </div>
    </div>
  </div>
)}

{/* ARACIM VAR IS */}
{selectedKategori === 'aracim_var_is' && (
  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h3 className="font-semibold text-slate-700">
        Secilen Arac:{' '}
        <span className="text-orange-500">{aracimVarIs.secilen_arac || 'Secilmedi'}</span>
      </h3>
      <button
        onClick={() => setAracFormAcik(!aracFormAcik)}
        className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition"
      >
        <Plus size={12} />
        {aracFormAcik ? 'Iptal' : 'Yeni Arac Ekle'}
      </button>
    </div>

                    {/* YENİ ARAC EKLEME FORMU */}
                    {aracFormAcik && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-slate-600 mb-3">Yeni Arac Bilgileri</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className={lb}>Marka</label>
                            <select className={ic} value={yeniAracForm.marka}
                              onChange={(e) => setYeniAracForm({ ...yeniAracForm, marka: e.target.value })}>
                              <option value="">Secin</option>
                              {['Mercedes', 'Ford', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Iveco', 'Temsa', 'Isuzu'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={lb}>Model</label>
                            <input className={ic} value={yeniAracForm.model} placeholder="Sprinter, Transit..."
                              onChange={(e) => setYeniAracForm({ ...yeniAracForm, model: e.target.value })} />
                          </div>
                          <div>
                            <label className={lb}>Yil</label>
                            <input className={ic} value={yeniAracForm.yil} placeholder="2020"
                              onChange={(e) => setYeniAracForm({ ...yeniAracForm, yil: e.target.value })} />
                          </div>
                          <div>
                            <label className={lb}>Plaka</label>
                            <input className={ic} value={yeniAracForm.plaka} placeholder="34 ABC 123"
                              onChange={(e) => setYeniAracForm({ ...yeniAracForm, plaka: e.target.value })} />
                          </div>
                          <div>
                            <label className={lb}>Koltuk Sayisi</label>
                            <input className={ic} value={yeniAracForm.koltuk_sayisi} placeholder="16+1"
                              onChange={(e) => setYeniAracForm({ ...yeniAracForm, koltuk_sayisi: e.target.value })} />
                          </div>
                          <div>
                            <label className={lb}>Arac Tipi</label>
                            <select className={ic} value={yeniAracForm.arac_tipi}
                              onChange={(e) => setYeniAracForm({ ...yeniAracForm, arac_tipi: e.target.value })}>
                              <option value="">Secin</option>
                              {['Minibus 16+1', 'Midibus 27+1', 'Otobüs 45+1', 'Sedan', 'Van'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={handleYeniAracEkle}
                          disabled={yeniAracEkleniyor}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                        >
                          {yeniAracEkleniyor ? 'Ekleniyor...' : 'Araci Ekle ve Sec'}
                        </button>
                      </div>
                    )}

                    {/* ARAC LİSTESİ VEYA BOŞ DURUM */}
                    {kullaniciaraclari.length === 0 && !aracFormAcik ? (
                      <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <p className="text-sm font-medium mb-1">Henuz arac eklemediniz</p>
                        <p className="text-xs mb-3">Yukardaki butona tiklayarak arac ekleyebilirsiniz</p>
                        <button
                          onClick={() => setAracFormAcik(true)}
                          className="bg-orange-500 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                        >
                          Arac Ekle
                        </button>
                      </div>
                    ) : kullaniciaraclari.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
                        <table className="w-full text-sm min-w-max">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500"></th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">PLAKA</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">MARKA MODEL</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">KOLTUK</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">TARIH</th>
                            </tr>
                          </thead>
                          <tbody>
                            {kullaniciaraclari.map((arac) => (
                              <tr key={arac.id}
                                className={'border-b border-slate-50 hover:bg-slate-50 cursor-pointer ' + (aracimVarIs.secilen_arac === arac.plaka ? 'bg-orange-50' : '')}
                                onClick={() => setAracimVarIs({ ...aracimVarIs, secilen_arac: arac.plaka })}>
                                <td className="px-3 py-2">
                                  <input type="radio" checked={aracimVarIs.secilen_arac === arac.plaka}
                                    onChange={() => setAracimVarIs({ ...aracimVarIs, secilen_arac: arac.plaka })}
                                    className="accent-orange-500" />
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-700">{arac.plaka}</td>
                                <td className="px-3 py-2 text-slate-600">{arac.yil} - {arac.marka} {arac.model}</td>
                                <td className="px-3 py-2 text-slate-600">{arac.koltuk_sayisi}</td>
                                <td className="px-3 py-2 text-slate-400 text-xs">{new Date(arac.created_at).toLocaleDateString('tr-TR')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}

                    <div>
                      <label className={lb}>Calisma Yerleri / Istenen Guzergah</label>
                      <input value={aracimVarIs.calisma_yerleri}
                        onChange={(e) => setAracimVarIs({ ...aracimVarIs, calisma_yerleri: e.target.value })}
                        placeholder="Ornek: Kadikoy, Uskudar, Besiktas" className={ic} />
                    </div>
                  </div>
                )}

                {/* SOFOR ARIYORUM */}
                {selectedKategori === 'sofor_ariyorum' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ilan Detaylari</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
  <label className={lb}>Odeme Sekli</label>
  <select
    value={soforAriyorum.odeme_sekli}
    onChange={(e) => setSoforAriyorum({ ...soforAriyorum, odeme_sekli: e.target.value })}
    className={ic}
  >
    <option value="aylik">Aylik</option>
    <option value="haftalik">Haftalik</option>
    <option value="gunluk">Gunluk</option>
  </select>
</div>
                      <div>
                        <label className={lb}>Ucret (TL)</label>
                        <input type="number" value={soforAriyorum.ucret}
                          onChange={(e) => setSoforAriyorum({ ...soforAriyorum, ucret: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Aranan Tecrube</label>
                        <select value={soforAriyorum.aranan_tecrube}
                          onChange={(e) => setSoforAriyorum({ ...soforAriyorum, aranan_tecrube: e.target.value })} className={ic}>
                          <option value="">Farketmez</option>
                          <option value="1">1 Yil</option>
                          <option value="2">2 Yil</option>
                          <option value="3">3 Yil ve uzeri</option>
                        </select>
                      </div>
                      <div>
                        <label className={lb}>Ort. Servis Suresi (Dk)</label>
                        <input type="number" value={soforAriyorum.ortalama_servis_suresi}
                          onChange={(e) => setSoforAriyorum({ ...soforAriyorum, ortalama_servis_suresi: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Yolcu Sayisi</label>
                        <input type="number" value={soforAriyorum.yolcu_sayisi}
                          onChange={(e) => setSoforAriyorum({ ...soforAriyorum, yolcu_sayisi: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Km</label>
                        <input type="number" value={soforAriyorum.km}
                          onChange={(e) => setSoforAriyorum({ ...soforAriyorum, km: e.target.value })} className={ic} />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className={lb}>Calisacak Gun</label>
                      <input type="number" value={soforAriyorum.calisılacak_gun}
                        onChange={(e) => setSoforAriyorum({ ...soforAriyorum, calisılacak_gun: e.target.value })}
                        className={ic + ' max-w-xs'} />
                    </div>
                    <div>
                      <label className={lb + ' mb-2'}>Istenen Yabanci Diller</label>
                      <div className="flex flex-wrap gap-3">
                        {['Ingilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={soforAriyorum.yabanci_diller.includes(d)}
                              onChange={() => setSoforAriyorum({ ...soforAriyorum, yabanci_diller: toggleArray(soforAriyorum.yabanci_diller, d) })}
                              className="accent-orange-500 w-4 h-4" />
                            {d}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* HOSTES ARIYORUM */}
                {selectedKategori === 'hostes_ariyorum' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ilan Detaylari</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className={lb}>Ucret (TL)</label>
                        <input type="number" value={hostesAriyorum.ucret}
                          onChange={(e) => setHostesAriyorum({ ...hostesAriyorum, ucret: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Calisacak Okul</label>
                        <input value={hostesAriyorum.calisılacak_okul}
                          onChange={(e) => setHostesAriyorum({ ...hostesAriyorum, calisılacak_okul: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Aranan Tecrube</label>
                        <select value={hostesAriyorum.aranan_tecrube}
                          onChange={(e) => setHostesAriyorum({ ...hostesAriyorum, aranan_tecrube: e.target.value })} className={ic}>
                          <option value="">Farketmez</option>
                          <option value="1">1 Yil</option>
                          <option value="2">2 Yil</option>
                          <option value="3">3 Yil ve uzeri</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className={lb + ' mb-2'}>Okul Turu</label>
                      <div className="flex flex-wrap gap-4">
                        {['Anaokulu Kres', 'Ilk Ogretim', 'Lise'].map((t) => (
                          <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" checked={hostesAriyorum.okul_turu === t}
                              onChange={() => setHostesAriyorum({ ...hostesAriyorum, okul_turu: t })}
                              className="accent-orange-500" />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={lb + ' mb-2'}>Yabanci Diller</label>
                      <div className="flex flex-wrap gap-3">
                        {['Ingilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={hostesAriyorum.yabanci_diller.includes(d)}
                              onChange={() => setHostesAriyorum({ ...hostesAriyorum, yabanci_diller: toggleArray(hostesAriyorum.yabanci_diller, d) })}
                              className="accent-orange-500 w-4 h-4" />
                            {d}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* HOSTESIM IS */}
                {selectedKategori === 'hostesim_is' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ilan Detaylari</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className={lb}>Dogum Tarihi</label>
                        <input type="date" value={hostesimIs.dogum_tarihi}
                          onChange={(e) => setHostesimIs({ ...hostesimIs, dogum_tarihi: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Dogum Yeri</label>
                        <input value={hostesimIs.dogum_yeri}
                          onChange={(e) => setHostesimIs({ ...hostesimIs, dogum_yeri: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Egitim Durumu</label>
                        <select value={hostesimIs.egitim_durumu}
                          onChange={(e) => setHostesimIs({ ...hostesimIs, egitim_durumu: e.target.value })} className={ic}>
                          <option value="">Seciniz</option>
                          <option value="ilkokul">Ilkokul</option>
                          <option value="ortaokul">Ortaokul</option>
                          <option value="lise">Lise</option>
                          <option value="universite">Universite</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className={lb + ' mb-2'}>Yabanci Diller</label>
                      <div className="flex flex-wrap gap-3">
                        {['Ingilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={hostesimIs.yabanci_diller.includes(d)}
                              onChange={() => setHostesimIs({ ...hostesimIs, yabanci_diller: toggleArray(hostesimIs.yabanci_diller, d) })}
                              className="accent-orange-500 w-4 h-4" />
                            {d}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={lb + ' mb-2'}>Servis Tasimacilik Deneyimi</label>
                      <div className="flex gap-4">
                        {['var', 'yok'].map((v) => (
                          <label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="radio" checked={hostesimIs.servis_tasimacilik_deneyimi === v}
                              onChange={() => setHostesimIs({ ...hostesimIs, servis_tasimacilik_deneyimi: v })}
                              className="accent-orange-500" />
                            {v === 'var' ? 'Var' : 'Yok'}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SOFORUM IS */}
                {selectedKategori === 'soforum_is' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Ehliyet ve Arac Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className={lb}>Surucubelgesi</label>
                        <select value={soforumIs.surucubelgesi}
                          onChange={(e) => setSoforumIs({ ...soforumIs, surucubelgesi: e.target.value })} className={ic}>
                          <option value="">Secin</option>
                          {['B', 'D', 'D1', 'D2', 'D+E'].map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lb}>Ehliyet Tarihi</label>
                        <input type="date" value={soforumIs.ehliyet_alinma_tarihi}
                          onChange={(e) => setSoforumIs({ ...soforumIs, ehliyet_alinma_tarihi: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>SRC Belgeleri</label>
                        <input value={soforumIs.sinav_belgeleri} placeholder="SRC2, SRC3"
                          onChange={(e) => setSoforumIs({ ...soforumIs, sinav_belgeleri: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Dogum Tarihi</label>
                        <input type="date" value={soforumIs.dogum_tarihi}
                          onChange={(e) => setSoforumIs({ ...soforumIs, dogum_tarihi: e.target.value })} className={ic} />
                      </div>
                      <div>
                        <label className={lb}>Dogum Yeri</label>
                        <input value={soforumIs.dogum_yeri}
                          onChange={(e) => setSoforumIs({ ...soforumIs, dogum_yeri: e.target.value })} className={ic} />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className={lb + ' mb-2'}>Arac Turu</label>
                      <div className="flex flex-wrap gap-3">
                        {['Minibus', 'Midibus', 'Otobus', 'Van', 'Otomobil'].map((t) => (
                          <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={soforumIs.arac_turu.includes(t)}
                              onChange={() => setSoforumIs({ ...soforumIs, arac_turu: toggleArray(soforumIs.arac_turu, t) })}
                              className="accent-orange-500 w-4 h-4" />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className={lb + ' mb-2'}>Belgeler</label>
                      <div className="flex flex-wrap gap-3 mb-3">
                        {['Src', 'Src1', 'Src2', 'Src3', 'Diger', 'Tam Sofor Kart'].map((b) => (
                          <label key={b} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={soforumIs.belgeler.includes(b)}
                              onChange={() => setSoforumIs({ ...soforumIs, belgeler: toggleArray(soforumIs.belgeler, b) })}
                              className="accent-orange-500 w-4 h-4" />
                            {b}
                          </label>
                        ))}
                      </div>
                      <label className={lb + ' mb-2'}>Yabanci Diller</label>
                      <div className="flex flex-wrap gap-3">
                        {['Ingilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" checked={soforumIs.yabanci_diller.includes(d)}
                              onChange={() => setSoforumIs({ ...soforumIs, yabanci_diller: toggleArray(soforumIs.yabanci_diller, d) })}
                              className="accent-orange-500 w-4 h-4" />
                            {d}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Emekli misiniz?', key: 'emekli' },
                        { label: 'Mesleki Yeterlilik?', key: 'mesleki_yeterlilik' },
                        { label: 'Sabika kaydi?', key: 'sabika_kaydi' },
                        { label: 'Tam zamanli?', key: 'tam_zamanlimi' },
                        { label: 'Servis Deneyimi?', key: 'servis_tasimacilik_deneyimi' },
                        { label: 'Baska ise gider?', key: 'baska_ise_gider_misiniz' },
                      ].map((item) => (
                        <div key={item.key}>
                          <label className={lb + ' mb-2'}>{item.label}</label>
                          <div className="flex gap-3">
                            {['Evet', 'Hayir'].map((v) => (
                              <label key={v} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                                <input type="radio"
                                  checked={(soforumIs as any)[item.key] === v.toLowerCase()}
                                  onChange={() => setSoforumIs({ ...soforumIs, [item.key]: v.toLowerCase() })}
                                  className="accent-orange-500" />
                                {v}
                              </label>
                            ))}
                          </div>
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
                      <input value={plakaSatiyorum.plaka_il} placeholder="34" maxLength={2}
                        onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_il: e.target.value })}
                        className="w-16 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      <input value={plakaSatiyorum.plaka_harf} placeholder="LAL" maxLength={3}
                        onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_harf: e.target.value.toUpperCase() })}
                        className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      <input value={plakaSatiyorum.plaka_no} placeholder="454" maxLength={4}
                        onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_no: e.target.value })}
                        className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      <div className="flex items-center gap-2">
                        <input type="number" value={plakaSatiyorum.ucret} placeholder="1.000.000"
                          onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, ucret: e.target.value })}
                          className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        <span className="text-sm text-slate-500 font-medium">TL</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { key: 'aracla_birlikte', label: 'Aracla Birlikte' },
                        { key: 'yol_belgesi_var', label: 'Yol Belgesi Var' },
                        { key: 'noter_satisi', label: 'Noter Satisi' },
                        { key: 'hisseli', label: 'Hisseli' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox"
                            checked={(plakaSatiyorum as any)[item.key]}
                            onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, [item.key]: e.target.checked })}
                            className="accent-orange-500 w-4 h-4" />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* GUZERGAH */}
                {selectedKategori !== 'hostesim_is' && selectedKategori !== 'soforum_is' && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-700">Guzergah Listesi</h3>
                        <p className="text-xs text-orange-500 mt-1 font-medium">
                          LUTFEN GUZERGAHLARINIZIN BASLANGIC VE BITIS YERLERINI EKLEYINIZ
                        </p>
                      </div>
                      <button onClick={() => setGuzergahlar([...guzergahlar, bosGuzergah()])}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                        <Plus size={12} /> Guzergah Ekle
                      </button>
                    </div>
                    {guzergahlar.map((g, i) => (
                      <GuzergahSatiri key={i} guzergah={g} index={i}
                        onGuncelle={handleGuzergahGuncelle}
                        onRemove={(idx) => setGuzergahlar(guzergahlar.filter((_, ii) => ii !== idx))}
                        showRemove={guzergahlar.length > 1} />
                    ))}
                  </div>
                )}

                {(selectedKategori === 'hostesim_is' || selectedKategori === 'soforum_is') && (
                  <KonumBilgisi
                    il={konumIl} ilce={konumIlce} mah={konumMah}
                    giris={konumGiris} cikis={konumCikis}
                    onIlChange={(v) => { setKonumIl(v); setKonumIlce(''); setKonumMah(''); }}
                    onIlceChange={(v) => { setKonumIlce(v); setKonumMah(''); }}
                    onMahChange={setKonumMah}
                    onGirisChange={setKonumGiris}
                    onCikisChange={setKonumCikis}
                  />
                )}

                {(selectedKategori === 'hostesim_is' || selectedKategori === 'soforum_is') && (
                  <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">Kisisel Bilgiler</h3>
                    <div className="flex flex-col items-start gap-3">
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                        {profilResimUrl ? (
                          <img src={profilResimUrl} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        )}
                      </div>
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                        Dosya Sec
                        <input type="file" accept="image/jpeg,image/png,image/gif"
                          onChange={handleProfilResimSec} className="hidden" />
                      </label>
                      {profilResim && <p className="text-xs text-green-600">{profilResim.name}</p>}
                      <p className="text-xs text-slate-400">Maks 20MB, JPEG/PNG/GIF</p>
                    </div>
                  </div>
                )}

                {/* ILAN DETAYI */}
                <div className="border border-slate-200 rounded-xl p-4 md:p-5">
                  <h3 className="font-semibold text-slate-700 mb-3">Ilan Detayi</h3>
                  <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)}
                    placeholder="Ilan detaylarini yazin..."
                    rows={5}
                    className={ic + ' resize-none'} />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setAdimVeKaydet(1)}
                    className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                    <ArrowLeft size={15} /> Geri
                  </button>
                  <button onClick={handleAdim2}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    Onizleme <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 3 - ONİZLEME */}
            {adim === 3 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-4">Ilan Onizleme</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                  <div className="mb-3">
                    <span className={kategoriRenk[selectedKategori!] + ' text-white text-xs font-bold px-3 py-1 rounded-full uppercase'}>
                      {selectedKategoriLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{aciklama}</p>
                  {guzergahlar.length > 0 && guzergahlar[0].kalkis_il && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs rounded-xl overflow-hidden min-w-max">
                        <thead>
                          <tr className="bg-slate-800 text-white">
                            <th className="px-3 py-2 text-left font-medium">Giris</th>
                            <th className="px-3 py-2 text-left font-medium">Nereden</th>
                            <th className="px-3 py-2 text-left font-medium">Nereye</th>
                            <th className="px-3 py-2 text-left font-medium">Cikis</th>
                          </tr>
                        </thead>
                        <tbody>
                          {guzergahlar.map((g, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="px-3 py-2 text-orange-600 font-bold">{g.giris_saati || '--:--'}</td>
                              <td className="px-3 py-2 text-slate-600">{g.kalkis_mah} {g.kalkis_ilce} / {g.kalkis_il}</td>
                              <td className="px-3 py-2 text-slate-600">{g.varis_mah} {g.varis_ilce} / {g.varis_il}</td>
                              <td className="px-3 py-2 text-orange-600 font-bold">{g.cikis_saati || '--:--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setAdimVeKaydet(2)}
                    className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                    <ArrowLeft size={15} /> Duzenle
                  </button>
                  <button onClick={handleYayinla} disabled={yukleniyor}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <Check size={15} />
                    {yukleniyor ? 'Yayinlaniyor...' : 'Ilani Kaydet ve Yayinla'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
