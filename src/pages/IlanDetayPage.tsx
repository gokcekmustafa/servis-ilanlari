import React, { useState, useEffect } from 'react';
import { Calendar, User, Bus, ArrowLeft, Heart, MessageSquare, MapPin, Clock, Tag, Ruler, Timer, Users, Car, FileText, Award, CheckCircle, ChevronLeft, ChevronRight, X, Images } from 'lucide-react';
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
  isim_var_arac:    { label: 'İşim Var Araç Arıyorum',    color: 'bg-blue-500' },
  aracim_var_is:    { label: 'Aracım Var İş Arıyorum',    color: 'bg-green-500' },
  sofor_ariyorum:   { label: 'Şoför Arıyorum',            color: 'bg-orange-500' },
  hostes_ariyorum:  { label: 'Hostes Arıyorum',           color: 'bg-purple-500' },
  hostesim_is:      { label: 'Hostesim İş Arıyorum',      color: 'bg-pink-500' },
  soforum_is:       { label: 'Şoförüm İş Arıyorum',       color: 'bg-yellow-500' },
  plaka_satiyorum:  { label: 'Plaka Satılık',             color: 'bg-red-500' },
  aracimi_satiyorum:{ label: 'Araç Satılık',              color: 'bg-teal-500' },
};

function BilgiKutusu({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value || value === '-' || value === 'undefined' || value === 'null') return null;
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
      <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function EvetHayirBadge({ label, deger }: { label: string; deger: string }) {
  const evet = deger === 'evet' || deger === 'var';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${evet ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
      {evet ? <CheckCircle size={12} /> : null}
      {label}: {evet ? 'Var' : 'Yok'}
    </div>
  );
}

// ─── Resim Galerisi ───────────────────────────────────────────────────────────
function ResimGalerisi({ resimler }: { resimler: string[] }) {
  const [aktif, setAktif] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!resimler || resimler.length === 0) return null;

  const onceki = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAktif(prev => (prev - 1 + resimler.length) % resimler.length);
  };
  const sonraki = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAktif(prev => (prev + 1) % resimler.length);
  };

  // Klavye desteği lightbox'ta
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onceki();
      if (e.key === 'ArrowRight') sonraki();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, aktif]);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-600 px-4 py-2.5 flex items-center gap-2">
          <Images size={14} className="text-orange-400" />
          <span className="text-white text-xs font-semibold uppercase tracking-wider">Araç Fotoğrafları</span>
          <span className="ml-auto text-white/60 text-xs">{resimler.length} fotoğraf</span>
        </div>

        {/* Ana görsel */}
        <div
          className="relative bg-slate-900 cursor-zoom-in"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={resimler[aktif]}
            alt={`Araç fotoğrafı ${aktif + 1}`}
            className="w-full h-full object-contain"
          />

          {/* Önceki / Sonraki okları */}
          {resimler.length > 1 && (
            <>
              <button
                onClick={onceki}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={sonraki}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Sayaç */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-medium">
            {aktif + 1} / {resimler.length}
          </div>
        </div>

        {/* Küçük resim şeridi */}
        {resimler.length > 1 && (
          <div className="flex gap-1.5 p-2 overflow-x-auto bg-slate-50">
            {resimler.map((url, i) => (
              <button
                key={i}
                onClick={() => setAktif(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                  i === aktif ? 'border-orange-400' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img src={url} alt={`Küçük ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>

          {resimler.length > 1 && (
            <>
              <button
                onClick={onceki}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={sonraki}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={resimler[aktif]}
            alt={`Fotoğraf ${aktif + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {aktif + 1} / {resimler.length}
          </div>

          {/* Küçük thumbnail şeridi */}
          {resimler.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
              {resimler.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setAktif(i); }}
                  className={`w-2 h-2 rounded-full transition ${i === aktif ? 'bg-orange-400' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function IlanDetayPage({ ilan, onGoBack, onGoLogin, isLoggedIn, tumIlanlar }: IlanDetayPageProps) {
  const badge = kategoriBadge[ilan.kategori];
  const user = mevcutKullanici();
  const [isFavori, setIsFavori] = useState(false);
  const [mesajMetni, setMesajMetni] = useState('');
  const [mesajGonderildi, setMesajGonderildi] = useState(false);
  const [mesajFormuAcik, setMesajFormuAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [iletisimAcik, setIletisimAcik] = useState(false);

  const ek = ilan.ekbilgiler || {};
  const ucret = ek.ucret;
  const plakaSatiyormu = ilan.kategori === 'plaka_satiyorum';
  const aracSatiyormu = ilan.kategori === 'aracimi_satiyorum';
  const aracimVarIs = ilan.kategori === 'aracim_var_is';
  const kendiIlani = isLoggedIn && user?.id === ilan.user_id;

  // Resim gösteren kategoriler
  const resimler: string[] = (aracSatiyormu || aracimVarIs || ilan.kategori === 'hostesim_is' || ilan.kategori === 'soforum_is') ? (ek.resimler || []) : [];

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
    if (kendiIlani) return;
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
            <p className="text-sm font-semibold text-slate-700">{ilan.profiles?.full_name || ilan.ilan_veren}</p>
            {ilan.profiles?.phone_number && (
              <p className="text-sm font-bold text-orange-600 mt-1">{ilan.profiles.phone_number}</p>
            )}
          </div>
          {kendiIlani ? (
            <div className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl text-sm text-center">Bu sizin ilanınız</div>
          ) : (
            <button onClick={() => setMesajFormuAcik(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2">
              <MessageSquare size={15} /> Mesaj Gönder
            </button>
          )}
          {!kendiIlani && (
            <button onClick={handleFavori}
              className={'w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border ' +
                (isFavori ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400')}>
              <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
              {isFavori ? 'Favorilerden Kaldır' : 'Favoriye Ekle'}
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-4 sm:py-6">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">

        <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition">
          <ArrowLeft size={15} /> İlanlara Geri Dön
        </button>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">

          {/* SOL - ANA İÇERİK */}
          <div className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4">

            {/* BAŞLIK KARTI */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <div className={`${badge.color} px-4 py-3 flex items-center justify-between`}>
                <span className="text-white text-sm font-bold uppercase tracking-wide">{badge.label}</span>
                {!kendiIlani && (
                  <button onClick={handleFavori}
                    className={'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ' +
                      (isFavori ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white')}>
                    <Heart size={13} className={isFavori ? 'fill-white' : ''} />
                    {isFavori ? 'Favoride' : 'Favoriye Ekle'}
                  </button>
                )}
              </div>
              {ilan.aciklama && (
                <div className="bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">İlan Açıklaması</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{ilan.aciklama}</p>
                </div>
              )}
            </div>

            {/* ── FOTOĞRAF GALERİSİ ── */}
            {resimler.length > 0 && <ResimGalerisi resimler={resimler} />}

            {/* ÜCRET / FİYAT */}
            {ucret && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium flex items-center gap-2">
                  <Tag size={15} /> {plakaSatiyormu || aracSatiyormu ? 'Fiyat' : 'Ücret'}
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {Number(ucret).toLocaleString('tr-TR')} TL
                </span>
              </div>
            )}

            {/* İŞİM VAR ARAÇ ARIYORUM */}
            {ilan.kategori === 'isim_var_arac' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Araç & Sefer Bilgileri</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <BilgiKutusu icon={<Car size={14} />} label="Araç Markası" value={ek.arac_markasi} />
                  <BilgiKutusu icon={<Car size={14} />} label="Model" value={ek.model} />
                  <BilgiKutusu icon={<Calendar size={14} />} label="Araç Yılı" value={ek.arac_yili} />
                  <BilgiKutusu icon={<Users size={14} />} label="Kapasite" value={ek.arac_kapasitesi} />
                  <BilgiKutusu icon={<Users size={14} />} label="Yolcu Sayısı" value={ek.aracki_yolcu_sayisi} />
                  <BilgiKutusu icon={<Ruler size={14} />} label="Toplam KM" value={ek.km ? `${ek.km} km` : ''} />
                  <BilgiKutusu icon={<Timer size={14} />} label="Servis Süresi" value={ek.servis_suresi ? `${ek.servis_suresi} dk` : ''} />
                  <BilgiKutusu icon={<Calendar size={14} />} label="Çalışılacak Gün" value={ek.calisılacak_gun ? `${ek.calisılacak_gun} gün` : ''} />
                </div>
                {ilan.servis_turu && ilan.servis_turu.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">Servis Türü</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ilan.servis_turu.map((t, i) => (
                        <span key={i} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ŞOFÖR ARIYORUM */}
            {ilan.kategori === 'sofor_ariyorum' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Şoför Aranan İlan Detayları</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <BilgiKutusu icon={<Tag size={14} />} label="Ödeme Şekli" value={ek.odeme_sekli} />
                  <BilgiKutusu icon={<Users size={14} />} label="Yolcu Sayısı" value={ek.yolcu_sayisi} />
                  <BilgiKutusu icon={<Ruler size={14} />} label="KM" value={ek.km ? `${ek.km} km` : ''} />
                  <BilgiKutusu icon={<Timer size={14} />} label="Ort. Servis Süresi" value={ek.ortalama_servis_suresi ? `${ek.ortalama_servis_suresi} dk` : ''} />
                  <BilgiKutusu icon={<Calendar size={14} />} label="Çalışılacak Gün" value={ek.calisılacak_gun ? `${ek.calisılacak_gun} gün` : ''} />
                  <BilgiKutusu icon={<Award size={14} />} label="Aranan Tecrübe" value={ek.aranan_tecrube ? `${ek.aranan_tecrube} yıl` : ''} />
                </div>
                {ek.yabanci_diller && ek.yabanci_diller.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">İstenen Yabancı Diller</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ek.yabanci_diller.map((d: string, i: number) => (
                        <span key={i} className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-1 rounded-lg font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOSTES ARIYORUM */}
            {ilan.kategori === 'hostes_ariyorum' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Hostes Aranan İlan Detayları</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <BilgiKutusu icon={<FileText size={14} />} label="Okul Türü" value={ek.okul_turu} />
                  <BilgiKutusu icon={<FileText size={14} />} label="Çalışılacak Okul" value={ek.calisılacak_okul} />
                  <BilgiKutusu icon={<Award size={14} />} label="Aranan Tecrübe" value={ek.aranan_tecrube ? `${ek.aranan_tecrube} yıl` : ''} />
                </div>
                {ek.yabanci_diller && ek.yabanci_diller.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">İstenen Yabancı Diller</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ek.yabanci_diller.map((d: string, i: number) => (
                        <span key={i} className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-lg font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ŞOFÖRÜM İŞ ARIYORUM */}
            {ilan.kategori === 'soforum_is' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Şoför Bilgileri</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <BilgiKutusu icon={<FileText size={14} />} label="Sürücü Belgesi" value={ek.surucubelgesi} />
                  <BilgiKutusu icon={<Calendar size={14} />} label="Ehliyet Tarihi" value={ek.ehliyet_alinma_tarihi} />
                  <BilgiKutusu icon={<FileText size={14} />} label="SRC Belgeleri" value={ek.sinav_belgeleri} />
                  <BilgiKutusu icon={<Calendar size={14} />} label="Doğum Tarihi" value={ek.dogum_tarihi} />
                  <BilgiKutusu icon={<MapPin size={14} />} label="Doğum Yeri" value={ek.dogum_yeri} />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ek.emekli && <EvetHayirBadge label="Emekli" deger={ek.emekli} />}
                  {ek.mesleki_yeterlilik && <EvetHayirBadge label="Mesleki Yeterlilik" deger={ek.mesleki_yeterlilik} />}
                  {ek.sabika_kaydi && <EvetHayirBadge label="Sabıka Kaydı" deger={ek.sabika_kaydi} />}
                  {ek.tam_zamanlimi && <EvetHayirBadge label="Tam Zamanlı" deger={ek.tam_zamanlimi} />}
                  {ek.servis_tasimacilik_deneyimi && <EvetHayirBadge label="Servis Deneyimi" deger={ek.servis_tasimacilik_deneyimi} />}
                  {ek.baska_ise_gider_misiniz && <EvetHayirBadge label="Başka İşe Gider" deger={ek.baska_ise_gider_misiniz} />}
                </div>
                {ek.arac_turu && ek.arac_turu.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">Araç Türü</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ek.arac_turu.map((t: string, i: number) => (
                        <span key={i} className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 py-1 rounded-lg font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {ek.belgeler && ek.belgeler.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">Belgeler</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ek.belgeler.map((b: string, i: number) => (
                        <span key={i} className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-medium">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
                {ek.yabanci_diller && ek.yabanci_diller.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">Yabancı Diller</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ek.yabanci_diller.map((d: string, i: number) => (
                        <span key={i} className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 py-1 rounded-lg font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOSTESİM İŞ ARIYORUM */}
            {ilan.kategori === 'hostesim_is' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Hostes Bilgileri</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <BilgiKutusu icon={<Calendar size={14} />} label="Doğum Tarihi" value={ek.dogum_tarihi} />
                  <BilgiKutusu icon={<MapPin size={14} />} label="Doğum Yeri" value={ek.dogum_yeri} />
                  <BilgiKutusu icon={<Award size={14} />} label="Eğitim Durumu" value={ek.egitim_durumu} />
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ek.servis_tasimacilik_deneyimi && <EvetHayirBadge label="Servis Deneyimi" deger={ek.servis_tasimacilik_deneyimi} />}
                </div>
                {ek.yabanci_diller && ek.yabanci_diller.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">Yabancı Diller</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ek.yabanci_diller.map((d: string, i: number) => (
                        <span key={i} className="text-xs bg-pink-50 border border-pink-200 text-pink-700 px-2.5 py-1 rounded-lg font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ARACIM VAR İŞ ARIYORUM */}
            {ilan.kategori === 'aracim_var_is' && ek.secilen_arac && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Araç Bilgileri</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <BilgiKutusu icon={<Car size={14} />} label="Plaka" value={ek.secilen_arac} />
                  {ek.calisma_yerleri && <BilgiKutusu icon={<MapPin size={14} />} label="Çalışma Yerleri" value={ek.calisma_yerleri} />}
                </div>
              </div>
            )}

            {/* PLAKA SATIYORUM */}
            {plakaSatiyormu && ek.plaka_il && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Plaka Bilgisi</p>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {ek.plaka_il} {ek.plaka_harf} {ek.plaka_no}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ek.aracla_birlikte && <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-lg font-medium">Araçla Birlikte</span>}
                  {ek.yol_belgesi_var && <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-lg font-medium">Yol Belgesi Var</span>}
                  {ek.noter_satisi && <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-lg font-medium">Noter Satışı</span>}
                  {ek.hisseli && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-lg font-medium">Hisseli</span>}
                </div>
              </div>
            )}

            {/* ARACIMI SATIYORUM */}
            {aracSatiyormu && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Araç Bilgileri</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  <BilgiKutusu icon={<Car size={14} />} label="Marka" value={ek.marka} />
                  <BilgiKutusu icon={<Car size={14} />} label="Model" value={ek.model} />
                  <BilgiKutusu icon={<Calendar size={14} />} label="Yıl" value={ek.yil} />
                  <BilgiKutusu icon={<Users size={14} />} label="Koltuk Sayısı" value={ek.koltuk_sayisi} />
                  <BilgiKutusu icon={<Car size={14} />} label="Araç Tipi" value={ek.arac_tipi} />
                  <BilgiKutusu icon={<Ruler size={14} />} label="KM" value={ek.km ? `${Number(ek.km).toLocaleString('tr-TR')} km` : ''} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${ek.hasar_kaydi === 'yok' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    Hasar Kaydı: {ek.hasar_kaydi === 'yok' ? 'Yok' : 'Var'}
                  </span>
                  {ek.noter_satisi && <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-lg font-medium">Noter Satışı</span>}
                  {ek.aracla_birlikte_plaka && <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-lg font-medium">Plakayla Birlikte</span>}
                </div>
              </div>
            )}

            {/* GÜZERGAH */}
            {!plakaSatiyormu && !aracSatiyormu && ilan.guzergahlar && ilan.guzergahlar.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-600 px-4 py-2.5 flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400" />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">Güzergah Bilgileri</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {ilan.kategori === 'aracim_var_is' || ilan.kategori === 'soforum_is' || ilan.kategori === 'hostesim_is'
                          ? ['Başlangıç Saati', 'Boş Olduğu Yer', 'Bitiş Saati'].map(h => (
                              <th key={h} className="px-3 sm:px-4 py-2.5 text-center text-xs font-semibold text-slate-500">{h}</th>
                            ))
                          : (ilan.kategori === 'isim_var_arac'
    ? ['Giriş Saati', 'Nereden', 'Nereye', 'Çıkış Saati', 'Başlangıç', 'Bitiş']
    : ['Giriş Saati', 'Nereden', 'Nereye', 'Çıkış Saati']
  ).map(h => (
                              <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
                            ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {ilan.guzergahlar.map((g, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          {ilan.kategori === 'aracim_var_is' || ilan.kategori === 'soforum_is' || ilan.kategori === 'hostesim_is' ? (
                            <>
                              <td className="px-3 sm:px-4 py-3 text-center"><span className="text-orange-600 font-bold text-sm">{g.giris_saati || '—'}</span></td>
                              <td className="px-3 sm:px-4 py-3 text-center">
                                <p className="font-bold text-slate-700 uppercase">{g.kalkis_mah}</p>
                                {g.kalkis_ilce && <p className="text-xs text-slate-400 uppercase">{g.kalkis_ilce}</p>}
                                {g.kalkis_il && <p className="text-xs text-slate-400 uppercase">{g.kalkis_il}</p>}
                              </td>
                              <td className="px-3 sm:px-4 py-3 text-center"><span className="text-orange-600 font-bold text-sm">{g.cikis_saati || '—'}</span></td>
                            </>
                          ) : (
                            <>
                <td className="px-3 sm:px-4 py-3"><span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm whitespace-nowrap"><Clock size={12} />{g.giris_saati}</span></td>
                <td className="px-3 sm:px-4 py-3 text-slate-600 text-sm"><p className="font-semibold uppercase">{g.kalkis_mah}</p><p className="text-xs text-slate-400">{g.kalkis_ilce}{g.kalkis_il ? ` / ${g.kalkis_il}` : ''}</p></td>
                <td className="px-3 sm:px-4 py-3 text-slate-600 text-sm"><p className="font-semibold uppercase">{g.varis_mah}</p><p className="text-xs text-slate-400">{g.varis_ilce}{g.varis_il ? ` / ${g.varis_il}` : ''}</p></td>
                <td className="px-3 sm:px-4 py-3"><span className="flex items-center gap-1.5 text-orange-600 font-bold text-sm whitespace-nowrap"><Clock size={12} />{g.cikis_saati}</span></td>
                {ilan.kategori === 'isim_var_arac' && (
                  <>
                    <td className="px-3 sm:px-4 py-3"><span className="text-orange-600 font-bold text-sm">{g.baslangic_saati || '—'}</span></td>
                    <td className="px-3 sm:px-4 py-3"><span className="text-orange-600 font-bold text-sm">{g.bitis_saati || '—'}</span></td>
                  </>
                )}
              </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* İLAN BİLGİLERİ */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">İlan Bilgileri</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <BilgiKutusu icon={<Calendar size={14} />} label="İlan Tarihi" value={new Date(ilan.created_at).toLocaleDateString('tr-TR')} />
                <BilgiKutusu icon={<User size={14} />} label="İlan Veren" value={ilan.ilan_veren || ilan.profiles?.full_name || '-'} />
                {ilan.servis_turu && ilan.servis_turu.length > 0 && (
                  <BilgiKutusu icon={<Bus size={14} />} label="Servis Türü" value={ilan.servis_turu.join(', ')} />
                )}
              </div>
            </div>

          </div>

          {/* SAĞ - İLETİŞİM */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-4">
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2">
                <MessageSquare size={14} className="text-orange-400" />
                <span className="text-white text-xs font-semibold uppercase tracking-wider">İletişim</span>
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
        {!kendiIlani && (
          <button onClick={handleFavori}
            className={'flex-1 py-3 rounded-xl font-semibold text-sm border transition flex items-center justify-center gap-2 ' +
              (isFavori ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500')}>
            <Heart size={15} className={isFavori ? 'fill-red-500' : ''} />
            {isFavori ? 'Favoride' : 'Favori'}
          </button>
        )}
        <button onClick={() => setIletisimAcik(true)}
          className="flex-[2] bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-orange-600">
          <MessageSquare size={15} />
          {mesajGonderildi ? 'Mesaj Gönderildi' : 'İletişime Geç'}
        </button>
      </div>
      <div className="lg:hidden h-20" />

      {/* MOBİL İLETİŞİM DRAWER */}
      {iletisimAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setIletisimAcik(false)} />
          <div className="bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">İletişim</p>
              <button onClick={() => setIletisimAcik(false)} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">✕</button>
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
