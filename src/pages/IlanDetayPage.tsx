import React, { useState, useEffect } from 'react';
import { Calendar, User, Bus, ArrowLeft, Phone, Heart, MessageSquare } from 'lucide-react';
import { Ilan, KategoriType } from '../types';
import { favoriEkle, favoriKaldir, favoriKontrol, mesajGonder } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';

const kategoriBadge: Record<KategoriType, { label: string; color: string }> = {
  isim_var_arac: { label: 'ISIM VAR ARAC ARIYORUM', color: 'bg-blue-100 text-blue-800' },
  aracim_var_is: { label: 'ARACIM VAR IS ARIYORUM', color: 'bg-green-100 text-green-800' },
  sofor_ariyorum: { label: 'SOFOR ARIYORUM', color: 'bg-orange-100 text-orange-800' },
  hostes_ariyorum: { label: 'HOSTES ARIYORUM', color: 'bg-purple-100 text-purple-800' },
  hostesim_is: { label: 'HOSTESIM IS ARIYORUM', color: 'bg-pink-100 text-pink-800' },
  soforum_is: { label: 'SOFORUM IS ARIYORUM', color: 'bg-yellow-100 text-yellow-800' },
  plaka_satiyorum: { label: 'PLAKAM SATIYORUM', color: 'bg-red-100 text-red-800' },
};

export default function IlanDetayPage({
  ilan,
  onGoBack,
  onGoLogin,
  isLoggedIn,
}: {
  ilan: Ilan;
  onGoBack: () => void;
  onGoLogin: () => void;
  isLoggedIn: boolean;
}) {
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
    if (!isLoggedIn) {
      onGoLogin();
      return;
    }
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition"
      >
        <ArrowLeft size={16} />
        Ilanlara Geri Don
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`${badge.color} text-xs font-bold px-3 py-1 rounded-full uppercase`}>
            {badge.label}
          </span>
          <button
            onClick={handleFavori}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              isFavori
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
            }`}
          >
            <Heart size={16} className={isFavori ? 'fill-red-500' : ''} />
            {isFavori ? 'Favorilerden Kaldir' : 'Favorilere Ekle'}
          </button>
        </div>

        <p className="text-gray-700 text-base leading-relaxed mb-6">
          {ilan.aciklama}
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#1a3c6e] text-white">
                <th className="px-4 py-3 text-left font-medium">Giris Saati</th>
                <th className="px-4 py-3 text-left font-medium">Nereden</th>
                <th className="px-4 py-3 text-left font-medium">Nereye</th>
                <th className="px-4 py-3 text-left font-medium">Cikis Saati</th>
              </tr>
            </thead>
            <tbody>
              {ilan.guzergahlar.map((g, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-[#1a3c6e]">{g.giris_saati}</td>
                  <td className="px-4 py-3">{g.kalkis_mah} {g.kalkis_ilce} / {g.kalkis_il}</td>
                  <td className="px-4 py-3">{g.varis_mah} {g.varis_ilce} / {g.varis_il}</td>
                  <td className="px-4 py-3 font-medium text-[#1a3c6e]">{g.cikis_saati}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-[#1a3c6e]" />
            <div>
              <p className="text-xs text-gray-400">Ilan Tarihi</p>
              <p className="font-medium">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} className="text-[#1a3c6e]" />
            <div>
              <p className="text-xs text-gray-400">Ilan Veren</p>
              <p className="font-medium">{ilan.ilan_veren}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Bus size={16} className="text-[#1a3c6e]" />
            <div>
              <p className="text-xs text-gray-400">Servis Turu</p>
              <p className="font-medium">{ilan.servis_turu?.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-700 mb-4">İletisim</h3>

        {!isLoggedIn ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm mb-3">
              İlan sahibiyle iletisime gecmek icin giris yapmaniz gerekiyor.
            </p>
            <button
              onClick={onGoLogin}
              className="bg-[#f97316] text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              Giris Yap
            </button>
          </div>
        ) : mesajGonderildi ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Mesajiniz basariyla gonderildi! İlan sahibi en kisa surede size donecek.
          </div>
        ) : (
          <div>
            {!mesajFormuAcik ? (
              <button
                onClick={() => setMesajFormuAcik(true)}
                className="flex items-center gap-2 bg-[#1a3c6e] text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-900 transition"
              >
                <MessageSquare size={18} />
                İlan Sahibine Mesaj Gonder
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  value={mesajMetni}
                  onChange={(e) => setMesajMetni(e.target.value)}
                  placeholder="Mesajinizi yazin..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setMesajFormuAcik(false)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleMesajGonder}
                    disabled={yukleniyor || !mesajMetni.trim()}
                    className="flex-1 bg-[#1a3c6e] text-white py-2.5 rounded-lg font-medium hover:bg-blue-900 transition disabled:opacity-50"
                  >
                    {yukleniyor ? 'Gonderiliyor...' : 'Gonder'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
