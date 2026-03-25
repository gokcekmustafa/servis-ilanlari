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
    setOtomatikKapatTimer(ti
