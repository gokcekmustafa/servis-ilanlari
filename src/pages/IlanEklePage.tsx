import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KategoriType } from '../types';

type Props = {
  onGoBack?: () => void;
  onSuccess?: () => void;
  userId?: string;
};

const KATEGORILER: { value: KategoriType; label: string }[] = [
  { value: 'isim_var_arac', label: 'İşim Var Araç Arıyorum' },
  { value: 'aracim_var_is', label: 'Aracım Var İş Arıyorum' },
  { value: 'sofor_ariyorum', label: 'Aracım Var Şoför Arıyorum' },
  { value: 'hostes_ariyorum', label: 'Aracım Var Hostes Arıyorum' },
  { value: 'hostesim_is', label: 'Hostesim İş Arıyorum' },
  { value: 'soforum_is', label: 'Şoförüm İş Arıyorum' },
  { value: 'plaka_satiyorum', label: 'Plakamı Satıyorum' },
  { value: 'aracimi_satiyorum', label: 'Aracımı Satıyorum' },
];

const SERVIS_TURLERI = ['Okul Servisi', 'Personel Servisi', 'VIP Transfer', 'Hasta Transferi', 'Diğer'];

type Guzergah = {
  kalkis_il: string;
  kalkis_ilce: string;
  kalkis_mah: string;
  varis_il: string;
  varis_ilce: string;
  varis_mah: string;
  giris_saati: string;
  cikis_saati: string;
};

const bosGuzergah = (): Guzergah => ({
  kalkis_il: '', kalkis_ilce: '', kalkis_mah: '',
  varis_il: '', varis_ilce: '', varis_mah: '',
  giris_saati: '', cikis_saati: '',
});

export default function IlanEklePage({ onGoBack, onSuccess, userId }: Props) {
  const [kategori, setKategori] = useState<KategoriType | ''>('');
  const [ilanVeren, setIlanVeren] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [servisTurleri, setServisTurleri] = useState<string[]>([]);
  const [guzergahlar, setGuzergahlar] = useState<Guzergah[]>([bosGuzergah()]);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Plaka / Araç satış için ek alanlar
  const [ekBilgi, setEkBilgi] = useState<Record<string, string>>({});

  const servisTuruToggle = (tur: string) => {
    setServisTurleri(prev =>
      prev.includes(tur) ? prev.filter(t => t !== tur) : [...prev, tur]
    );
  };

  const guzergahGuncelle = (index: number, alan: keyof Guzergah, deger: string) => {
    setGuzergahlar(prev => prev.map((g, i) => i === index ? { ...g, [alan]: deger } : g));
  };

  const guzergahEkle = () => setGuzergahlar(prev => [...prev, bosGuzergah()]);
  const guzergahSil = (index: number) => setGuzergahlar(prev => prev.filter((_, i) => i !== index));

  // Kategori bazlı ek alanlar
  const ekAlanlar: Record<string, { name: string; label: string; placeholder?: string }[]> = {
    plaka_satiyorum: [
      { name: 'plaka', label: 'Plaka', placeholder: '34 ABC 123' },
      { name: 'fiyat', label: 'Fiyat (TL)', placeholder: '500000' },
    ],
    aracimi_satiyorum: [
      { name: 'marka_model', label: 'Marka / Model', placeholder: 'Mercedes Sprinter' },
      { name: 'yil', label: 'Yıl', placeholder: '2020' },
      { name: 'km', label: 'KM', placeholder: '150000' },
      { name: 'fiyat', label: 'Fiyat (TL)', placeholder: '1200000' },
    ],
  };

  // Güzergah gerektirmeyen kategoriler
  const guzergahsiz = ['plaka_satiyorum', 'aracimi_satiyorum', 'soforum_is', 'hostesim_is'];
  const servisturuGoster = !['plaka_satiyorum', 'aracimi_satiyorum'].includes(kategori);

  const handleSubmit = async () => {
    if (!kategori) return alert('Lütfen kategori seçin');
    if (!ilanVeren.trim()) return alert('Lütfen ad soyad girin');

    setYukleniyor(true);
    const { error } = await supabase.from('ilanlar').insert([{
      kategori,
      ilan_veren: ilanVeren,
      aciklama,
      servis_turu: servisTurleri,
      guzergahlar: guzergahsiz.includes(kategori) ? [] : guzergahlar,
      ekbilgiler: ekBilgi,
      user_id: userId || null,
      created_at: new Date().toISOString(),
    }]);
    setYukleniyor(false);

    if (error) {
      console.error(error);
      alert('İlan eklenemedi: ' + error.message);
      return;
    }
    if (onSuccess) onSuccess();
  };

  const inputCls = "w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f7971e] bg-white";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* GERİ */}
      {onGoBack && (
        <button onClick={onGoBack} className="text-sm text-[#f7971e] font-medium hover:underline">
          ← Geri
        </button>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#f7971e] px-4 py-3">
          <h1 className="text-white font-bold text-base">İlan Ekle</h1>
        </div>

        <div className="p-4 space-y-4">

          {/* KATEGORİ */}
          <div>
            <label className={labelCls}>Kategori *</label>
            <select
              value={kategori}
              onChange={(e) => { setKategori(e.target.value as KategoriType); setEkBilgi({}); }}
              className={inputCls}
            >
              <option value="">Kategori seçin</option>
              {KATEGORILER.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          {kategori && (
            <>
              {/* AD SOYAD */}
              <div>
                <label className={labelCls}>Ad Soyad *</label>
                <input
                  value={ilanVeren}
                  onChange={(e) => setIlanVeren(e.target.value)}
                  placeholder="Ad Soyad veya Firma Adı"
                  className={inputCls}
                />
              </div>

              {/* SERVİS TÜRÜ */}
              {servisturuGoster && (
                <div>
                  <label className={labelCls}>Servis Türü</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVIS_TURLERI.map(tur => (
                      <button
                        key={tur}
                        type="button"
                        onClick={() => servisTuruToggle(tur)}
                        className={`text-xs px-3 py-1.5 rounded border font-medium transition ${
                          servisTurleri.includes(tur)
                            ? 'bg-[#f7971e] text-white border-[#f7971e]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#f7971e]'
                        }`}
                      >
                        {tur}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GÜZERGAHLAR */}
              {!guzergahsiz.includes(kategori) && (
                <div>
                  <label className={labelCls}>Güzergahlar</label>
                  <div className="space-y-3">
                    {guzergahlar.map((g, i) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-500">Güzergah {i + 1}</span>
                          {guzergahlar.length > 1 && (
                            <button onClick={() => guzergahSil(i)} className="text-xs text-red-400 hover:text-red-600">Sil</button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Kalkış İl</label>
                            <input value={g.kalkis_il} onChange={e => guzergahGuncelle(i, 'kalkis_il', e.target.value)} placeholder="İstanbul" className={inputCls} />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Kalkış İlçe</label>
                            <input value={g.kalkis_ilce} onChange={e => guzergahGuncelle(i, 'kalkis_ilce', e.target.value)} placeholder="Kadıköy" className={inputCls} />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Kalkış Mah.</label>
                            <input value={g.kalkis_mah} onChange={e => guzergahGuncelle(i, 'kalkis_mah', e.target.value)} placeholder="Moda Mah." className={inputCls} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Varış İl</label>
                            <input value={g.varis_il} onChange={e => guzergahGuncelle(i, 'varis_il', e.target.value)} placeholder="İstanbul" className={inputCls} />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Varış İlçe</label>
                            <input value={g.varis_ilce} onChange={e => guzergahGuncelle(i, 'varis_ilce', e.target.value)} placeholder="Beşiktaş" className={inputCls} />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Varış Mah.</label>
                            <input value={g.varis_mah} onChange={e => guzergahGuncelle(i, 'varis_mah', e.target.value)} placeholder="Levent Mah." className={inputCls} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Giriş Saati</label>
                            <input type="time" value={g.giris_saati} onChange={e => guzergahGuncelle(i, 'giris_saati', e.target.value)} className={inputCls} />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-medium">Çıkış Saati</label>
                            <input type="time" value={g.cikis_saati} onChange={e => guzergahGuncelle(i, 'cikis_saati', e.target.value)} className={inputCls} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={guzergahEkle}
                      className="w-full text-xs border border-dashed border-[#f7971e] text-[#f7971e] py-2 rounded hover:bg-orange-50 transition font-medium"
                    >
                      + Güzergah Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* KATEGORİYE ÖZEL EK ALANLAR */}
              {ekAlanlar[kategori]?.map(alan => (
                <div key={alan.name}>
                  <label className={labelCls}>{alan.label}</label>
                  <input
                    value={ekBilgi[alan.name] || ''}
                    onChange={(e) => setEkBilgi(prev => ({ ...prev, [alan.name]: e.target.value }))}
                    placeholder={alan.placeholder}
                    className={inputCls}
                  />
                </div>
              ))}

              {/* AÇIKLAMA */}
              <div>
                <label className={labelCls}>Açıklama</label>
                <textarea
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  placeholder="İlanınız hakkında ek bilgi..."
                  rows={3}
                  className={inputCls}
                />
              </div>

              {/* SUBMIT */}
              <button
                onClick={handleSubmit}
                disabled={yukleniyor}
                className="w-full bg-[#f7971e] hover:bg-[#e8881a] disabled:bg-gray-300 text-white font-bold py-3 rounded transition text-sm"
              >
                {yukleniyor ? 'Gönderiliyor...' : 'İlanı Yayınla'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
