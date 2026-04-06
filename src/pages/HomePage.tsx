import React, { useState, useEffect } from 'react';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

const REKLAM_ARASI = 2;

// Kategori Kartları - Resimdeki gibi renkli
const kategoriKartlari = [
  { id: 'isim_var_arac' as KategoriType, sayi: 0, label: 'İşim Var\nAraç Arıyorum', bg: 'bg-blue-50', border: 'border-blue-300', num: 'text-blue-700' },
  { id: 'aracim_var_is' as KategoriType, sayi: 0, label: 'Aracım Var\nİş Arıyorum', bg: 'bg-yellow-50', border: 'border-yellow-300', num: 'text-yellow-700' },
  { id: 'sofor_ariyorum' as KategoriType, sayi: 0, label: 'Şoför\nArıyorum', bg: 'bg-green-50', border: 'border-green-300', num: 'text-green-700' },
  { id: 'hostes_ariyorum' as KategoriType, sayi: 0, label: 'Hostes\nArıyorum', bg: 'bg-purple-50', border: 'border-purple-300', num: 'text-purple-700' },
];

type ReklamKartiProps = { reklam: any };

function ReklamKarti({ reklam }: ReklamKartiProps) {
  return (
    <div
      onClick={() => reklam.link_url && window.open(reklam.link_url, '_blank')}
      className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all"
    >
      <div className="relative">
        <img src={reklam.resim_url} alt={reklam.baslik || 'Reklam'} className="w-full h-24 object-cover" />
        <span className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
          Reklam
        </span>
      </div>
    </div>
  );
}

type HomePageProps = {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
};

export default function HomePage({ onGoLogin, onIlanDetay }: HomePageProps) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  // Kategoriler
  const [selectedKategori, setSelectedKategori] = useState<KategoriType | null>(null);
  const [aktifKategori, setAktifKategori] = useState<KategoriType | null>(null);
  
  // Konum Filtreleri
  const [selectedSehir, setSelectedSehir] = useState('');
  const [aktifSehir, setAktifSehir] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [aktifIlce, setAktifIlce] = useState('');
  
  const [siralama, setSiralama] = useState('yeni');
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyuru, setDuyuru] = useState<any>(null);
  const [popupAcik, setPopupAcik] = useState(false);
  const [otomatikKapatTimer, setOtomatikKapatTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [filtrePanelAcik, setFiltrePanelAcik] = useState(true);

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
      if (!kapatildi) {
        setDuyuru(data);
        setTimeout(() => setPopupAcik(true), (data.saniye || 2) * 1000);
      }
    }
  };

  useEffect(() => {
    if (!popupAcik || !duyuru) return;
    const sure = (duyuru.goster_sure || 8) * 1000;
    const timer = setTimeout(() => {
      setPopupAcik(false);
    }, sure);
    setOtomatikKapatTimer(timer);
    return () => clearTimeout(timer);
  }, [popupAcik, duyuru]);

  // Şehir ve ilçeleri hesapla
  const sehirler = Array.from(new Set(
    ilanlar.flatMap(i => i.guzergahlar.map(g => g.kalkis_il).filter(Boolean))
  )).sort();

  const ilceler = selectedSehir 
    ? Array.from(new Set(
        ilanlar
          .flatMap(i => i.guzergahlar.filter(g => g.kalkis_il === selectedSehir).map(g => g.kalkis_ilce))
          .filter(Boolean)
      )).sort()
    : [];

  const handleFilter = () => {
    setAktifKategori(selectedKategori);
    setAktifSehir(selectedSehir);
    setAktifIlce(selectedIlce);
    setFiltreAcik(false);
  };

  const handleClear = () => {
    setSelectedKategori(null);
    setAktifKategori(null);
    setSelectedSehir('');
    setAktifSehir('');
    setSelectedIlce('');
    setAktifIlce('');
    setSiralama('yeni');
  };

  // Filtreleme
  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      if (aktifKategori && ilan.kategori !== aktifKategori) return false;
      if (aktifSehir) {
        const sehirVar = ilan.guzergahlar.some((g) => g.kalkis_il === aktifSehir);
        if (!sehirVar) return false;
      }
      if (aktifIlce) {
        const ilceVar = ilan.guzergahlar.some((g) => g.kalkis_ilce === aktifIlce);
        if (!ilceVar) return false;
      }
      return true;
    })
    .sort((a, b) =>
      siralama === 'yeni'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const kategoriSayilari = (kategori: KategoriType) =>
    ilanlar.filter(i => i.kategori === kategori).length;

  const aktivFiltreVar = !!aktifKategori || !!aktifSehir || !!aktifIlce;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        
        {/* KATEGORİ KARTLARI - Resimdeki gibi */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">İlan Kategorileri</h2>
            <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">
              İlan Ver →
            </a>
          </div>
          <p className="text-xs text-gray-500 mb-4">Toplam {ilanlar.length} ilan</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {kategoriKartlari.map((kat) => {
              const sayi = kategoriSayilari(kat.id);
              const isSelected = selectedKategori === kat.id;
              
              return (
                <button
                  key={kat.id}
                  onClick={() => setSelectedKategori(isSelected ? null : kat.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    isSelected
                      ? `${kat.bg} border-blue-500 shadow-md`
                      : `${kat.bg} border-gray-200 hover:border-gray-300`
                  }`}
                  disabled={sayi === 0}
                  style={{ opacity: sayi === 0 ? 0.5 : 1 }}
                >
                  <div className={`text-2xl font-bold ${kat.num} mb-1`}>{sayi}</div>
                  <div className="text-xs font-semibold text-gray-700 leading-tight whitespace-pre-line">
                    {kat.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobil Filtre Butonu */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button
            onClick={() => setFiltreAcik(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 text-gray-800 py-3 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
          >
            <SlidersHorizontal size={16} /> Filtrele
          </button>
          {aktivFiltreVar && (
            <button
              onClick={handleClear}
              className="px-4 flex items-center gap-1 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <X size={16} /> Temizle
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* SOL: FİLTRELER */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                Filtrele
                {aktivFiltreVar && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Temizle
                  </button>
                )}
              </h3>

              {/* Şehir Filtresi */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-800 mb-2">ŞEHİR</label>
                <select
                  value={selectedSehir}
                  onChange={(e) => {
                    setSelectedSehir(e.target.value);
                    setSelectedIlce('');
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map((sehir) => (
                    <option key={sehir} value={sehir}>{sehir}</option>
                  ))}
                </select>
              </div>

              {/* İlçe Filtresi */}
              {selectedSehir && ilceler.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-800 mb-2">İLÇE</label>
                  <select
                    value={selectedIlce}
                    onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtrele Butonu */}
              <button
                onClick={handleFilter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition text-sm"
              >
                Aramayı Daralt
              </button>
            </div>
          </div>

          {/* SAĞ: ANA İÇERİK */}
          <div className="flex-1 min-w-0">
            
            {/* AKTİF FİLTRELER */}
            {aktivFiltreVar && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 flex-wrap">
                  {aktifKategori && (
                    <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
                      <span className="text-gray-800 font-medium text-sm">{aktifKategori}</span>
                      <button
                        onClick={() => setAktifKategori(null)}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {(aktifSehir || aktifIlce) && (
                    <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm">
                      <span className="text-gray-800 font-medium text-sm">{aktifIlce || aktifSehir}</span>
                      <button
                        onClick={() => {
                          setAktifSehir('');
                          setAktifIlce('');
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SIRALAMA & İLAN SAYISI */}
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                Aktif İlanlar <span className="text-blue-600">{filtrelenmisIlanlar.length}</span>
              </span>
              <select
                value={siralama}
                onChange={(e) => setSiralama(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                <option value="yeni">Önce En Yeni</option>
                <option value="eski">Önce En Eski</option>
              </select>
            </div>

            {/* İLAN LİSTESİ */}
            {yukleniyor ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filtrelenmisIlanlar.length > 0 ? (
              <div className="space-y-3">
                {filtrelenmisIlanlar.map((ilan, idx) => (
                  <React.Fragment key={ilan.id}>
                    <IlanCard ilan={ilan} onDetay={() => onIlanDetay(ilan)} />
                    {(idx + 1) % REKLAM_ARASI === 0 && reklamlar.length > 0 && (
                      <ReklamKarti reklam={reklamlar[idx % reklamlar.length]} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                <div className="text-6xl mb-4">🚌</div>
                <p className="text-lg font-bold text-gray-900 mb-2">Uygun ilan bulunamadı</p>
                <p className="text-sm text-gray-600">Filtrelerinizi değiştirerek tekrar deneyin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBİL FİLTRE DRAWER */}
      {filtreAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setFiltreAcik(false)} />
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-bold text-gray-900">Filtreleri Ayarla</h3>
              <button onClick={() => setFiltreAcik(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Şehir */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">ŞEHİR</label>
                <select
                  value={selectedSehir}
                  onChange={(e) => {
                    setSelectedSehir(e.target.value);
                    setSelectedIlce('');
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Tüm Şehirler</option>
                  {sehirler.map((sehir) => (
                    <option key={sehir} value={sehir}>{sehir}</option>
                  ))}
                </select>
              </div>

              {/* İlçe */}
              {selectedSehir && ilceler.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">İLÇE</label>
                  <select
                    value={selectedIlce}
                    onChange={(e) => setSelectedIlce(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Tüm İlçeler</option>
                    {ilceler.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Butonlar */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={handleFilter}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Aramayı Daralt
                </button>
                {aktivFiltreVar && (
                  <button
                    onClick={handleClear}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 rounded-lg transition"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUYURU POPUP */}
      {popupAcik && duyuru && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
          onClick={() => {
            setPopupAcik(false);
            if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer);
            if (duyuru?.id) sessionStorage.setItem('duyuru_kapatildi_' + duyuru.id, '1');
          }}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md relative shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {duyuru.resim_url && (
              <img src={duyuru.resim_url} alt={duyuru.baslik || 'Duyuru'} className="w-full h-48 sm:h-56 object-cover" />
            )}
            <div className="p-5 sm:p-6">
              {duyuru.baslik && <h2 className="text-lg font-bold text-gray-900 mb-2">{duyuru.baslik}</h2>}
              {duyuru.mesaj && <p className="text-sm text-gray-600 leading-relaxed mb-4">{duyuru.mesaj}</p>}
              <button 
                onClick={() => {
                  setPopupAcik(false);
                  if (otomatikKapatTimer) clearTimeout(otomatikKapatTimer);
                  if (duyuru?.id) sessionStorage.setItem('duyuru_kapatildi_' + duyuru.id, '1');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
