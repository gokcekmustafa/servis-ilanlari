import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { kayitOl } from '../lib/auth';

export default function RegisterPage({
  onRegister,
  onGoLogin,
  onGoHome,
}: {
  onRegister: () => void;
  onGoLogin: () => void;
  onGoHome: () => void;
}) {
  const [tab, setTab] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [form, setForm] = useState({
    ad: '',
    firma: '',
    vergiNo: '',
    telefon: '',
    sifre: '',
    sifre2: '',
    il: '',
    sozlesme: false,
  });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm({ ...form, [target.name]: value });
  };

  const handleRegister = async () => {
    if (!form.telefon || !form.sifre || !form.sifre2) {
      setHata('Lutfen tum alanlari doldurun.');
      return;
    }
    if (form.telefon.length < 10) {
      setHata('Gecerli bir telefon numarasi girin.');
      return;
    }
    if (form.sifre !== form.sifre2) {
      setHata('Sifreler esleshmiyor.');
      return;
    }
    if (form.sifre.length < 6) {
      setHata('Sifre en az 6 karakter olmalidir.');
      return;
    }
    if (!form.sozlesme) {
      setHata('Kullanim kosullarini kabul etmelisiniz.');
      return;
    }
    setYukleniyor(true);
    setHata('');
    const fullName = tab === 'bireysel' ? form.ad : form.firma;
    const { error } = await kayitOl(
      form.telefon,
      form.sifre,
      fullName,
      tab,
      form.il
    );
    setYukleniyor(false);
    if (error) {
      setHata(error.message || 'Kayit sirasinda hata olustu.');
      return;
    }
    onRegister();
  };

  const iller = [
    'Adana', 'Adiyaman', 'Afyonkarahisar', 'Agri', 'Aksaray',
    'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
    'Aydin', 'Balikesir', 'Bartin', 'Batman', 'Bayburt',
    'Bilecik', 'Bingol', 'Bitlis', 'Bolu', 'Burdur',
    'Bursa', 'Canakkale', 'Cankiri', 'Corum', 'Denizli',
    'Diyarbakir', 'Duzce', 'Edirne', 'Elazig', 'Erzincan',
    'Erzurum', 'Eskisehir', 'Gaziantep', 'Giresun', 'Gumushane',
    'Hakkari', 'Hatay', 'Igdir', 'Isparta', 'Istanbul',
    'Izmir', 'Kahramanmaras', 'Karabuk', 'Karaman', 'Kars',
    'Kastamonu', 'Kayseri', 'Kilis', 'Kirikkale', 'Kirklareli',
    'Kirsehir', 'Kocaeli', 'Konya', 'Kutahya', 'Malatya',
    'Manisa', 'Mardin', 'Mersin', 'Mugla', 'Mus',
    'Nevsehir', 'Nigde', 'Ordu', 'Osmaniye', 'Rize',
    'Sakarya', 'Samsun', 'Sanliurfa', 'Siirt', 'Sinop',
    'Sirnak', 'Sivas', 'Tekirdag', 'Tokat', 'Trabzon',
    'Tunceli', 'Usak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="text-[#1a3c6e]" size={32} />
            <span className="text-[#1a3c6e] font-bold text-xl">Servis İlanları</span>
          </div>
          <p className="text-gray-500 text-sm">Yeni hesap olusturun</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => setTab('bireysel')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tab === 'bireysel'
                ? 'bg-[#1a3c6e] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Bireysel
          </button>
          <button
            onClick={() => setTab('kurumsal')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              tab === 'kurumsal'
                ? 'bg-[#1a3c6e] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Kurumsal
          </button>
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {hata}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {tab === 'bireysel' ? (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ad Soyad</label>
              <input
                name="ad"
                value={form.ad}
                onChange={handleChange}
                placeholder="Ad Soyadiniz"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Firma Adi</label>
                <input
                  name="firma"
                  value={form.firma}
                  onChange={handleChange}
                  placeholder="Firma Adiniz"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Vergi No</label>
                <input
                  name="vergiNo"
                  value={form.vergiNo}
                  onChange={handleChange}
                  placeholder="Vergi Numarasi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Telefon Numarasi <span className="text-red-500">*</span>
            </label>
            <input
              name="telefon"
              type="tel"
              value={form.telefon}
              onChange={handleChange}
              placeholder="05XX XXX XX XX"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Il</label>
            <select
              name="il"
              value={form.il}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            >
              <option value="">Il Seciniz</option>
              {iller.map((il) => (
                <option key={il} value={il}>{il}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sifre <span className="text-red-500">*</span>
            </label>
            <input
              name="sifre"
              type="password"
              value={form.sifre}
              onChange={handleChange}
              placeholder="En az 6 karakter"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sifre Tekrar <span className="text-red-500">*</span>
            </label>
            <input
              name="sifre2"
              type="password"
              value={form.sifre2}
              onChange={handleChange}
              placeholder="Sifrenizi tekrar girin"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="sozlesme"
              checked={form.sozlesme}
              onChange={handleChange}
              className="accent-[#1a3c6e] w-4 h-4"
            />
            Kullanim kosullarini okudum ve kabul ediyorum
          </label>

          <button
            onClick={handleRegister}
            disabled={yukleniyor}
            className="w-full bg-[#f97316] text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
          >
            {yukleniyor ? 'Kayit yapiliyor...' : 'Kayit Ol'}
          </button>

          <div className="text-center text-sm text-gray-500">
            Zaten hesabiniz var mi?{' '}
            <button
              onClick={onGoLogin}
              className="text-[#1a3c6e] font-medium hover:underline"
            >
              Giris Yap
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
