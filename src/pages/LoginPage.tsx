import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { girisYap } from '../lib/auth';

export default function LoginPage({
  onLogin,
  onGoRegister,
  onGoHome,
}: {
  onLogin: () => void;
  onGoRegister: () => void;
  onGoHome: () => void;
}) {
  const [telefon, setTelefon] = useState('');
  const [sifre, setSifre] = useState('');
  const [beniHatirla, setBeniHatirla] = useState(false);
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleLogin = async () => {
    if (!telefon || !sifre) {
      setHata('Telefon ve sifre alanlari bos birakilamaz.');
      return;
    }
    setYukleniyor(true);
    setHata('');
    const { error } = await girisYap(telefon, sifre);
    setYukleniyor(false);
    if (error) {
      setHata('Telefon numarasi veya sifre hatali.');
      return;
    }
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="text-[#1a3c6e]" size={36} />
            <span className="text-[#1a3c6e] font-bold text-2xl">Servis İlanları</span>
          </div>
          <p className="text-gray-500 text-sm">Hesabiniza giris yapin</p>
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {hata}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Telefon Numarasi
            </label>
            <input
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sifre
            </label>
            <div className="relative">
              <input
                type={goster ? 'text' : 'password'}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="Sifrenizi girin"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] pr-16"
              />
              <button
                onClick={() => setGoster(!goster)}
                className="absolute right-3 top-2.5 text-gray-400 text-xs hover:text-gray-600"
              >
                {goster ? 'Gizle' : 'Goster'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={beniHatirla}
                onChange={(e) => setBeniHatirla(e.target.checked)}
                className="accent-[#1a3c6e] w-4 h-4"
              />
              Beni Hatirla
            </label>
            <button className="text-sm text-[#1a3c6e] hover:underline">
              Sifremi Unuttum
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={yukleniyor}
            className="w-full bg-[#1a3c6e] text-white py-3 rounded-lg font-medium hover:bg-blue-900 transition disabled:opacity-50"
          >
            {yukleniyor ? 'Giris yapiliyor...' : 'Giris Yap'}
          </button>

          <div className="text-center text-sm text-gray-500">
            Hesabiniz yok mu?{' '}
            <button
              onClick={onGoRegister}
              className="text-[#f97316] font-medium hover:underline"
            >
              Kayit Ol
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onGoHome}
              className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
            >
              Ana sayfaya don
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
