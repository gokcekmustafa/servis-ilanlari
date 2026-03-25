import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { SlidersHorizontal, X } from 'lucide-react';

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

const ANADOLU_ILCELERI = [
  'adalar', 'atasehir', 'beykoz', 'cekmekoy', 'kadikoy',
  'kartal', 'maltepe', 'pendik', 'sancaktepe', 'sile',
  'sultanbeyli', 'tuzla', 'umraniye', 'uskudar',
];

function normalizeStr(str: string): string {
  return str.toLowerCase()
    .replace(/i/g, 'i').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ğ/g, 'g');
}

function ilceYakasi(ilce: string): string {
  const n = normalizeStr(ilce);
  if (ANADOLU_ILCELERI.includes(n)) return 'anadolu';
  return 'avrupa';
}

type ReklamKartiProps = { reklam: any };

function ReklamKarti({ reklam }: ReklamKartiProps) {
  return (
    <div
      onClick={() => reklam.link_url && window.open(reklam.link_url, '_blank')}
      className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 transition-all"
    >
      <div className="relative">
        <img src={reklam.resim_url} alt={reklam.baslik || 'Reklam'} className="w-full h-20 object-cover" />
        <span className="absolute top-1.5 right-1.5 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">
          Reklam
        </span>
      </div>
    </div>
  );
}

type IlanListesiProps = { ilanlar: Ilan[]; reklamlar: any[]; onDetay: (ilan: Ilan) => void };

function IlanListesi({ ilanlar, reklamlar, onDetay }: IlanListesiProps) {
  const elemanlar: React.ReactNode[] = [];
  ilanlar.forEach((ilan, index) => {
    elemanlar.push(<IlanCard key={'ilan-' + ilan.id} ilan={ilan} onDetay={onDetay} />);
    if ((index + 1) % REKLAM_ARASI === 0 && reklamlar.length > 0) {
      const ri = Math.floor(index / REKLAM_ARASI) % reklamlar.length;
      elemanlar.push(<ReklamKarti key={'reklam-' + index} reklam={reklamlar[ri]} />);
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

  const [selectedSehir, setSelectedSehir] = useState('');
  const [aktifSehir, setAktifSehir] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [aktifIlce, setAktifIlce] = useState('');
  const [selectedYaka, setSelectedYaka] = useState('');
  const [aktifYaka, setAktifYaka] = useState('');

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
    const { data } = await supabase.from('reklamlar').select('*').eq('aktif', true).order('id', { ascending: false });
    if (data) setReklamlar(data);
  };

  const duyuruYukle = async () => {
    const { data } = await supabase.from('duyurular').select('*').eq('aktif', true).limit(1).single();
    if (data) {
      const kapatildi = sessionStorage.getItem('duyuru_kapatildi_' + data.id);
      if (kapatildi) return;
      setDuyuru(data);
      setTimeout(() => setPopupAcik(true), (data.saniye || 2) * 1000);
    }
  };

  useEffect(() => {
    if (!popupAcik || !duyuru) return;
    const sure = (duyuru.goster_sure || 8) * 1000;
    const timer = setTimeout(() => {
      setPopupAcik(false);
      sessionStorage.setItem('duyuru_kapatildi_' + duyuru.id, '1');
    }, sure);
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
    setAktifSehir(selectedSehir);
    setAktifIlce(selectedIlce);
    setAktifYaka(selectedYaka);
    setFiltreAcik(false);
  };

  const handleClear = () => {
    setSelectedKategoriler([]);
    setAktifKategoriler([]);
    setSelectedSehir('');
    setAktifSehir('');
    setSelectedIlce('');
    setAktifIlce('');
    setSelectedYaka('');
    setAktifYaka('');
    setSiralama('yeni');
    setFiltreAcik(false);
  };

  const handleKategoriKaldir = (kategori: KategoriType) => {
    const yeni = aktifKategoriler.filter((k) => k !== kategori);
    setAktifKategoriler(yeni);
    setSelectedKategoriler(yeni);
  };

  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      if (aktifKategoriler.length > 0 && !aktifKategoriler.includes(ilan.kategori)) return false;
      if (aktifSehir) {
        const sehirVar = ilan.guzergahlar.some((g) => g.kalkis_il === aktifSehir);
        if (!sehirVar) return false;
      }
      if (aktifIlce) {
        const ilceVar = ilan.guzergahlar.some((g) => g.kalkis_ilce === aktifIlce);
        if (!ilceVar) return false;
      }
      if (aktifYaka && aktifSehir === 'Istanbul') {
        const yakaVar = ilan.guzergahlar.some((g) =>
          g.kalkis_il === 'Istanbul' &&
          g.kalkis_ilce &&
          ilceYakasi(g.kalkis_ilce) === aktifYaka
        );
        if (!yakaVar) return false;
      }
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const aktifEtiketler = [
    ...aktifKategoriler.map((k) => ({ tip: 'kategori' as const, deger: k, label: kategoriLabel[k] })),
    ...(aktifYaka ? [{ tip: 'yaka' as const, deger: aktifYaka, label: aktifYaka === 'anadolu' ? 'Anadolu Yakasi' : 'Avrupa Yakasi' }] : []),
    ...(aktifIlce ? [{ tip: 'ilce' as const, deger: aktifIlce, label: aktifIlce }] : []),
    ...(aktifSehir && !aktifIlce && !aktifYaka ? [{ tip: 'sehir' as const, deger: aktifSehir, label: aktifSehir }] : []),
  ];

  const sidebarProps = {
    selectedKategoriler,
    onKategoriChange: setSelectedKategoriler,
    onFilter: handleFilter,
    onClear: handleClear,
    siralama,
    onSiralamaChange: setSiralama,
    ilanlar,
    selectedSehir,
    onSehirChange: setSelectedSehir,
    selectedIlce,
    onIlceChange: setSelectedIlce,
    selectedYaka,
    onYakaChange: setSelectedYaka,
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">

  {/* Başlık ve Kategoriler */}
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
    <h1 className="text-2xl font-bold text-[#1a3c6e] mb-4">İlan Kategorileri</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { key: 'isim_var_arac', label: 'Araç Arıyorum', count: 48, color: 'bg-blue-100 text-blue-700' },
        { key: 'aracim_var_is', label: 'İş Arıyorum', count: 124, color: 'bg-green-100 text-green-700' },
        { key: 'sofor_ariyorum', label: 'Şoför Aranıyor', count: 37, color: 'bg-orange-100 text-orange-700' },
        { key: 'soforum_is', label: 'Şoför İş Arıyor', count: 29, color: 'bg-purple-100 text-purple-700' },
      ].map(cat => (
        <button
          key={cat.key}
          onClick={() => setSelectedKategoriler([cat.key as KategoriType])}
          className={`flex flex-col items-center justify-center rounded-lg p-4 font-semibold ${cat.color}`}
        >
          <span>{cat.label}</span>
          <span className="text-sm">{cat.count} ilan</span>
        </button>
      ))}
    </div>
  </div>

  {/* İçerik Alanı */}
  <div className="flex gap-6">
    {/* Sol Panel - Sidebar */}
    <div className="hidden lg:block w-64 flex-shrink-0">
      <Sidebar {...sidebarProps} />
    </div>

    {/* Sağ Panel - İlanlar */}
    <div className="flex-1 min-w-0">
      {/* Sıralama Barı */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 flex items-center overflow-hidden">
        <div className="px-4 py-2.5 border-r border-gray-100 flex-shrink-0">
          <span className="text-xs text-gray-500">
            <span className="text-gray-900 font-bold text-sm">{filtrelenmisIlanlar.length}</span>{' '}
            ilan bulundu
          </span>
        </div>
        <div className="flex items-center flex-1">
          {[
            { val: 'yeni', label: 'Önce En Yeni' },
            { val: 'eski', label: 'Önce En Eski' },
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

      {/* İlan Listesi */}
      {yukleniyor ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filtrelenmisIlanlar.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IlanListesi ilanlar={filtrelenmisIlanlar} reklamlar={reklamlar} onDetay={onIlanDetay} />
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🚌</div>
          <p className="text-base font-medium">Uygun ilan bulunamadı</p>
          <p className="text-sm mt-2">Filtrelerinizi değiştirerek tekrar deneyin</p>
        </div>
      )}
    </div>
  </div>
</div>

