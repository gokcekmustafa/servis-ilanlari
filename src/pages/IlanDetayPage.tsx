import React, { useState, useEffect } from 'react';
import { Calendar, User, Bus, ArrowLeft, Heart, MessageSquare, MapPin, Clock } from 'lucide-react';
import { Ilan, KategoriType } from '../types';
import { favoriEkle, favoriKaldir, favoriKontrol, mesajGonder } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';

type IlanDetayPageProps = {
  ilan: Ilan;
  onGoBack: () => void;
  onGoLogin: () => void;
  isLoggedIn: boolean;
};

const kategoriBadge: Record<KategoriType, { label: string; color: string }> = {
  isim_var_arac: { label: 'Isim Var Arac Ariyorum', color: 'bg-blue-100 text-blue-800' },
  aracim_var_is: { label: 'Aracim Var Is Ariyorum', color: 'bg-green-100 text-green-800' },
  sofor_ariyorum: { label: 'Sofor Ariyorum', color: 'bg-orange-100 text-orange-900' },
  hostes_ariyorum: { label: 'Hostes Ariyorum', color: 'bg-purple-100 text-purple-800' },
  hostesim_is: { label: 'Hostesim Is Ariyorum', color: 'bg-pink-100 text-pink-800' },
  soforum_is: { label: 'Soforum Is Ariyorum', color: 'bg-yellow-100 text-yellow-800' },
  plaka_satiyorum: { label: 'Plakam Satiyorum', color: 'bg-red-100 text-red-800' },
};

export default function IlanDetayPage({
  ilan,
  onGoBack,
  onGoLogin,
  isLoggedIn,
}: IlanDetayPageProps) {
  const badge = kategoriBadge[ilan.kategori];
  const user = mevcutKullanici();
  const [isFavori, setIsFavori] = useState(false);
  const [mesajMetni, setMesajMetni] = useState('');
  const [mesajGonderildi, setMesajGonderildi] = useState(false);
  const [mesajFormuAcik, setMesajFormuAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      favoriKontrol(user.id, ilan.id).then(({ isFavori }) => {
        setIsFavori(isFavori);
      });
    }
  }, [isLoggedIn, ilan.id]);

  const handleFavori = async () => {
    if (!isLoggedIn) { onGoLogin(); return; }
    if (isFavori) {
      await favoriKaldir(user.id, ilan.id);
      setIsFavori(false);
    } else {
      await favoriEkle(user.id, ilan.id);
      setIsFavori(true);
    }
  };

  const handleMesajGonder = async () => {
    if (!mesajMetni.trim()) return;
    setYukleniyor(true);
    const { error } = await mesajGonder({
      gonderen_id: user.id,
      alan_id: ilan.user_id,
      ilan_id: ilan.id,
      mesaj: mesajMetni,
    });
    setYukleniyor(false);
    if (!error) {
      setMesajGonderildi(true);
      setMesajMetni('');
      setMesajFormuAcik(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6">
      <div className="max-w-5xl mx-auto px-4">

        {/* GERI DON */}
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition"
        >
          <ArrowLeft size={15} />
          Ilanlara Geri Don
        </button>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* SOL - ANA ICERIK */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* BASLIK KARTI */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className={badge.color + ' text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide'}>
                  {badge.label}
                </span>
                <button
                  onClick={handleFavori}
                  className={
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex-shrink-0 ' +
                    (isFavori
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400')
                  }
                >
                  <Heart size={13} className={isFavori ? 'fill-red-500 text-red-500' : ''} />
                  {isFavori ? 'Favoride' : 'Favoriye Ekle'}
                </button>
              </div>

              {ilan.aciklama && (
                <p className="text-slate-600 text-sm leading-relaxed">
                  {ilan.aciklama}
                </p>
              )}
            </div>

            {/* GUZERGAH TABLOSU */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                <MapPin size={14} className="text-orange-400" />
                <span className="text-white text-xs font-semibold uppercase tracking-wider">
                  Guzergah Bilgileri
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Giris Saati</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Nereden</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Nereye</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Cikis Saati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ilan.guzergahlar.map((g, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm">
                            <Clock size={12} />
                            {g.giris_saati}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {g.kalkis_mah} {g.kalkis_ilce}
                          {g.kalkis_il && <span className="text-slate-400"> / {g.kalkis_il}</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {g.varis_mah} {g.varis_ilce}
                          {g.varis_il && <span className="text-slate-400"> / {g.varis_il}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm">
                            <Clock size={12} />
                            {g.cikis_saati}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ILAN BILGILERI */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ilan Tarihi</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ilan Veren</p>
                    <p className="text-sm font-semibold text-slate-700">{ilan.ilan_veren}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bus size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Servis Turu</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {ilan.servis_turu?.join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SAG - ILETISIM */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-4">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                <MessageSquare size={14} className="text-orange-400" />
                <span className="text-white text-xs font-semibold uppercase tracking-wider">
                  Iletisim
                </span>
              </div>

              <div className="p-4">
                {!isLoggedIn ? (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare size={20} className="text-orange-400" />
                    </div>
                    <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                      Ilan sahibiyle iletisime gecmek icin giris yapmaniz gerekiyor.
                    </p>
                    <button
                      onClick={onGoLogin}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition"
                    >
                      Giris Yap
                    </button>
                  </div>
                ) : mesajGonderildi ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                    <p className="text-green-700 text-sm font-medium">Mesaj Gonderildi</p>
                    <p className="text-green-600 text-xs mt-1">
                      Ilan sahibi en kisa surede size donecek.
                    </p>
                  </div>
                ) : mesajFormuAcik ? (
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={mesajMetni}
                      onChange={(e) => setMesajMetni(e.target.value)}
                      placeholder="Mesajinizi yazin..."
                      rows={5}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    />
                    <button
                      onClick={handleMesajGonder}
                      disabled={yukleniyor || !mesajMetni.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                    >
                      {yukleniyor ? 'Gonderiliyor...' : 'Gonder'}
                    </button>
                    <button
                      onClick={() => setMesajFormuAcik(false)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-lg font-medium text-sm transition"
                    >
                      Iptal
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-0.5">Ilan Veren</p>
                      <p className="text-sm font-semibold text-slate-700">{ilan.ilan_veren}</p>
                    </div>
                    <button
                      onClick={() => setMesajFormuAcik(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={15} />
                      Mesaj Gonder
                    </button>
                    <button
                      onClick={handleFavori}
                      className={
                        'w-full py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 border ' +
                        (isFavori
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400')
                      }
                    >
                      <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
                      {isFavori ? 'Favorilerden Kaldir' : 'Favoriye Ekle'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
