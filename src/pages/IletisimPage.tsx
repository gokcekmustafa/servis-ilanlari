import React, { useState } from 'react';
import { ArrowLeft, MapPin, Mail, Phone } from 'lucide-react';

export default function IletisimPage({ onGoBack }: { onGoBack: () => void }) {
  const [form, setForm] = useState({ ad: '', email: '', mesaj: '' });
  const [gonderildi, setGonderildi] = useState(false);

  const handleGonder = () => {
    if (!form.ad || !form.email || !form.mesaj) return;
    setGonderildi(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">İletisim</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <MapPin size={20} className="text-[#1a3c6e] mt-0.5" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Adres</p>
              <p className="text-xs text-gray-600 mt-1">Saadetdere mah Esenyurt / İSTANBUL</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
            <Mail size={20} className="text-[#f97316] mt-0.5" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Destek Mail</p>
              <p className="text-xs text-gray-600 mt-1">destek@servisilanlari.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <Mail size={20} className="text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800 text-sm">İletisim Mail</p>
              <p className="text-xs text-gray-600 mt-1">info@servisilanlari.com</p>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-gray-700 mb-4">Bize Yazin</h2>
        {gonderildi ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Mesajiniz basariyla gonderildi! En kisa surede donecegiz.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ad Soyad</label>
              <input
                value={form.ad}
                onChange={(e) => setForm({ ...form, ad: e.target.value })}
                placeholder="Adiniz Soyadiniz"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mesaj</label>
              <textarea
                value={form.mesaj}
                onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
                placeholder="Mesajinizi yazin..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
            <button
              onClick={handleGonder}
              className="bg-[#1a3c6e] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition"
            >
              Gonder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
