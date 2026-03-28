import React, { useState, useEffect } from 'react';
import { Calendar, User, Bus, ArrowLeft, Heart, MessageSquare, MapPin, Clock, Tag } from 'lucide-react';
import { Ilan, KategoriType } from '../types';
import { favoriEkle, favoriKaldir, favoriKontrol, mesajGonder } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';

type IlanDetayPageProps = {
  ilan: Ilan;
  onGoBack: () => void;
  onGoLogin: () => void;
  isLoggedIn: boolean;
  tumIlanlar?: Ilan[];
};

const kategoriBadge: Record<KategoriType, { label: string; color: string }> = {
  isim_var_arac:   { label: 'Isim Var Arac Ariyorum',  color: 'bg-blue-100 text-blue-800' },
  aracim_var_is:   { label: 'Aracim Var Is Ariyorum',  color: 'bg-green-100 text-green-800' },
  sofor_ariyorum:  { label: 'Sofor Ariyorum',          color: 'bg-orange-100 text-orange-900' },
  hostes_ariyorum: { label: 'Hostes Ariyorum',         color: 'bg-purple-100 text-purple-800' },
  hostesim_is:     { label: 'Hostesim Is Ariyorum',    color: 'bg-pink-100 text-pink-800' },
  soforum_is:      { label: 'Soforum Is Ariyorum',     color: 'bg-yellow-100 text-yellow-800' },
  plaka_satiyorum:  { label: 'Plaka Satılık',        color: 'bg-red-100 text-red-800' },
  aracimi_satiyorum:{ label: 'Araç Satılık',         color: 'bg-teal-100 text-teal-800' },
};

export default function IlanDetayPage({ ilan, onGoBack, onGoLogin, isLoggedIn, tumIlanlar }: IlanDetayPageProps) {
  const badge = kategoriBadge[ilan.kategori];
  const user = mevcutKullanici();
  const [isFavori, setIsFavori] = useState(false);
  const [mesajMetni, setMesajMetni] = useState('');
  const [mesajGonderildi, setMesajGonderildi] = useState(false);
  const [mesajFormuAcik, setMesajFormuAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [iletisimAcik, setIletisimAcik] = useState(false);

  const ucret = ilan.ekbilgiler?.ucret;
  const plakaSatiyormu = ilan.kategori === 'plaka_satiyorum';

  useEffect(() => {
    if (isLoggedIn && user) {
      favoriKontrol(user.id, ilan.id).then(({ isFavori }) => setIsFavori(isFavori));
    }
  }, [isLoggedIn, ilan.id]);

  useEffect(() => {
    document.body.style.overflow = iletisimAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [iletisimAcik]);

  const handleFavori = async () => {
    if (!isLoggedIn) { onGoLogin(); return; }
    if (isFavori) { await favoriKaldir(user.id, ilan.id); setIsFavori(false); }
    else { await favoriEkle(user.id, ilan.id); setIsFavori(true); }
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
      setIletisimAcik(false);
    }
  };

  const IletisimIcerik = () => (
    <>
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
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition"
          >
            Giris Yap
          </button>
        </div>
      ) : mesajGonderildi ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <p className="text-green-700 text-sm font-medium">Mesaj Gonderildi</p>
          <p className="text-green-600 text-xs mt-1">Ilan sahibi en kisa surede size donecek.</p>
        </div>
      ) : mesajFormuAcik ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={mesajMetni}
            onChange={e => setMesajMetni(e.target.value)}
            placeholder="Mesajinizi yazin..."
            rows={5}
            className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <button
            onClick={handleMesajGonder}
            disabled={yukleniyor || !mesajMetni.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            {yukleniyor ? 'Gonderiliyor...' : 'Gonder'}
          </button>
          <button
            onClick={() => setMesajFormuAcik(false)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-medium text-sm transition"
          >
            Iptal
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
  <p className="text-xs text-slate-400 mb-0.5">Ilan Veren</p>
  <p className="text-sm font-semibold text-slate-700">
    {ilan.profiles?.full_name || ilan.ilan_veren}
  </p>
  {ilan.profiles?.phone_number && (
    <p className="text-sm font-bold text-orange-600 mt-1">
      {ilan.profiles.phone_number}
    </p>
  )}
</div>
          <button
            onClick={() => setMesajFormuAcik(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <MessageSquare size={15} /> Mesaj Gonder
          </button>
          <button
            onClick={handleFavori}
            className={'w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border ' +
              (isFavori
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400')}
          >
            <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
            {isFavori ? 'Favorilerden Kaldir' : 'Favoriye Ekle'}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-4 sm:py-6">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">

        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition"
        >
          <ArrowLeft size={15} /> Ilanlara Geri Don
        </button>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">

          {/* SOL - ANA ICERIK */}
          <div className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4">

            {/* BASLIK KARTI */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <span className={badge.color + ' text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide'}>
                  {badge.label}
                </span>
                <button
                  onClick={handleFavori}
                  className={'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex-shrink-0 ' +
                    (isFavori
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400')}
                >
                  <Heart size={13} className={isFavori ? 'fill-red-500 text-red-500' : ''} />
                  {isFavori ? 'Favoride' : 'Favoriye Ekle'}
                </button>
              </div>
              {ilan.aciklama && (
                <p className="text-slate-600 text-sm leading-relaxed">{ilan.aciklama}</p>
              )}
            </div>

            {/* FIYAT - varsa goster */}
            {ucret && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
    <span className="text-sm text-blue-700 font-medium flex items-center gap-2">
      <Tag size={15} /> {ilan.kategori === 'plaka_satiyorum' || ilan.kategori === 'aracimi_satiyorum' ? 'Fiyat' : 'Ücret'}
    </span>
    <span className="text-xl font-bold text-blue-600">
      {Number(ucret).toLocaleString('tr-TR')} TL
    </span>
  </div>
)}

            {/* PLAKA BILGISI - sadece plaka satiyorum */}
            {plakaSatiyormu && ilan.ekbilgiler?.plaka_il && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Plaka Bilgisi
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {ilan.ekbilgiler.plaka_il} {ilan.ekbilgiler.plaka_harf} {ilan.ekbilgiler.plaka_no}
                  </span>
                  {ilan.ekbilgiler.aracla_birlikte && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg">Aracla Birlikte</span>
                  )}
                  {ilan.ekbilgiler.yol_belgesi_var && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg">Yol Belgesi Var</span>
                  )}
                  {ilan.ekbilgiler.noter_satisi && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg">Noter Satisi</span>
                  )}
                  {ilan.ekbilgiler.hisseli && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg">Hisseli</span>
                  )}
                </div>
              </div>
            )}

            {/* GUZERGAH - plaka satiyorum'da gosterme */}
            {!plakaSatiyormu && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-400 px-4 py-2.5 flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">
                    Guzergah Bilgileri
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['Giris Saati', 'Nereden', 'Nereye', 'Cikis Saati'].map(h => (
                          <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ilan.guzergahlar.map((g, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-3 sm:px-4 py-3">
                            <span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm whitespace-nowrap">
                              <Clock size={12} />{g.giris_saati}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-slate-600 text-sm">
                            <span className="whitespace-nowrap">{g.kalkis_mah} {g.kalkis_ilce}</span>
                            {g.kalkis_il && (
                              <span className="text-slate-400 text-xs block sm:inline"> / {g.kalkis_il}</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-slate-600 text-sm">
                            <span className="whitespace-nowrap">{g.varis_mah} {g.varis_ilce}</span>
                            {g.varis_il && (
                              <span className="text-slate-400 text-xs block sm:inline"> / {g.varis_il}</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm whitespace-nowrap">
                              <Clock size={12} />{g.cikis_saati}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ILAN BILGILERI */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: <Calendar size={15} className="text-slate-500" />, label: 'Ilan Tarihi', value: new Date(ilan.created_at).toLocaleDateString('tr-TR') },
                  { icon: <User size={15} className="text-slate-500" />, label: 'Ilan Veren', value: ilan.ilan_veren },
                  { icon: <Bus size={15} className="text-slate-500" />, label: 'Servis Turu', value: ilan.servis_turu?.join(', ') || '-' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SAG - ILETISIM (masaüstü) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-4">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                <MessageSquare size={14} className="text-orange-400" />
                <span className="text-white text-xs font-semibold uppercase tracking-wider">Iletisim</span>
              </div>
              <div className="p-4">
                <IletisimIcerik />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBİL ALT BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-3 z-30 shadow-lg">
        <button
          onClick={handleFavori}
          className={'flex-1 py-3 rounded-xl font-semibold text-sm border transition flex items-center justify-center gap-2 ' +
            (isFavori ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500')}
        >
          <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
          {isFavori ? 'Favoride' : 'Favori'}
        </button>
        <button
          onClick={() => setIletisimAcik(true)}
          className="flex-[2] bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-orange-600"
        >
          <MessageSquare size={15} />
          {mesajGonderildi ? 'Mesaj Gonderildi' : 'Iletisime Gec'}
        </button>
      </div>
      <div className="lg:hidden h-20" />

      {/* MOBİL İLETİŞİM DRAWER */}
      {iletisimAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setIletisimAcik(false)} />
          <div className="bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">Iletisim</p>
              <button
                onClick={() => setIletisimAcik(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
              >
                x
              </button>
            </div>
            <div className="p-4">
              <IletisimIcerik />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
