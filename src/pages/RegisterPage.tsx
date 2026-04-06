import React, { useEffect, useState } from 'react';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { kayitOl } from '../lib/auth';
import { ISTANBUL_OKUL_PERSONEL_FIRMALARI } from '../data/kurumsalFirmalar';
import { kurumsalFirmaListesiGetir } from '../lib/platformAyarlar';

type RegisterPageProps = {
  onRegister: () => void;
  onGoLogin: () => void;
  onGoHome: () => void;
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

export default function RegisterPage({ onRegister, onGoLogin, onGoHome }: RegisterPageProps) {
  const [tab, setTab] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [form, setForm] = useState({
  ad: '', firmaSecimi: '', firmaOzel: '', telefon: '',
  email: '', sifre: '', sifre2: '', il: '', sozlesme: false,
});
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [firmaListesi, setFirmaListesi] = useState(ISTANBUL_OKUL_PERSONEL_FIRMALARI);

  useEffect(() => {
    let aktif = true;
    kurumsalFirmaListesiGetir().then((liste) => {
      if (!aktif || !liste?.length) return;
      setFirmaListesi(liste);
    });
    return () => { aktif = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm({ ...form, [target.name]: value });
  };

  const handleRegister = async () => {
    if (!form.telefon || !form.sifre || !form.sifre2) {
      setHata('Lutfen tum zorunlu alanlari doldurun.');
      return;
    }
    if (tab === 'bireysel' && !form.ad.trim()) {
      setHata('Ad Soyad zorunludur.');
      return;
    }
    const seciliKurumsal = firmaListesi.find(f => f.ad === form.firmaSecimi);
    const kurumsalFirmaAdi =
      form.firmaSecimi === '__ozel__'
        ? form.firmaOzel.trim()
        : form.firmaSecimi.trim();
    if (tab === 'kurumsal' && !kurumsalFirmaAdi) {
      setHata('Kurumsal kayit icin lutfen firma secin veya firmanizi yazin.');
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
    const fullName = tab === 'bireysel' ? form.ad.trim() : kurumsalFirmaAdi;
    const { error } = await kayitOl(
      form.telefon,
      form.sifre,
      fullName,
      tab,
      form.il,
      form.email,
      { avatarUrl: tab === 'kurumsal' ? (seciliKurumsal?.logoUrl || '') : '' }
    );
    setYukleniyor(false);
    if (error) {
      setHata(error.message || 'Kayit sirasinda hata olustu.');
      return;
    }
    onRegister();
  };

  const ic = 'w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
  const seciliKurumsalFirma = firmaListesi.find(f => f.ad === form.firmaSecimi);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

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
            <h1 className="text-white font-bold text-base">Yeni Hesap Olusturun</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Ucretsiz kayit olun, hemen ilan verin
            </p>
          </div>

          <div className="p-6">

            {/* TAB */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-5">
              <button
                onClick={() => setTab('bireysel')}
                className={
                  'flex-1 py-2.5 text-sm font-semibold transition ' +
                  (tab === 'bireysel'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50')
                }
              >
                Bireysel
              </button>
              <button
                onClick={() => setTab('kurumsal')}
                className={
                  'flex-1 py-2.5 text-sm font-semibold transition ' +
                  (tab === 'kurumsal'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50')
                }
              >
                Kurumsal
              </button>
            </div>

            {hata && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {hata}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {tab === 'bireysel' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Ad Soyad</label>
                  <input name="ad" value={form.ad} onChange={handleChange}
                    placeholder="Ad Soyadiniz" className={ic} />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Istanbul okul/personel servis firmasi
                  </label>
                  <select
                    name="firmaSecimi"
                    value={form.firmaSecimi}
                    onChange={handleChange}
                    className={ic}
                  >
                    <option value="">Firmayi seciniz</option>
                    {firmaListesi.map((firma) => (
                      <option key={firma.ad} value={firma.ad}>{firma.ad}</option>
                    ))}
                    <option value="__ozel__">Listede yok, firmami kendim yazacagim</option>
                  </select>
                  {form.firmaSecimi === '__ozel__' && (
                    <input
                      name="firmaOzel"
                      value={form.firmaOzel}
                      onChange={handleChange}
                      placeholder="Firmanizin adini yaziniz"
                      className={ic + ' mt-2'}
                    />
                  )}
                  {seciliKurumsalFirma && form.firmaSecimi !== '__ozel__' && (
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Firma web: <a href={seciliKurumsalFirma.web} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">{seciliKurumsalFirma.web}</a>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  E-posta <span className="text-slate-400 font-normal">(opsiyonel)</span>
                </label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="ornek@email.com" className={ic} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Telefon <span className="text-red-400">*</span>
                  </label>
                  <input name="telefon" type="tel" value={form.telefon} onChange={handleChange}
                    placeholder="05XX XXX XX XX" className={ic} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Il</label>
                  <select name="il" value={form.il} onChange={handleChange} className={ic}>
                    <option value="">Seciniz</option>
                    {iller.map((il) => <option key={il} value={il}>{il}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  Sifre <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input name="sifre" type={goster ? 'text' : 'password'}
                    value={form.sifre} onChange={handleChange}
                    placeholder="En az 6 karakter" className={ic + ' pr-10'} />
                  <button
                    onClick={() => setGoster(!goster)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {goster ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                  Sifre Tekrar <span className="text-red-400">*</span>
                </label>
                <input name="sifre2" type="password" value={form.sifre2}
                  onChange={handleChange} placeholder="Sifrenizi tekrar girin" className={ic} />
              </div>

              <label className="flex items-start gap-2.5 text-sm text-slate-500 cursor-pointer mt-1">
                <input type="checkbox" name="sozlesme" checked={form.sozlesme}
                  onChange={handleChange} className="accent-orange-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <a
                    href="/kullanim-kosullari"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-orange-500 font-semibold hover:underline"
                  >
                    Kullanim kosullarini
                  </a>
                  {' '}okudum ve kabul ediyorum
                </span>
              </label>

              <button
                onClick={handleRegister}
                disabled={yukleniyor}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 mt-1"
              >
                {yukleniyor ? 'Kayit yapiliyor...' : 'Kayit Ol'}
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
                onClick={onGoLogin}
                className="w-full border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 py-2.5 rounded-lg font-medium text-sm transition"
              >
                Zaten hesabim var, Giris Yap
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
