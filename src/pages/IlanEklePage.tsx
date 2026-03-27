import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { kategoriFormSchema } from '../config/kategoriFormSchema';

type Props = {
  onGoBack?: () => void;
  onSuccess?: () => void;
  userId?: string;
};

export default function IlanEklePage({ onGoBack, onSuccess, userId }: Props) {
  const [selectedKategori, setSelectedKategori] = useState('');
  const [baslik, setBaslik] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from('ilanlar').insert([
      {
        kategori: selectedKategori,
        baslik,
        ekbilgiler: formData,
        user_id: userId || null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      alert('İlan eklenemedi');
      return;
    }

    alert('İlan eklendi');

    if (onSuccess) onSuccess();
  };

  const fields = kategoriFormSchema[selectedKategori] || [];

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">

      {/* GERİ */}
      {onGoBack && (
        <button
          onClick={onGoBack}
          className="text-sm text-blue-600"
        >
          ← Geri
        </button>
      )}

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

      {/* DİNAMİK FORM */}
      {fields.map((field) => (
        <div key={field.name}>
          <label className="text-sm">{field.label}</label>

          {field.type === 'text' && (
            <input
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}

          {field.type === 'number' && (
            <input
              type="number"
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

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
