import React, { useState } from 'react';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { girisYap } from '../lib/auth';

type LoginPageProps = {
  onLogin: () => void;
  onGoRegister: () => void;
  onGoHome: () => void;
};

export default function LoginPage({ onLogin, onGoRegister, onGoHome }: LoginPageProps) {
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

  const ic = 'w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div
          className="flex items-center justify-center gap-2 mb-6 cursor-pointer"
          onClick={onGoHome}
        >
          <div className="bg-slate-800 rounded-lg p-1.5">
            <Truck className="text-orange-400" size={24} />
          </div>
          <span className="text-slate-800 font-bold text-2xl tracking-tight">
            salonum<span className="text-orange-500">.site</span>
          </span>
        </div>

        {/* KART */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

          {/* UST SERIT */}
          <div className="bg-slate-800 px-6 py-4">
            <h1 className="text-white font-bold text-base">Hesabiniza Giris Yapin</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Telefon numaraniz ve sifrenizle giris yapin
            </p>
          </div>

          <div className="p-6">
            {hata && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {hata}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  Telefon Numarasi
                </label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className={ic}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  Sifre
                </label>
                <div className="relative">
                  <input
                    type={goster ? 'text' : 'password'}
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Sifrenizi girin"
                    className={ic + ' pr-10'}
                  />
                  <button
                    onClick={() => setGoster(!goster)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {goster ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beniHatirla}
                    onChange={(e) => setBeniHatirla(e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  Beni Hatirla
                </label>
                <button className="text-xs text-slate-400 hover:text-slate-600 transition">
                  Sifremi Unuttum
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={yukleniyor}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
              >
                {yukleniyor ? 'Giris yapiliyor...' : 'Giris Yap'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">veya</span>
                </div>
              </div>

              <button
                onClick={onGoRegister}
                className="w-full border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 py-2.5 rounded-lg font-medium text-sm transition"
              >
                Yeni Hesap Olustur
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={onGoHome}
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            Ana sayfaya don
          </button>
        </div>

      </div>
    </div>
  );
}
