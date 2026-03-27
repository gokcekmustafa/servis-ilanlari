import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function IlanEklePage() {
  const [selectedKategori, setSelectedKategori] = useState<string>('');
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [resimUrl, setResimUrl] = useState('');

  // kategori özel state’ler (senin projene göre genişletebilirsin)
  const [isimVarArac, setIsimVarArac] = useState({});
  const [aracimVarIs, setAracimVarIs] = useState({});
  const [soforAriyorum, setSoforAriyorum] = useState({});
  const [hostesAriyorum, setHostesAriyorum] = useState({});
  const [hostesimIs, setHostesimIs] = useState({});
  const [soforumIs, setSoforumIs] = useState({});
  const [plakaSatiyorum, setPlakaSatiyorum] = useState({});
  const [aracimiSatiyorum, setAracimiSatiyorum] = useState({});

  const handleSubmit = async () => {
    try {
      let ekbilgiler: any = {};

      switch (selectedKategori) {
        case 'isim_var_arac':
          ekbilgiler = isimVarArac;
          break;

        case 'aracim_var_is':
          ekbilgiler = aracimVarIs;
          break;

        case 'sofor_ariyorum':
          ekbilgiler = soforAriyorum;
          break;

        case 'hostes_ariyorum':
          ekbilgiler = hostesAriyorum;
          break;

        case 'hostesim_is':
          ekbilgiler = {
            ...hostesimIs,
            profil_resmi: resimUrl,
          };
          break;

        case 'soforum_is':
          ekbilgiler = {
            ...soforumIs,
            profil_resmi: resimUrl,
          };
          break;

        case 'plaka_satiyorum':
          ekbilgiler = plakaSatiyorum;
          break;

        case 'aracimi_satiyorum':
          ekbilgiler = aracimiSatiyorum;
          break;

        default:
          ekbilgiler = {};
      }

      const { error } = await supabase.from('ilanlar').insert([
        {
          kategori: selectedKategori,
          baslik,
          aciklama,
          resim_url: resimUrl,
          ekbilgiler,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase error:', error);
        alert('İlan eklenemedi');
        return;
      }

      alert('İlan başarıyla eklendi');

      // reset
      setBaslik('');
      setAciklama('');
      setSelectedKategori('');
      setResimUrl('');
    } catch (err) {
      console.error(err);
      alert('Beklenmeyen hata oluştu');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">

      {/* KATEGORİ */}
      <select
        value={selectedKategori}
        onChange={(e) => setSelectedKategori(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">Kategori seç</option>
        <option value="isim_var_arac">İşim Var Araç Arıyorum</option>
        <option value="aracim_var_is">Aracım Var İş Arıyorum</option>
        <option value="sofor_ariyorum">Şoför Arıyorum</option>
        <option value="hostes_ariyorum">Hostes Arıyorum</option>
        <option value="hostesim_is">Hostesim İş Arıyorum</option>
        <option value="soforum_is">Şoförüm İş Arıyorum</option>
        <option value="plaka_satiyorum">Plaka Satıyorum</option>
        <option value="aracimi_satiyorum">Aracımı Satıyorum</option>
      </select>

      {/* BAŞLIK */}
      <input
        value={baslik}
        onChange={(e) => setBaslik(e.target.value)}
        placeholder="Başlık"
        className="w-full border p-2 rounded"
      />

      {/* AÇIKLAMA */}
      <textarea
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        placeholder="Açıklama"
        className="w-full border p-2 rounded"
      />

      {/* RESİM */}
      <input
        value={resimUrl}
        onChange={(e) => setResimUrl(e.target.value)}
        placeholder="Resim URL"
        className="w-full border p-2 rounded"
      />

      {/* KATEGORİ ÖZEL ALAN (SAFE) */}
      {selectedKategori === 'aracimi_satiyorum' && (
        <div className="border p-3 rounded">
          <p className="text-sm text-gray-500">
            Araç satış alanları buraya eklenecek
          </p>
        </div>
      )}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        İlan Ekle
      </button>
    </div>
  );
}
