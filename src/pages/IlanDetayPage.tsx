import React, { useState, useEffect } from 'react';
import { Calendar, User, Bus, ArrowLeft, Heart, MessageSquare, MapPin, Clock, Filter } from 'lucide-react';
import { Ilan, KategoriType } from '../types';
import { favoriEkle, favoriKaldir, favoriKontrol, mesajGonder } from '../lib/ilanlar';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';

type IlanDetayPageProps = {
  ilan: Ilan;
  onGoBack: () => void;
  onGoLogin: () => void;
  isLoggedIn: boolean;
  tumIlanlar: Ilan[];
};

const kategoriBadge: Record<KategoriType, { label: string; color: string }> = {
  isim_var_arac:    { label: 'İsim Var Araç Arıyorum',  color: 'bg-blue-100 text-blue-800' },
  aracim_var_is:    { label: 'Aracım Var İş Arıyorum',  color: 'bg-green-100 text-green-800' },
  sofor_ariyorum:   { label: 'Şoför Arıyorum',          color: 'bg-orange-100 text-orange-900' },
  hostes_ariyorum:  { label: 'Hostes Arıyorum',         color: 'bg-purple-100 text-purple-800' },
  hostesim_is:      { label: 'Hostesim İş Arıyorum',    color: 'bg-pink-100 text-pink-800' },
  soforum_is:       { label: 'Şoförüm İş Arıyorum',     color: 'bg-yellow-100 text-yellow-800' },
  plaka_satiyorum:  { label: 'Plakam Satıyorum',        color: 'bg-red-100 text-red-800' },
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

  // Filtreleme state
  const [kategoriFilter, setKategoriFilter] = useState<KategoriType | ''>('');
  const [ilFilter, setIlFilter] = useState<string>('');

  const [filtreliIlanlar, setFiltreliIlanlar] = useState<Ilan[]>(tumIlanlar);

  useEffect(() => {
    if (isLoggedIn && user) {
      favoriKontrol(user.id, ilan.id).then(({ isFavori }) => setIsFavori(isFavori));
    }
  }, [isLoggedIn, ilan.id]);

  useEffect(() => {
    document.body.style.overflow = iletisimAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [iletisimAcik]);

  // Filtreleme işlemi
  useEffect(() => {
    let result = [...tumIlanlar];
    if (kategoriFilter) result = result.filter(i => i.kategori === kategoriFilter);
    if (ilFilter) result = result.filter(i => i.il?.toLowerCase().includes(ilFilter.toLowerCase()));
    setFiltreliIlanlar(result);
  }, [kategoriFilter, ilFilter, tumIlanlar]);

  const handleFavori = async () => {
    if (!isLoggedIn) { onGoLogin(); return; }
    if (isFavori) { await favoriKaldir(user.id, ilan.id); setIsFavori(false); }
    else { await favoriEkle(user.id, ilan.id); setIsFavori(true); }
  };

  const handleMesajGonder = async () => {
    if (!mesajMetni.trim()) return;
    setYukleniyor(true);
    const { error } = await mesajGonder({ gonderen_id: user.id, alan_id: ilan.user_id, ilan_id: ilan.id, mesaj: mesajMetni });
    setYukleniyor(false);
    if (!error) { setMesajGonderildi(true); setMesajMetni(''); setMesajFormuAcik(false); setIletisimAcik(false); }
  };

  const IletisimIcerik = () => (
    <>
      {!isLoggedIn ? (
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={20} className="text-orange-400" />
          </div>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            İlan sahibiyle iletişime geçmek için giriş yapmanız gerekiyor.
          </p>
          <button onClick={onGoLogin} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition">
            Giriş Yap
          </button>
        </div>
      ) : mesajGonderildi ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <p className="text-green-700 text-sm font-medium">Mesaj Gönderildi</p>
          <p className="text-green-600 text-xs mt-1">İlan sahibi en kısa sürede size dönecek.</p>
        </div>
      ) : mesajFormuAcik ? (
        <div className="flex flex-col gap-3">
          <textarea value={mesajMetni} onChange={e => setMesajMetni(e.target.value)}
            placeholder="Mesajınızı yazın..." rows={5}
            className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          <button onClick={handleMesajGonder} disabled={yukleniyor || !mesajMetni.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50">
            {yukleniyor ? 'Gönderiliyor...' : 'Gönder'}
          </button>
          <button onClick={() => setMesajFormuAcik(false)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-medium text-sm transition">
            İptal
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">İlan Veren</p>
            <p className="text-sm font-semibold text-slate-700">{ilan.ilan_veren}</p>
          </div>
          <button onClick={() => setMesajFormuAcik(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2">
            <MessageSquare size={15} /> Mesaj Gönder
          </button>
          <button onClick={handleFavori}
            className={'w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border ' +
              (isFavori ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400')}>
            <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
            {isFavori ? 'Favorilerden Kaldır' : 'Favoriye Ekle'}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 flex flex-col lg:flex-row gap-4">

        {/* SOL — FİLTRE VE İLAN DETAYI */}
        <div className="flex-1 flex flex-col gap-4">

          {/* FILTRE PANELİ */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} /> <span className="font-semibold text-sm">Filtrele</span>
            </div>
            <div className="flex flex-col gap-3">
              <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value as KategoriType | '')}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Tüm Kategoriler</option>
                {Object.entries(kategoriBadge).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <input type="text" placeholder="Şehir / İlçe" value={ilFilter} onChange={e => setIlFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          {/* İLAN DETAY KARTI */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <span className={badge.color + ' text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide'}>
                {badge.label}
              </span>
              <button onClick={handleFavori}
                className={'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex-shrink-0 ' +
                  (isFavori ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400')}>
                <Heart size={13} className={isFavori ? 'fill-red-500 text-red-500' : ''} />
                {isFavori ? 'Favoride' : 'Favoriye Ekle'}
              </button>
            </div>
            {ilan.aciklama && <p className="text-slate-600 text-sm leading-relaxed">{ilan.aciklama}</p>}
          </div>

          {/* GÜZERGAH TABLOSU */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
              <MapPin size={14} className="text-orange-400" />
              <span className="text-white text-xs font-semibold uppercase tracking-wider">Güzergah Bilgileri</span>
            </div>
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Giriş Saati', 'Nereden', 'Nereye', 'Çıkış Saati'].map(h => (
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
                        {g.kalkis_il && <span className="text-slate-400 text-xs block sm:inline"> / {g.kalkis_il}</span>}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-slate-600 text-sm">
                        <span className="whitespace-nowrap">{g.varis_mah} {g.varis_ilce}</span>
                        {g.varis_il && <span className="text-slate-400 text-xs block sm:inline"> / {g.varis_il}</span>}
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
        </div>

        {/* SAĞ — İLETİŞİM VE BENZER İLANLAR */}
        <div className="hidden lg:flex flex-col w-80 flex-shrink-0 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-4">
            <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
              <MessageSquare size={14} className="text-orange-400" />
              <span className="text-white text-xs font-semibold uppercase tracking-wider">İletişim</span>
            </div>
            <div className="p-4">
              <IletisimIcerik />
            </div>
          </div>

          {/* BENZER İLANLAR */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold mb-2">Benzer İlanlar</p>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {filtreliIlanlar.filter(i => i.id !== ilan.id).map(i => (
                <div key={i.id} className="border border-slate-200 rounded-lg p-2 text-sm hover:bg-slate-50 cursor-pointer">
                  <p className="font-medium">{i.ilan_veren}</p>
                  <p className="text-slate-500 text-xs">{i.aciklama?.slice(0, 40)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBİL ALT BUTON ÇUBUĞU */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex gap-3 z-30 shadow-lg">
        <button onClick={handleFavori}
          className={'flex-1 py-3 rounded-xl font-semibold text-sm border transition flex items-center justify-center gap-2 ' +
            (isFavori ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500')}>
          <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
          {isFavori ? 'Favoride' : 'Favori'}
        </button>
        <button onClick={() => setIletisimAcik(true)}
          className="flex-[2] bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-orange-600">
          <MessageSquare size={15} />
          {mesajGonderildi ? 'Mesaj Gönderildi ✓' : 'İletişime Geç'}
        </button>
      </div>
      <div className="lg:hidden h-20" />

      {iletisimAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setIletisimAcik(false)} />
          <div className="bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">İletişim</p>
              <button onClick={() => setIletisimAcik(false)} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">×</button>
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
