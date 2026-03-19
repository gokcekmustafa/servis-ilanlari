import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { KategoriType } from '../types';
import { ilceler } from '../data/ilceler';
import { ilanEkle } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';

const kategoriler = [
  {
    id: 'isim_var_arac' as KategoriType,
    label: 'Isim Var Arac Ariyorum',
    color: 'border-blue-400 bg-blue-50 text-blue-700',
  },
  {
    id: 'aracim_var_is' as KategoriType,
    label: 'Aracim Var Is Ariyorum',
    color: 'border-green-400 bg-green-50 text-green-700',
  },
  {
    id: 'sofor_ariyorum' as KategoriType,
    label: 'Sofor Ariyorum',
    color: 'border-orange-400 bg-orange-50 text-orange-700',
  },
  {
    id: 'hostes_ariyorum' as KategoriType,
    label: 'Hostes Ariyorum',
    color: 'border-purple-400 bg-purple-50 text-purple-700',
  },
  {
    id: 'hostesim_is' as KategoriType,
    label: 'Hostesim Is Ariyorum',
    color: 'border-pink-400 bg-pink-50 text-pink-700',
  },
  {
    id: 'soforum_is' as KategoriType,
    label: 'Soforum Is Ariyorum',
    color: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  },
  {
    id: 'plaka_satiyorum' as KategoriType,
    label: 'Plakami Satiyorum',
    color: 'border-red-400 bg-red-50 text-red-700',
  },
];

const servisTurleri = ['Personel', 'Okul', 'Turizm'];
const iller = Object.keys(ilceler);

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
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(
    null
  );
  const [form, setForm] = useState({
    aciklama: '',
    servisTuru: [] as string[],
    giris_saati: '',
    cikis_saati: '',
    kalkis_il: '',
    kalkis_ilce: '',
    kalkis_mah: '',
    varis_il: '',
    varis_ilce: '',
    varis_mah: '',
    ilan_veren: '',
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleServisTuru = (tur: string) => {
    if (form.servisTuru.includes(tur)) {
      setForm({
        ...form,
        servisTuru: form.servisTuru.filter((t) => t !== tur),
      });
    } else {
      setForm({ ...form, servisTuru: [...form.servisTuru, tur] });
    }
  };

  const handleAdim1 = () => {
    if (!selectedKategori) {
      setHata('Lutfen bir kategori secin.');
      return;
    }
    setHata('');
    setAdim(2);
  };

  const handleAdim2 = () => {
    if (
      !form.aciklama ||
      !form.kalkis_il ||
      !form.varis_il ||
      !form.ilan_veren
    ) {
      setHata('Lutfen zorunlu alanlari doldurun.');
      return;
    }
    setHata('');
    setAdim(3);
  };

  const handleYayinla = async () => {
    setYukleniyor(true);
    const user = await mevcutKullanici();
    const { error } = await ilanEkle({
      kategori: selectedKategori!,
      servis_turu: form.servisTuru,
      aciklama: form.aciklama,
      ilan_veren: form.ilan_veren,
      user_id: user?.id || userId,
      guzergahlar: [
        {
          giris_saati: form.giris_saati,
          kalkis_il: form.kalkis_il,
          kalkis_ilce: form.kalkis_ilce,
          kalkis_mah: form.kalkis_mah,
          varis_il: form.varis_il,
          varis_ilce: form.varis_ilce,
          varis_mah: form.varis_mah,
          cikis_saati: form.cikis_saati,
        },
      ],
    });
    setYukleniyor(false);
    if (error) {
      setHata('İlan eklenirken hata olustu: ' + error.message);
      return;
    }
    onSuccess();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition"
      >
        <ArrowLeft size={16} />
        Geri Don
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-[#1a3c6e] mb-6">
          Ucretsiz Ilan Ver
        </h2>

        <div className="flex items-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    adim > s
                      ? 'bg-green-500 text-white'
                      : adim === s
                      ? 'bg-[#1a3c6e] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {adim > s ? <Check size={14} /> : s}
                </div>
                <span
                  className={`text-sm font-medium ${
                    adim === s ? 'text-[#1a3c6e]' : 'text-gray-400'
                  }`}
                >
                  {s === 1 ? 'Kategori' : s === 2 ? 'Detaylar' : 'Onizleme'}
                </span>
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-3 rounded ${
                    adim > s ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {hata}
          </div>
        )}

        {adim === 1 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">
              Ilan kategorisini secin
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {kategoriler.map((kat) => (
                <button
                  key={kat.id}
                  onClick={() => setSelectedKategori(kat.id)}
                  className={`border-2 rounded-xl p-4 text-sm font-medium text-left transition ${
                    selectedKategori === kat.id
                      ? kat.color + ' border-2'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {kat.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdim1}
              className="w-full bg-[#1a3c6e] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition flex items-center justify-center gap-2"
            >
              Devam Et
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {adim === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-700">
              Ilan detaylarini girin
            </h3>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                İlan Veren Adi <span className="text-red-500">*</span>
              </label>
              <input
                value={form.ilan_veren}
                onChange={(e) =>
                  setForm({ ...form, ilan_veren: e.target.value })
                }
                placeholder="Firma veya bireysel adiniz"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Ilan Aciklamasi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.aciklama}
                onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                placeholder="Ilan detaylarini yazin..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Servis Turu
              </label>
              <div className="flex gap-3">
                {servisTurleri.map((tur) => (
                  <button
                    key={tur}
                    onClick={() => handleServisTuru(tur)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      form.servisTuru.includes(tur)
                        ? 'bg-[#1a3c6e] text-white border-[#1a3c6e]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {tur}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Giris Saati
                </label>
                <input
                  type="time"
                  value={form.giris_saati}
                  onChange={(e) =>
                    setForm({ ...form, giris_saati: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cikis Saati
                </label>
                <input
                  type="time"
                  value={form.cikis_saati}
                  onChange={(e) =>
                    setForm({ ...form, cikis_saati: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                Kalkis Bilgileri
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Il <span className="text-red-500">*</span>
                  </label>
                  <select
  value={form.kalkis_il}
  onChange={(e) => setForm({ ...form, kalkis_il: e.target.value, kalkis_ilce: '' })}
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  >
                    <option value="">Secin</option>
                    {iller.map((il) => (
                      <option key={il} value={il}>
                        {il}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Ilce
                  </label>
                  <select
  value={form.kalkis_ilce}
  onChange={(e) => setForm({ ...form, kalkis_ilce: e.target.value })}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
  disabled={!form.kalkis_il}
>
  <option value="">Secin</option>
  {form.kalkis_il && (ilceler[form.kalkis_il] || []).map((ilce) => (
    <option key={ilce} value={ilce}>{ilce}</option>
  ))}
</select>
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Mahalle
                  </label>
                  <input
                    value={form.kalkis_mah}
                    onChange={(e) =>
                      setForm({ ...form, kalkis_mah: e.target.value })
                    }
                    placeholder="Mahalle"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                Varis Bilgileri
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Il <span className="text-red-500">*</span>
                  </label>
                  <select
  value={form.varis_il}
  onChange={(e) => setForm({ ...form, varis_il: e.target.value, varis_ilce: '' })}
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  >
                    <option value="">Secin</option>
                    {iller.map((il) => (
                      <option key={il} value={il}>
                        {il}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Ilce
                  </label>
                  <select
  value={form.varis_ilce}
  onChange={(e) => setForm({ ...form, varis_ilce: e.target.value })}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
  disabled={!form.varis_il}
>
  <option value="">Secin</option>
  {form.varis_il && (ilceler[form.varis_il] || []).map((ilce) => (
    <option key={ilce} value={ilce}>{ilce}</option>
  ))}
</select>
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Mahalle
                  </label>
                  <input
                    value={form.varis_mah}
                    onChange={(e) =>
                      setForm({ ...form, varis_mah: e.target.value })
                    }
                    placeholder="Mahalle"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdim(1)}
                className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:border-gray-400 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Geri
              </button>
              <button
                onClick={handleAdim2}
                className="flex-1 bg-[#1a3c6e] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition flex items-center justify-center gap-2"
              >
                Onizleme
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {adim === 3 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-4">Ilan Onizleme</h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {kategoriler.find((k) => k.id === selectedKategori)?.label}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2 font-medium">
                {form.ilan_veren}
              </p>
              <p className="text-sm text-gray-600 mb-4">{form.aciklama}</p>
              <table className="w-full text-xs border border-gray-200 rounded">
                <thead>
                  <tr className="bg-[#1a3c6e] text-white">
                    <th className="px-2 py-1 text-left">Giris</th>
                    <th className="px-2 py-1 text-left">Nereden</th>
                    <th className="px-2 py-1 text-left">Nereye</th>
                    <th className="px-2 py-1 text-left">Cikis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-2 py-1 font-medium text-[#1a3c6e]">
                      {form.giris_saati || '--:--'}
                    </td>
                    <td className="px-2 py-1">
                      {form.kalkis_mah} {form.kalkis_ilce} / {form.kalkis_il}
                    </td>
                    <td className="px-2 py-1">
                      {form.varis_mah} {form.varis_ilce} / {form.varis_il}
                    </td>
                    <td className="px-2 py-1 font-medium text-[#1a3c6e]">
                      {form.cikis_saati || '--:--'}
                    </td>
                  </tr>
                </tbody>
              </table>
              {form.servisTuru.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  Servis Turu: {form.servisTuru.join(', ')}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdim(2)}
                className="flex-1 border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-medium hover:border-gray-400 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Duzenle
              </button>
              <button
                onClick={handleYayinla}
                disabled={yukleniyor}
                className="flex-1 bg-[#f97316] text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check size={16} />
                {yukleniyor ? 'Yayinlaniyor...' : 'Yayinla'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
