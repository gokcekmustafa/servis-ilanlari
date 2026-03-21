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
        <label className="text-xs text-gray-500 mb-1 block">Sehir</label>
        <select
          value={il}
          onChange={(e) => { onIlChange(e.target.value); onIlceChange(''); onMahChange(''); }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
        >
          <option value="">Il Sec</option>
          {tumIller.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Ilce</label>
        <select
          value={ilce}
          onChange={(e) => { onIlceChange(e.target.value); onMahChange(''); }}
          disabled={!il}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] disabled:bg-gray-100"
        >
          <option value="">Ilce Sec</option>
          {ilceleri.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Mahalle</label>
        {il === 'Istanbul' ? (
          <select
            value={mah}
            onChange={(e) => onMahChange(e.target.value)}
            disabled={!ilce}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] disabled:bg-gray-100"
          >
            <option value="">Mahalle Sec</option>
            {mahalleleri.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input
            value={mah}
            onChange={(e) => onMahChange(e.target.value)}
            placeholder="Mahalle"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
          />
        )}
      </div>
    </div>
  );
}

function GuzergahSatiri({ guzergah, index, onChange, onRemove, showRemove }: {
  guzergah: Guzergah; index: number;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">Guzergah {index + 1}</span>
        {showRemove && (
          <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Giris Saati</label>
          <input type="time" value={guzergah.giris_saati}
            onChange={(e) => onChange(index, 'giris_saati', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Cikis Saati</label>
          <input type="time" value={guzergah.cikis_saati}
            onChange={(e) => onChange(index, 'cikis_saati', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
        </div>
      </div>
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">Kalkis</p>
        <IlIlceMahalle
          il={guzergah.kalkis_il} ilce={guzergah.kalkis_ilce} mah={guzergah.kalkis_mah}
          onIlChange={(v) => { onChange(index, 'kalkis_il', v); onChange(index, 'kalkis_ilce', ''); onChange(index, 'kalkis_mah', ''); }}
          onIlceChange={(v) => { onChange(index, 'kalkis_ilce', v); onChange(index, 'kalkis_mah', ''); }}
          onMahChange={(v) => onChange(index, 'kalkis_mah', v)}
        />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Varis</p>
        <IlIlceMahalle
          il={guzergah.varis_il} ilce={guzergah.varis_ilce} mah={guzergah.varis_mah}
          onIlChange={(v) => { onChange(index, 'varis_il', v); onChange(index, 'varis_ilce', ''); onChange(index, 'varis_mah', ''); }}
          onIlceChange={(v) => { onChange(index, 'varis_ilce', v); onChange(index, 'varis_mah', ''); }}
          onMahChange={(v) => onChange(index, 'varis_mah', v)}
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
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-gray-700 mb-1">Konum Bilgisi</h3>
      <p className="text-xs text-orange-500 mb-4">LUTFEN ASAGIDA BOS OLDUGUNUZ YERLERI VE SAATLERI EKLEYINIZ</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Baslangic Saati</label>
          <input type="time" value={giris} onChange={(e) => onGirisChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Bitis Saati</label>
          <input type="time" value={cikis} onChange={(e) => onCikisChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
        </div>
      </div>
      <IlIlceMahalle
        il={il} ilce={ilce} mah={mah}
        onIlChange={onIlChange} onIlceChange={onIlceChange} onMahChange={onMahChange}
      />
    </div>
  );
}

export default function IlanEklePage({
  onGoBack,
  onSuccess,
  userId,
}: {
  onGoBack: () => void;
  onSuccess: () => void;
  userId: string;
}) {
  const [adim, setAdim] = useState(1);
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);
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

  const [isimVarArac, setIsimVarArac] = useState({
    arac_markasi: '', model: '', arac_yili: '', arac_kapasitesi: '',
    ucret: '', km: '', calisılacak_gun: '', servis_suresi: '',
    aracki_yolcu_sayisi: '', servis_turu: [] as string[],
  });

  const [aracimVarIs, setAracimVarIs] = useState({
    secilen_arac: '', calisma_yerleri: '',
  });
  const [kullaniciaraclari, setKullaniciaraclari] = useState<any[]>([]);

  const [soforAriyorum, setSoforAriyorum] = useState({
    odeme_sekli: '', ucret: '', aranan_tecrube: '',
    ortalama_servis_suresi: '', yolcu_sayisi: '', km: '',
    calisılacak_gun: '', yabanci_diller: [] as string[],
    arac_secimi: 'araclarimdan',
  });

  const [hostesAriyorum, setHostesAriyorum] = useState({
    ucret: '', calisılacak_okul: '', aranan_tecrube: '',
    okul_turu: 'Anaokulu Kres', yabanci_diller: [] as string[],
  });

  const [hostesimIs, setHostesimIs] = useState({
    dogum_tarihi: '', dogum_yeri: '', egitim_durumu: '',
    yabanci_diller: [] as string[],
    servis_tasimacilik_deneyimi: 'var',
  });

  const [soforumIs, setSoforumIs] = useState({
    surucubelgesi: '', ehliyet_alinma_tarihi: '', sinav_belgeleri: '',
    dogum_tarihi: '', dogum_yeri: '',
    arac_turu: [] as string[],
    belgeler: [] as string[],
    yabanci_diller: [] as string[],
    emekli: 'hayir', mesleki_yeterlilik: 'var',
    sabika_kaydi: 'var', tam_zamanlimi: 'hayir',
    servis_tasimacilik_deneyimi: 'var', baska_ise_gider_misiniz: 'hayir',
  });

  const [plakaSatiyorum, setPlakaSatiyorum] = useState({
    plaka_il: '', plaka_harf: '', plaka_no: '', ucret: '',
    aracla_birlikte: false, yol_belgesi_var: false,
    noter_satisi: false, hisseli: false,
  });

  React.useEffect(() => {
    if (selectedKategori === 'aracim_var_is') {
      supabase.from('araclar').select('*').eq('user_id', userId).then(({ data }) => {
        if (data) setKullaniciaraclari(data);
      });
    }
  }, [selectedKategori]);

  const handleGuzergahChange = (index: number, field: string, value: string) => {
    const yeni = [...guzergahlar];
    yeni[index] = { ...yeni[index], [field]: value };
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

  const handleAdim1 = () => {
    if (!selectedKategori) { setHata('Lutfen bir kategori secin.'); return; }
    setHata(''); setAdim(2);
  };

  const handleYayinla = async () => {
    if (!aciklama) { setHata('Ilan detayi zorunludur.'); return; }
    setYukleniyor(true);
    const user = mevcutKullanici();

    let resimUrl = '';
    if (profilResim) {
      const { data } = await supabase.storage
        .from('profil-resimleri')
        .upload(`ilan-${Date.now()}`, profilResim);
      if (data) {
        const { data: urlData } = supabase.storage.from('profil-resimleri').getPublicUrl(data.path);
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

    let ekAlanlar: any = {};
    if (selectedKategori === 'isim_var_arac') ekAlanlar = isimVarArac;
    else if (selectedKategori === 'aracim_var_is') ekAlanlar = aracimVarIs;
    else if (selectedKategori === 'sofor_ariyorum') ekAlanlar = soforAriyorum;
    else if (selectedKategori === 'hostes_ariyorum') ekAlanlar = hostesAriyorum;
    else if (selectedKategori === 'hostesim_is') ekAlanlar = { ...hostesimIs, profil_resmi: resimUrl };
    else if (selectedKategori === 'soforum_is') ekAlanlar = { ...soforumIs, profil_resmi: resimUrl };
    else if (selectedKategori === 'plaka_satiyorum') ekAlanlar = plakaSatiyorum;

    const { error } = await ilanEkle({
      kategori: selectedKategori!,
      servis_turu: isimVarArac.servis_turu,
      aciklama,
      ilan_veren: user?.full_name || user?.phone_number || '',
      user_id: user?.id || userId,
      guzergahlar: ilanGuzergahlar,
      ...ekAlanlar,
    } as any);

    setYukleniyor(false);
    if (error) { setHata('Hata: ' + error.message); return; }
    onSuccess();
  };

  const selectedKategoriLabel = kategoriler.find((k) => k.id === selectedKategori)?.label;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={adim > 1 ? () => setAdim(adim - 1) : onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
  <ArrowLeft size={16} /> Geri Don
</button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-xl font-bold text-[#1a3c6e] mb-6">Ucretsiz Ilan Ver</h2>

        <div className="flex items-center mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1 md:gap-2">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition ${adim > s ? 'bg-green-500 text-white' : adim === s ? 'bg-[#1a3c6e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {adim > s ? <Check size={12} /> : s}
                </div>
                <span className={`text-xs md:text-sm font-medium hidden md:block ${adim === s ? 'text-[#1a3c6e]' : 'text-gray-400'}`}>
                  {s === 1 ? 'Kategori' : s === 2 ? 'Detaylar' : 'Onizleme'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 md:mx-3 rounded ${adim > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {selectedKategori && (
          <div className={`${kategoriRenk[selectedKategori]} text-white px-4 py-2 rounded-lg mb-4 text-sm font-medium`}>
            Secilen Kategori: {selectedKategoriLabel}
          </div>
        )}

        {hata && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{hata}</div>}

        {adim === 1 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">Ilan kategorisini secin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {kategoriler.map((kat) => (
                <button key={kat.id} onClick={() => setSelectedKategori(kat.id)}
                  className={`border-2 rounded-xl p-4 text-sm font-medium text-left transition ${selectedKategori === kat.id ? kat.color : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                  {kat.label}
                </button>
              ))}
            </div>
            <button onClick={handleAdim1} className="w-full bg-[#1a3c6e] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition flex items-center justify-center gap-2">
              Devam Et <ArrowRight size={16} />
            </button>
          </div>
        )}

        {adim === 2 && (
          <div className="flex flex-col gap-6">

            {selectedKategori === 'isim_var_arac' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-gray-700 mb-4">Arac Bilgileri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Arac Markasi</label>
                    <select value={isimVarArac.arac_markasi} onChange={(e) => setIsimVarArac({ ...isimVarArac, arac_markasi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Secin</option>
                      {['Mercedes', 'Ford', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Iveco', 'Temsa', 'Isuzu'].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Model</label>
                    <select value={isimVarArac.model} onChange={(e) => setIsimVarArac({ ...isimVarArac, model: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Secin</option>
                      {['Sprinter', 'Transit', 'Crafter', 'Jumper', 'Boxer', 'Daily', 'Minibus'].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Arac Yili</label>
                    <select value={isimVarArac.arac_yili} onChange={(e) => setIsimVarArac({ ...isimVarArac, arac_yili: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Secin</option>
                      {Array.from({ length: 20 }, (_, i) => 2025 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Kapasite</label>
                    <select value={isimVarArac.arac_kapasitesi} onChange={(e) => setIsimVarArac({ ...isimVarArac, arac_kapasitesi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Secin</option>
                      {['4+1', '8+1', '14+1', '16+1', '27+1', '36+1', '45+1'].map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ucret (TL)</label>
                    <input type="number" value={isimVarArac.ucret} onChange={(e) => setIsimVarArac({ ...isimVarArac, ucret: e.target.value })}
                      placeholder="500" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Km</label>
                    <input type="number" value={isimVarArac.km} onChange={(e) => setIsimVarArac({ ...isimVarArac, km: e.target.value })}
                      placeholder="50" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Calisacak Gun</label>
                    <input type="number" value={isimVarArac.calisılacak_gun} onChange={(e) => setIsimVarArac({ ...isimVarArac, calisılacak_gun: e.target.value })}
                      placeholder="22" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Servis Suresi (Dk)</label>
                    <input type="number" value={isimVarArac.servis_suresi} onChange={(e) => setIsimVarArac({ ...isimVarArac, servis_suresi: e.target.value })}
                      placeholder="60" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-1 block">Yolcu Sayisi</label>
                  <input type="number" value={isimVarArac.aracki_yolcu_sayisi} onChange={(e) => setIsimVarArac({ ...isimVarArac, aracki_yolcu_sayisi: e.target.value })}
                    placeholder="16" className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Servis Turu</label>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {['Okul', 'Personel', 'Hafif Minibus', 'Turizm', 'Diger'].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={isimVarArac.servis_turu.includes(t)}
                          onChange={() => setIsimVarArac({ ...isimVarArac, servis_turu: toggleArray(isimVarArac.servis_turu, t) })}
                          className="accent-[#f97316] w-4 h-4" />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedKategori === 'aracim_var_is' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="font-bold text-gray-700">
                    Secilen Arac: {aracimVarIs.secilen_arac || 'Secilmedi'}
                  </h3>
                  <button
                    onClick={() => window.open('#panel', '_self')}
                    className="flex items-center gap-2 bg-[#f97316] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 transition">
                    <Plus size={12} /> Yeni Arac Ekle
                  </button>
                </div>
                {kullaniciaraclari.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 overflow-x-auto">
                    <table className="w-full text-sm min-w-max">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500"></th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PLAKA</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">MARKA MODEL</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">KOLTUK</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">TARIH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kullaniciaraclari.map((arac) => (
                          <tr key={arac.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setAracimVarIs({ ...aracimVarIs, secilen_arac: arac.plaka })}>
                            <td className="px-3 py-2">
                              <input type="radio" checked={aracimVarIs.secilen_arac === arac.plaka}
                                onChange={() => setAracimVarIs({ ...aracimVarIs, secilen_arac: arac.plaka })}
                                className="accent-[#f97316]" />
                            </td>
                            <td className="px-3 py-2 font-medium">{arac.plaka}</td>
                            <td className="px-3 py-2">{arac.yil} - {arac.marka} {arac.model}</td>
                            <td className="px-3 py-2">{arac.koltuk_sayisi}</td>
                            <td className="px-3 py-2 text-gray-500 text-xs">{new Date(arac.created_at).toLocaleDateString('tr-TR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 border border-gray-200 rounded-lg mb-4 bg-gray-50">
                    <p className="text-sm">Henuz arac eklemediniz.</p>
                    <p className="text-xs mt-1">Panelim &gt; Araclarim bolumunden arac ekleyebilirsiniz.</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Calisma Yerleri / Istenen Guzergah</label>
                  <input value={aracimVarIs.calisma_yerleri} onChange={(e) => setAracimVarIs({ ...aracimVarIs, calisma_yerleri: e.target.value })}
                    placeholder="Ornek: Kadikoy, Uskudar, Besiktas"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                </div>
              </div>
            )}

            {selectedKategori === 'sofor_ariyorum' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <div className="flex flex-wrap gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={soforAriyorum.arac_secimi === 'araclarimdan'} onChange={() => setSoforAriyorum({ ...soforAriyorum, arac_secimi: 'araclarimdan' })} className="accent-[#f97316]" />
                    Araclarimdan secilecegim
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" checked={soforAriyorum.arac_secimi === 'ilk_seferlik'} onChange={() => setSoforAriyorum({ ...soforAriyorum, arac_secimi: 'ilk_seferlik' })} className="accent-[#f97316]" />
                    İlk seferlik arac bilgisi girecegim
                  </label>
                </div>
                <h3 className="font-bold text-gray-700 mb-4">İlan Detaylari</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Odeme Sekli</label>
                    <input value={soforAriyorum.odeme_sekli} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, odeme_sekli: e.target.value })}
                      placeholder="Aylik / Gunluk" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ucret (TL)</label>
                    <input type="number" value={soforAriyorum.ucret} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, ucret: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Aranan Tecrube</label>
                    <select value={soforAriyorum.aranan_tecrube} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, aranan_tecrube: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Farketmez</option>
                      <option value="1">1 Yil</option>
                      <option value="2">2 Yil</option>
                      <option value="3">3 Yil ve uzeri</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ort. Servis Suresi (Dk)</label>
                    <input type="number" value={soforAriyorum.ortalama_servis_suresi} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, ortalama_servis_suresi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Yolcu Sayisi</label>
                    <input type="number" value={soforAriyorum.yolcu_sayisi} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, yolcu_sayisi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Km</label>
                    <input type="number" value={soforAriyorum.km} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, km: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-1 block">Calisacak Gun</label>
                  <input type="number" value={soforAriyorum.calisılacak_gun} onChange={(e) => setSoforAriyorum({ ...soforAriyorum, calisılacak_gun: e.target.value })}
                    className="w-full md:w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">İstenen Yabanci Diller</label>
                  <div className="flex flex-wrap gap-3">
                    {['İngilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                      <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={soforAriyorum.yabanci_diller.includes(d)}
                          onChange={() => setSoforAriyorum({ ...soforAriyorum, yabanci_diller: toggleArray(soforAriyorum.yabanci_diller, d) })}
                          className="accent-[#f97316] w-4 h-4" />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedKategori === 'hostes_ariyorum' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-gray-700 mb-4">İlan Detaylari</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ucret (TL)</label>
                    <input type="number" value={hostesAriyorum.ucret} onChange={(e) => setHostesAriyorum({ ...hostesAriyorum, ucret: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Calisacak Okul</label>
                    <input value={hostesAriyorum.calisılacak_okul} onChange={(e) => setHostesAriyorum({ ...hostesAriyorum, calisılacak_okul: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Aranan Tecrube</label>
                    <select value={hostesAriyorum.aranan_tecrube} onChange={(e) => setHostesAriyorum({ ...hostesAriyorum, aranan_tecrube: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Farketmez</option>
                      <option value="1">1 Yil</option>
                      <option value="2">2 Yil</option>
                      <option value="3">3 Yil ve uzeri</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-2 block">Okul Turu</label>
                  <div className="flex flex-wrap gap-4">
                    {['Anaokulu Kres', 'İlk Ogretim', 'Lise'].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={hostesAriyorum.okul_turu === t}
                          onChange={() => setHostesAriyorum({ ...hostesAriyorum, okul_turu: t })}
                          className="accent-[#f97316]" />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Yabanci Diller</label>
                  <div className="flex flex-wrap gap-3">
                    {['İngilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                      <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={hostesAriyorum.yabanci_diller.includes(d)}
                          onChange={() => setHostesAriyorum({ ...hostesAriyorum, yabanci_diller: toggleArray(hostesAriyorum.yabanci_diller, d) })}
                          className="accent-[#f97316] w-4 h-4" />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedKategori === 'hostesim_is' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-gray-700 mb-4">İlan Detaylari</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Dogum Tarihi</label>
                    <input type="date" value={hostesimIs.dogum_tarihi} onChange={(e) => setHostesimIs({ ...hostesimIs, dogum_tarihi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Dogum Yeri</label>
                    <input value={hostesimIs.dogum_yeri} onChange={(e) => setHostesimIs({ ...hostesimIs, dogum_yeri: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Egitim Durumu</label>
                    <select value={hostesimIs.egitim_durumu} onChange={(e) => setHostesimIs({ ...hostesimIs, egitim_durumu: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Seciniz</option>
                      <option value="ilkokul">İlkokul</option>
                      <option value="ortaokul">Ortaokul</option>
                      <option value="lise">Lise</option>
                      <option value="universite">Universite</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-2 block">Yabanci Diller</label>
                  <div className="flex flex-wrap gap-3">
                    {['İngilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                      <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={hostesimIs.yabanci_diller.includes(d)}
                          onChange={() => setHostesimIs({ ...hostesimIs, yabanci_diller: toggleArray(hostesimIs.yabanci_diller, d) })}
                          className="accent-[#f97316] w-4 h-4" />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Servis Tasimacilik Deneyimi</label>
                  <div className="flex gap-4">
                    {['var', 'yok'].map((v) => (
                      <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={hostesimIs.servis_tasimacilik_deneyimi === v}
                          onChange={() => setHostesimIs({ ...hostesimIs, servis_tasimacilik_deneyimi: v })}
                          className="accent-[#f97316]" />
                        {v === 'var' ? 'Var' : 'Yok'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedKategori === 'soforum_is' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-gray-700 mb-4">Ehliyet ve Arac Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Surucubelgesi</label>
                    <select value={soforumIs.surucubelgesi} onChange={(e) => setSoforumIs({ ...soforumIs, surucubelgesi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]">
                      <option value="">Secin</option>
                      {['B', 'D', 'D1', 'D2', 'D+E'].map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ehliyet Tarihi</label>
                    <input type="date" value={soforumIs.ehliyet_alinma_tarihi} onChange={(e) => setSoforumIs({ ...soforumIs, ehliyet_alinma_tarihi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SRC Belgeleri</label>
                    <input value={soforumIs.sinav_belgeleri} onChange={(e) => setSoforumIs({ ...soforumIs, sinav_belgeleri: e.target.value })}
                      placeholder="SRC2, SRC3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Dogum Tarihi</label>
                    <input type="date" value={soforumIs.dogum_tarihi} onChange={(e) => setSoforumIs({ ...soforumIs, dogum_tarihi: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Dogum Yeri</label>
                    <input value={soforumIs.dogum_yeri} onChange={(e) => setSoforumIs({ ...soforumIs, dogum_yeri: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-2 block">Arac Turu</label>
                  <div className="flex flex-wrap gap-3">
                    {['Minibus', 'Midibus', 'Otobus', 'Van', 'Otomobil'].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={soforumIs.arac_turu.includes(t)}
                          onChange={() => setSoforumIs({ ...soforumIs, arac_turu: toggleArray(soforumIs.arac_turu, t) })}
                          className="accent-[#f97316] w-4 h-4" />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-2 block">Belgeler</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {['Src', 'Src1', 'Src2', 'Src3', 'Diger', 'Tam Sofor Kart'].map((b) => (
                      <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={soforumIs.belgeler.includes(b)}
                          onChange={() => setSoforumIs({ ...soforumIs, belgeler: toggleArray(soforumIs.belgeler, b) })}
                          className="accent-[#f97316] w-4 h-4" />
                        {b}
                      </label>
                    ))}
                  </div>
                  <label className="text-xs text-gray-500 mb-2 block">Yabanci Diller</label>
                  <div className="flex flex-wrap gap-3">
                    {['İngilizce', 'Arapca', 'Almanca', 'Fransizca', 'Diger'].map((d) => (
                      <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={soforumIs.yabanci_diller.includes(d)}
                          onChange={() => setSoforumIs({ ...soforumIs, yabanci_diller: toggleArray(soforumIs.yabanci_diller, d) })}
                          className="accent-[#f97316] w-4 h-4" />
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
                      <label className="text-xs text-gray-500 mb-2 block">{item.label}</label>
                      <div className="flex gap-3">
                        {['Evet', 'Hayir'].map((v) => (
                          <label key={v} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input type="radio"
                              checked={(soforumIs as any)[item.key] === v.toLowerCase()}
                              onChange={() => setSoforumIs({ ...soforumIs, [item.key]: v.toLowerCase() })}
                              className="accent-[#f97316]" />
                            {v}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedKategori === 'plaka_satiyorum' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-gray-700 mb-4">Arac Plakasi (Plakaniz Gizlenecektir)</h3>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <input value={plakaSatiyorum.plaka_il} onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_il: e.target.value })}
                    placeholder="34" maxLength={2}
                    className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  <input value={plakaSatiyorum.plaka_harf} onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_harf: e.target.value.toUpperCase() })}
                    placeholder="LAL" maxLength={3}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  <input value={plakaSatiyorum.plaka_no} onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, plaka_no: e.target.value })}
                    placeholder="454" maxLength={4}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                  <div className="flex items-center gap-2">
                    <input type="number" value={plakaSatiyorum.ucret} onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, ucret: e.target.value })}
                      placeholder="1.000.000"
                      className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
                    <span className="text-sm text-gray-500 font-medium">TL</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'aracla_birlikte', label: 'Aracla Birlikte' },
                    { key: 'yol_belgesi_var', label: 'Yol Belgesi Var' },
                    { key: 'noter_satisi', label: 'Noter Satisi' },
                    { key: 'hisseli', label: 'Hisseli' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox"
                        checked={(plakaSatiyorum as any)[item.key]}
                        onChange={(e) => setPlakaSatiyorum({ ...plakaSatiyorum, [item.key]: e.target.checked })}
                        className="accent-[#f97316] w-4 h-4" />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedKategori !== 'plaka_satiyorum' && selectedKategori !== 'hostesim_is' && selectedKategori !== 'soforum_is' && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-gray-700">Guzergah Listesi</h3>
                    <p className="text-xs text-orange-500 mt-1">LUTFEN ASAGIDAN GUZERGAHLARINIZIN BASLANGIC VE BITIS YERLERINI EKLEYİNİZ</p>
                  </div>
                  <button onClick={() => setGuzergahlar([...guzergahlar, bosGuzergah()])}
                    className="flex items-center gap-2 bg-[#1a3c6e] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-900 transition">
                    <Plus size={12} /> Guzergah Ekle
                  </button>
                </div>
                {guzergahlar.map((g, i) => (
                  <GuzergahSatiri key={i} guzergah={g} index={i}
                    onChange={handleGuzergahChange}
                    onRemove={(idx) => setGuzergahlar(guzergahlar.filter((_, ii) => ii !== idx))}
                    showRemove={guzergahlar.length > 1} />
                ))}
              </div>
            )}

            {(selectedKategori === 'hostesim_is' || selectedKategori === 'soforum_is') && (
              <KonumBilgisi
                il={konumIl} ilce={konumIlce} mah={konumMah}
                giris={konumGiris} cikis={konumCikis}
                onIlChange={setKonumIl} onIlceChange={setKonumIlce} onMahChange={setKonumMah}
                onGirisChange={setKonumGiris} onCikisChange={setKonumCikis}
              />
            )}

            {(selectedKategori === 'hostesim_is' || selectedKategori === 'soforum_is') && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-gray-700 mb-4">Kisisel Bilgiler</h3>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      {profilResimUrl ? (
                        <img src={profilResimUrl} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      )}
                    </div>
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                      Dosya Sec
                      <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleProfilResimSec} className="hidden" />
                    </label>
                    {profilResim && <p className="text-xs text-green-600 text-center">{profilResim.name}</p>}
                    <p className="text-xs text-gray-400 text-center">Maks 20MB, JPEG/PNG/GIF</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-xl p-4 md:p-5">
              <h3 className="font-bold text-gray-700 mb-3">İlan Detayi</h3>
              <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)}
                placeholder="İlan detaylarini yazin..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAdim(1)} className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:border-gray-400 transition flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Geri
              </button>
              <button onClick={() => { if (!aciklama) { setHata('Ilan detayi zorunludur.'); return; } setHata(''); setAdim(3); }}
                className="flex-1 bg-[#1a3c6e] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition flex items-center justify-center gap-2">
                Onizleme <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {adim === 3 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">Ilan Onizleme</h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="mb-3">
                <span className={`${kategoriRenk[selectedKategori!]} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                  {selectedKategoriLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{aciklama}</p>
              {guzergahlar.length > 0 && guzergahlar[0].kalkis_il && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-200 rounded min-w-max">
                    <thead>
                      <tr className="bg-[#1a3c6e] text-white">
                        <th className="px-2 py-1 text-left">Giris</th>
                        <th className="px-2 py-1 text-left">Nereden</th>
                        <th className="px-2 py-1 text-left">Nereye</th>
                        <th className="px-2 py-1 text-left">Cikis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guzergahlar.map((g, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-2 py-1 font-medium text-[#1a3c6e]">{g.giris_saati || '--:--'}</td>
                          <td className="px-2 py-1">{g.kalkis_mah} {g.kalkis_ilce} / {g.kalkis_il}</td>
                          <td className="px-2 py-1">{g.varis_mah} {g.varis_ilce} / {g.varis_il}</td>
                          <td className="px-2 py-1 font-medium text-[#1a3c6e]">{g.cikis_saati || '--:--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAdim(2)} className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:border-gray-400 transition flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Duzenle
              </button>
              <button onClick={handleYayinla} disabled={yukleniyor}
                className="flex-1 bg-[#f97316] text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <Check size={16} />
                {yukleniyor ? 'Yayinlaniyor...' : 'İlani Kaydet ve Yayinla'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
