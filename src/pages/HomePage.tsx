import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const REKLAM_ARASI = 2;

const kategoriLabel: Record<KategoriType, string> = {
  isim_var_arac: 'Isim Var Arac Ariyorum',
  aracim_var_is: 'Aracim Var Is Ariyorum',
  sofor_ariyorum: 'Sofor Ariyorum',
  hostes_ariyorum: 'Hostes Ariyorum',
  hostesim_is: 'Hostesim Is Ariyorum',
  soforum_is: 'Soforum Is Ariyorum',
  plaka_satiyorum: 'Plakam Satiyorum',
};

type ReklamKartiProps = {
  reklam: any;
};

function ReklamKarti({ reklam }: ReklamKartiProps) {
  return (
    <div
      onClick={() => reklam.link_url && window.open(reklam.link_url, '_blank')}
      className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 transition-all"
    >
      <div className="relative">
        <img
          src={reklam.resim_url}
          alt={reklam.baslik || 'Reklam'}
          className="w-full h-20 object-cover"
        />
        <span className="absolute top-1.5 right-1.5 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
          Reklam
        </span>
      </div>
    </div>
  );
}

type IlanListesiProps = {
  ilanlar: Ilan[];
  reklamlar: any[];
  onDetay: (ilan: Ilan) => void;
};

function IlanListesi({ ilanlar, reklamlar, onDetay }: IlanListesiProps) {
  const elemanlar: React.ReactNode[] = [];
  ilanlar.forEach((ilan, index) => {
    elemanlar.push(
      <IlanCard key={'ilan-' + ilan.id} ilan={ilan} onDetay={onDetay} />
    );
    const sonrakiAdim = index + 1;
    if (sonrakiAdim % REKLAM_ARASI === 0 && reklamlar.length > 0) {
      const reklamIndex = Math.floor(index / REKLAM_ARASI) % reklamlar.length;
      elemanlar.push(
        <ReklamKarti key={'reklam-' + index} reklam={reklamlar[reklamIndex]} />
      );
    }
  });
  return <div className="flex flex-col gap-2">{elemanlar}</div>;
}

type HomePageProps = {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
};

export default function HomePage({ onGoLogin, onIlanDetay }: HomePageProps) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selectedKategoriler, setSelectedKategoriler] = useState<KategoriType[]>([]);
  const [aktifKategoriler, setAktifKategoriler] = useState<KategoriType[]>([]);
  const [siralama, setSiralama] = useState('yeni');
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);
  const [otomatikKapatTimer, setOtomatikKapatTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [siralamaAcik, setSiralamaAcik] = useState(false);

  useEffect(() => {
    ilanlarYukle();
    reklamlariYukle();
    duyuruYukle();
  }, []);

  useEffect(() => {
    document.body.style.overflow = filtreAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtreAcik]);

  const ilanlarYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await ilanlariGetir();
    if (!error && data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const reklamlariYukle = async () => {
    const { data } = await supabase
      .from('reklamlar')
      .select('*')
      .eq('aktif', true)
      .order('id', { ascending: false });
    if (data) setReklamlar(data);
  };

  const duyuruYukle = async () => {
    const { data } = await supabase
      .from('duyurular')
      .select('*')
      .eq('aktif', true)
      .limit(1)
      .single();
    if (data) {
      const kapatildi = sessionStorage.getItem('duyuru_kapatildi_' + data.id);
      if (kapatildi) return;
      setDuyuru(data);
      setTimeout(() => setPopupAcik(true), (data.saniye || 2) * 1000);
    }
  };

  useEffect(() => {
    if (!popupAcik || !duyuru) return;
    const goruntuleSure = (duyuru.goster_sure || 8) * 1000;
    const timer = setTimeout(() => {
      setPopupAcik(false);
      sessionStorage.setItem('duyuru_kapatildi_' + duyuru.id, '1');
    }, goruntuleSure);
    setOtomatikKapatTimer(timer);
    return () => clearTimeout(timer);
  }, [popupAcik, duyuru]);

  const popupKapat = (kullaniciKapatti: boolean) => {
    if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer);
    setPopupAcik(false);
    if (kullaniciKapatti && duyuru) {
      sessionStorage.setItem('duyuru_kapatildi_' + duyuru.id, '1');
    }
  };

  const handleFilter = () => {
    setAktifKategoriler(selectedKategoriler);
    setFiltreAcik(false);
  };

  const handleClear = () => {
    setSelectedKategoriler([]);
    setAktifKategoriler([]);
    setSiralama('yeni');
    setFiltreAcik(false);
  };

  const handleKategoriKaldir = (kategori: KategoriType) => {
    const yeni = aktifKategoriler.filter((k) => k !== kategori);
    setAktifKategoriler(yeni);
    setSelectedKategoriler(yeni);
  };

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) =>
      aktifKategoriler.length === 0 || aktifKategoriler.includes(ilan.kategori)
    )
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">

        {/* MOBİL FİLTRE BUTONU */}
        <div className="lg:hidden mb-3 flex items-center gap-2">
          <button
            onClick={() => setFiltreAcik(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <SlidersHorizontal size={15} />
            Filtrele
            {aktifKategoriler.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {aktifKategoriler.length}
              </span>
            )}
          </button>
          {aktifKategoriler.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg transition"
            >
              <X size={13} /> Temizle
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">

          {/* MASAÜSTÜ SIDEBAR */}
          <div className="hidden lg:block w-52 flex-shrink-0">
  <Sidebar
    selectedKategoriler={selectedKategoriler}
    onKategoriChange={setSelectedKategoriler}
    onFilter={handleFilter}
    onClear={handleClear}
    siralama={siralama}
    onSiralamaChange={setSiralama}
    ilanlar={ilanlar}
  />
</div>

          {/* SAĞ İÇERİK */}
          <div className="flex-1 min-w-0">

            {/* AKTİF FİLTRE ETİKETLERİ */}
            {aktifKategoriler.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs text-gray-500">Filtreler:</span>
                {aktifKategoriler.map((k) => (
                  <div
                    key={k}
                    className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {kategoriLabel[k]}
                    <button
                      onClick={() => handleKategoriKaldir(k)}
                      className="text-orange-500 hover:text-orange-700 ml-0.5 font-bold leading-none"
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleClear}
                  className="text-xs text-orange-500 hover:text-orange-700 font-medium"
                >
                  Tumunu temizle
                </button>
              </div>
            )}

            {/* SIRALAMA BARI - sahibinden stili */}
            <div className="bg-white border border-gray-200 rounded-lg mb-3 flex items-center overflow-hidden">
              <div className="px-4 py-2.5 border-r border-gray-100 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  <span className="text-gray-900 font-bold text-sm">
                    {filtrelenmisIlanlar.length}
                  </span>{' '}
                  ilan bulundu
                </span>
              </div>

              <div className="flex items-center flex-1">
                {[
                  { val: 'yeni', label: 'Once En Yeni' },
                  { val: 'eski', label: 'Once En Eski' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setSiralama(item.val)}
                    className={
                      'px-4 py-2.5 text-xs font-medium border-r border-gray-100 transition whitespace-nowrap ' +
                      (siralama === item.val
                        ? 'text-orange-500 font-semibold border-b-2 border-b-orange-500 bg-orange-50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* İLAN LİSTESİ */}
            {yukleniyor ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <IlanListesi
                ilanlar={filtrelenmisIlanlar}
                reklamlar={reklamlar}
                onDetay={onIlanDetay}
              />
            ) : (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🚌</div>
                <p className="text-base font-medium">Uygun ilan bulunamadi</p>
                <p className="text-sm mt-2">Filtrelerinizi degistirerek tekrar deneyin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBİL FİLTRE DRAWER */}
      {filtreAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setFiltreAcik(false)} />
          <div className="bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <p className="font-semibold text-gray-800">Filtrele</p>
              <button
                onClick={() => setFiltreAcik(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-4">
              <Sidebar
  selectedKategoriler={selectedKategoriler}
  onKategoriChange={setSelectedKategoriler}
  onFilter={handleFilter}
  onClear={handleClear}
  siralama={siralama}
  onSiralamaChange={setSiralama}
  ilanlar={ilanlar}
/>
            </div>
          </div>
        </div>
      )}

      {/* DUYURU POPUP */}
      {popupAcik && duyuru && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
          onClick={() => popupKapat(true)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md relative shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <OtomatikKapatCubugu sure={duyuru.goster_sure || 8} />
            <button
              onClick={() => popupKapat(true)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full text-lg font-bold transition"
            >
              x
            </button>
            {duyuru.resim_url ? (
              <>
                <img
                  src={duyuru.resim_url}
                  alt={duyuru.baslik || 'Duyuru'}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="p-4 sm:p-5">
                  {duyuru.baslik && (
                    <h2 className="text-base font-bold text-gray-800 mb-1.5">{duyuru.baslik}</h2>
                  )}
                  {duyuru.mesaj && (
                    <p className="text-sm text-gray-500 leading-relaxed">{duyuru.mesaj}</p>
                  )}
                  <button
                    onClick={() => popupKapat(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition mt-4"
                  >
                    Kapat
                  </button>
                </div>
              </>
            ) : (
              <div className="p-5 sm:p-6">
                {duyuru.baslik && (
                  <h2 className="text-base font-bold text-gray-800 mb-2 pr-8">{duyuru.baslik}</h2>
                )}
                {duyuru.mesaj && (
                  <p className="text-sm text-gray-500 leading-relaxed">{duyuru.mesaj}</p>
                )}
                <button
                  onClick={() => popupKapat(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition mt-4"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type OtomatikKapatCubuguProps = {
  sure: number;
};

function OtomatikKapatCubugu({ sure }: OtomatikKapatCubuguProps) {
  const [kalan, setKalan] = React.useState(sure);

  React.useEffect(() => {
    setKalan(sure);
    const interval = setInterval(() => {
      setKalan((prev) => {
        if (prev <= 0.1) { clearInterval(interval); return 0; }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [sure]);

  const yuzde = Math.round((kalan / sure) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 z-20">
      <div
        className="h-full bg-orange-500"
        style={{ width: yuzde + '%', transition: 'width 0.1s linear' }}
      />
    </div>
  );
}
