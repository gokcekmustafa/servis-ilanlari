import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { SlidersHorizontal, X } from 'lucide-react';

const REKLAM_ARASI = 2;

const kategoriLabel: Record<KategoriType, string> = {
  isim_var_arac: 'Araç Arıyorum',
  aracim_var_is: 'İş Arıyorum',
  sofor_ariyorum: 'Şoför Aranıyor',
  hostes_ariyorum: 'Hostes Aranıyor',
  hostesim_is: 'Hostes İş Arıyor',
  soforum_is: 'Şoför İş Arıyor',
  plaka_satiyorum: 'Plaka Satıyorum',
};

const ANADOLU_ILCELERI = [
  'adalar','atasehir','beykoz','cekmekoy','kadikoy',
  'kartal','maltepe','pendik','sancaktepe','sile',
  'sultanbeyli','tuzla','umraniye','uskudar',
];

function normalizeStr(str: string): string {
  return str.toLowerCase()
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
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{elemanlar}</div>;
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

  const sidebarProps = {
    selectedKategoriler,
    onKategoriChange: setSelectedKategoriler,
    onFilter: () => setAktifKategoriler(selectedKategoriler),
    onClear: () => setAktifKategoriler([]),
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">

        {/* Başlık ve Kategoriler */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
          <h1 className="text-2xl font-bold text-[#1a3c6e] mb-4">İlan Kategorileri</h1>
          <div className="grid grid
