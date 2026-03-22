import React, { useState, useEffect } from 'react';
import {
  kullaniciIlanlari, ilanSil, araclarGetir, aracEkle, aracSil,
  favorileriGetir, favoriKaldir, gelenMesajlar, okunmamisMesajSayisi,
  mesajOkunduIsaretle, destekGonder
} from '../lib/ilanlar';
import { Ilan } from '../types';
import { ilceler } from '../data/ilceler';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  Eye, Trash2, Plus, Heart, Car, MessageSquare,
  HelpCircle, User, LogOut, Bell
} from 'lucide-react';

type Sekme = 'profil' | 'ilanlar' | 'araclar' | 'mesajlar' | 'favoriler' | 'destek';

type PanelPageProps = {
  onLogout: () => void;
  onIlanEkle: () => void;
  onIlanDetay: (ilan: Ilan) => void;
  userId: string;
};

const iller = Object.keys(ilceler).sort();
const aracTipleri = ['Minibus 16+1', 'Midibus 27+1', 'Otobüs 45+1', 'Sedan', 'Van'];
const markalar = ['Mercedes', 'Ford', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Iveco', 'Temsa', 'Isuzu'];

export default function PanelPage({ onLogout, onIlanEkle, onIlanDetay, userId }: PanelPageProps) {
  const [aktifSekme, setAktifSekme] = useState<Sekme>('profil');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [araclar, setAraclar] = useState<any[]>([]);
  const [favoriler, setFavoriler] = useState<any[]>([]);
  const [mesajlar, setMesajlar] = useState<any[]>([]);
  const [okunmamisSayi, setOkunmamisSayi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basari, setBasari] = useState('');
  const [hata, setHata] = useState('');
  const [aracFormAcik, setAracFormAcik] = useState(false);
  const [destekGonderildi, setDestekGonderildi] = useState(false);
  const [destekForm, setDestekForm] = useState({ konu: '', mesaj: '' });
  const [aracForm, setAracForm] = useState({
    marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: ''
  });

  const user = mevcutKullanici();
  const [profil, setProfil] = useState({
    ad: user?.full_name || '',
    telefon: user?.phone_number || '',
    adres: user?.adres || '',
    il: user?.il || '',
    ilce: user?.ilce || '',
    yeniSifre: '',
  });

  useEffect(() => {
    okunmamisMesajSayisi(userId).then(({ count }) => {
      if (count) setOkunmamisSayi(count);
    });
  }, [userId]);

  useEffect(() => {
    if (aktifSekme === 'ilanlar') ilanlariYukle();
    if (aktifSekme === 'araclar') araclarimYukle();
    if (aktifSekme === 'favoriler') favorileriYukle();
    if (aktifSekme === 'mesajlar') mesajlariYukle();
  }, [aktifSekme]);

  const ilanlariYukle = async () => {
    setYukleniyor(true);
    const { data } = await kullaniciIlanlari(userId);
    if (data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const araclarimYukle = async () => {
    setYukleniyor(true);
    const { data } = await araclarGetir(userId);
    if (data) setAraclar(data);
    setYukleniyor(false);
  };

  const favorileriYukle = async () => {
    setYukleniyor(true);
    const { data } = await favorileriGetir(userId);
    if (data) setFavoriler(data);
    setYukleniyor(false);
  };

  const mesajlariYukle = async () => {
    setYukleniyor(true);
    const { data } = await gelenMesajlar(userId);
    if (data) setMesajlar(data);
    setYukleniyor(false);
  };

  const handleIlanSil = async (id: string) => {
    if (!confirm('Bu ilani silmek istediginizden emin misiniz?')) return;
    const { error } = await ilanSil(id);
    if (!error) setIlanlar(ilanlar.filter((i) => i.id !== id));
  };

  const handleAracEkle = async () => {
    if (!aracForm.marka || !aracForm.model || !aracForm.plaka) {
      setHata('Marka, model ve plaka zorunludur.');
      return;
    }
    setHata('');
    const { data, error } = await aracEkle({ ...aracForm, user_id: userId });
    if (!error && data) {
      setAraclar([...araclar, data[0]]);
      setAracForm({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
      setAracFormAcik(false);
      setBasari('Arac basariyla eklendi!');
      setTimeout(() => setBasari(''), 3000);
    }
  };

  const handleAracSil = async (id: string) => {
    if (!confirm('Bu araci silmek istediginizden emin misiniz?')) return;
    const { error } = await aracSil(id);
    if (!error) setAraclar(araclar.filter((a) => a.id !== id));
  };

  const handleFavoriKaldir = async (ilanId: string) => {
    await favoriKaldir(userId, ilanId);
    setFavoriler(favoriler.filter((f) => f.ilan_id !== ilanId));
  };

  const handleMesajOku = async (mesajId: string) => {
    await mesajOkunduIsaretle(mesajId);
    setMesajlar(mesajlar.map((m) => m.id === mesajId ? { ...m, okundu: true } : m));
    setOkunmamisSayi(Math.max(0, okunmamisSayi - 1));
  };

  const handleProfilGuncelle = async () => {
    setHata('');
    setBasari('');
    const updates: any = {
      full_name: profil.ad,
      adres: profil.adres,
      il: profil.il,
      ilce: profil.ilce,
    };
    if (profil.yeniSifre) {
      const enc = new TextEncoder();
      const data = enc.encode(profil.yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      updates.sifre_acik = profil.yeniSifre;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) {
      setHata('Guncelleme sirasinda hata olustu.');
    } else {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setBasari('Bilgileriniz basariyla guncellendi!');
      setProfil({ ...profil, yeniSifre: '' });
    }
  };

  const handleHesapSil = async () => {
    if (!confirm('Hesabinizi kalici olarak silmek istediginizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('user_id', userId);
    await supabase.from('araclar').delete().eq('user_id', userId);
    await supabase.from('favoriler').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    localStorage.removeItem('user');
    onLogout();
  };

  const handleDestekGonder = async () => {
    if (!destekForm.konu || !destekForm.mesaj) {
      setHata('Konu ve mesaj alanlari zorunludur.');
      return;
    }
    const { error } = await destekGonder({ user_id: userId, ...destekForm });
    if (!error) {
      setDestekGonderildi(true);
      setDestekForm({ konu: '', mesaj: '' });
    }
  };

  const ilceleri = profil.il ? (ilceler[profil.il] || []) : [];

  const ic = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
  const btnO = 'bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition';
  const btnS = 'bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-lg transition';

  const menuItems = [
    { id: 'profil', label: 'Profilim', icon: User },
    { id: 'ilanlar', label: 'Ilanlarim', icon: Eye },
    { id: 'araclar', label: 'Araclarim', icon: Car },
    { id: 'mesajlar', label: 'Mesajlar', icon: MessageSquare, badge: okunmamisSayi },
    { id: 'favoriler', label: 'Favorilerim', icon: Heart },
    { id: 'destek', label: 'Destek', icon: HelpCircle },
  ];

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-52 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

              {/* KULLANICI BILGISI */}
              <div className="bg-slate-800 px-4 py-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                  <User size={18} className="text-white" />
                </div>
                <p className="text-white font-semibold text-sm truncate">
                  {user?.full_name || 'Kullanici'}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {user?.phone_number}
                </p>
              </div>

              {/* MENU */}
              <nav className="py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const aktif = aktifSekme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAktifSekme(item.id as Sekme)}
                      className={
                        'w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition ' +
                        (aktif
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={15} />
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={'text-xs px-1.5 py-0.5 rounded-full font-bold ' +
                          (aktif ? 'bg-white/20 text-white' : 'bg-red-500 text-white')}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* ILAN VER + CIKIS */}
              <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
                <button
                  onClick={onIlanEkle}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} />
                  Ilan Ver
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-red-500 text-xs py-2 rounded-lg hover:bg-red-50 transition"
                >
                  <LogOut size={13} />
                  Cikis Yap
                </button>
              </div>

            </div>
          </aside>

          {/* ANA ICERIK */}
          <main className="flex-1 min-w-0">

            {/* PROFIL */}
            {aktifSekme === 'profil' && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-bold text-slate-800 text-base mb-5">Profil Bilgilerim</h2>
                {basari && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{basari}</div>}
                {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{hata}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Ad Soyad</label>
                    <input className={ic} value={profil.ad}
                      onChange={(e) => setProfil({ ...profil, ad: e.target.value })}
                      placeholder="Ad Soyadiniz" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">GSM Numaraniz</label>
                    <input className={ic + ' bg-slate-50 text-slate-400'} value={profil.telefon} disabled />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Adres</label>
                  <textarea className={ic + ' resize-none'} value={profil.adres}
                    onChange={(e) => setProfil({ ...profil, adres: e.target.value })}
                    placeholder="Adresiniz" rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Il</label>
                    <select className={ic} value={profil.il}
                      onChange={(e) => setProfil({ ...profil, il: e.target.value, ilce: '' })}>
                      <option value="">Seciniz</option>
                      {iller.map((il) => <option key={il} value={il}>{il}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Ilce</label>
                    <select className={ic} value={profil.ilce} disabled={!profil.il}
                      onChange={(e) => setProfil({ ...profil, ilce: e.target.value })}>
                      <option value="">Seciniz</option>
                      {ilceleri.map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Yeni Sifre</label>
                  <input type="password" className={ic + ' max-w-xs'} value={profil.yeniSifre}
                    onChange={(e) => setProfil({ ...profil, yeniSifre: e.target.value })}
                    placeholder="Degistirmek istemiyorsaniz bos birakin" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={handleHesapSil}
                    className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                  >
                    Hesabi Kapat
                  </button>
                  <button onClick={handleProfilGuncelle} className={btnO}>
                    Bilgileri Guncelle
                  </button>
                </div>
              </div>
            )}

            {/* ILANLARIM */}
            {aktifSekme === 'ilanlar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Ilanlarim</h2>
                  <button onClick={onIlanEkle} className={btnO + ' flex items-center gap-1.5'}>
                    <Plus size={14} />
                    Yeni Ilan
                  </button>
                </div>
                {yukleniyor ? (
                  <div className="p-5 flex flex-col gap-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>)}
                  </div>
                ) : ilanlar.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-sm font-medium mb-3">Henuz ilaniniz yok</p>
                    <button onClick={onIlanEkle} className={btnO}>Ilan Ver</button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ilan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Kategori</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tarih</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Durum</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Islem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ilanlar.map((ilan) => (
                        <tr key={ilan.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            <p className="text-slate-700 font-medium text-sm line-clamp-1 max-w-xs">{ilan.aciklama}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {ilan.guzergahlar[0]?.kalkis_ilce} - {ilan.guzergahlar[0]?.varis_ilce}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              {ilan.kategori.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                              (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                              {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => onIlanDetay(ilan)}
                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleIlanSil(ilan.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ARACLARIM */}
            {aktifSekme === 'araclar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Araclarim</h2>
                  <button onClick={() => setAracFormAcik(!aracFormAcik)} className={btnO + ' flex items-center gap-1.5'}>
                    <Plus size={14} />
                    Arac Ekle
                  </button>
                </div>

                {basari && <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{basari}</div>}
                {hata && <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{hata}</div>}

                {aracFormAcik && (
                  <div className="mx-5 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Yeni Arac Ekle</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Marka</label>
                        <select className={ic} value={aracForm.marka}
                          onChange={(e) => setAracForm({ ...aracForm, marka: e.target.value })}>
                          <option value="">Secin</option>
                          {markalar.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Model</label>
                        <input className={ic} value={aracForm.model} placeholder="Sprinter, Transit..."
                          onChange={(e) => setAracForm({ ...aracForm, model: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Yil</label>
                        <input className={ic} value={aracForm.yil} placeholder="2020"
                          onChange={(e) => setAracForm({ ...aracForm, yil: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Plaka</label>
                        <input className={ic} value={aracForm.plaka} placeholder="34 ABC 123"
                          onChange={(e) => setAracForm({ ...aracForm, plaka: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Koltuk Sayisi</label>
                        <input className={ic} value={aracForm.koltuk_sayisi} placeholder="16+1"
                          onChange={(e) => setAracForm({ ...aracForm, koltuk_sayisi: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Arac Tipi</label>
                        <select className={ic} value={aracForm.arac_tipi}
                          onChange={(e) => setAracForm({ ...aracForm, arac_tipi: e.target.value })}>
                          <option value="">Secin</option>
                          {aracTipleri.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAracFormAcik(false)} className={btnS + ' flex-1'}>Iptal</button>
                      <button onClick={handleAracEkle} className={btnO + ' flex-1'}>Kaydet</button>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>)}
                    </div>
                  ) : araclar.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Car size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Henuz arac eklemediniz</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {araclar.map((arac) => (
                        <div key={arac.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Car size={18} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 text-sm">{arac.marka} {arac.model} {arac.yil}</p>
                              <p className="text-xs text-slate-400">{arac.plaka} · {arac.koltuk_sayisi} koltuk · {arac.arac_tipi}</p>
                            </div>
                          </div>
                          <button onClick={() => handleAracSil(arac.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MESAJLAR */}
            {aktifSekme === 'mesajlar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Ilan Mesajlari</h2>
                  {okunmamisSayi > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {okunmamisSayi} okunmamis
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>)}
                    </div>
                  ) : mesajlar.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Henuz mesajiniz yok</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {mesajlar.map((mesaj) => (
                        <div
                          key={mesaj.id}
                          onClick={() => !mesaj.okundu && handleMesajOku(mesaj.id)}
                          className={'border rounded-xl p-4 cursor-pointer transition ' +
                            (mesaj.okundu ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50')}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-700 text-sm">
                                {mesaj.gonderen?.full_name || mesaj.gonderen?.phone_number}
                              </p>
                              <p className="text-xs text-slate-400">{mesaj.ilanlar?.aciklama}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              {!mesaj.okundu && (
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              )}
                              <span className="text-xs text-slate-400">
                                {new Date(mesaj.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{mesaj.mesaj}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FAVORILER */}
            {aktifSekme === 'favoriler' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Favori Ilanlarim</h2>
                </div>
                <div className="p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>)}
                    </div>
                  ) : favoriler.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Heart size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Henuz favori ilaniniz yok</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {favoriler.map((fav) => (
                        <div key={fav.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div>
                            <p className="font-semibold text-slate-700 text-sm line-clamp-1">{fav.ilanlar?.aciklama}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {fav.ilanlar?.ilan_veren} · {fav.ilanlar?.kategori?.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                            <button onClick={() => onIlanDetay(fav.ilanlar)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleFavoriKaldir(fav.ilan_id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                              <Heart size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DESTEK */}
            {aktifSekme === 'destek' && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-bold text-slate-800 text-base mb-5">Destek</h2>
                {destekGonderildi ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-xl font-bold">✓</span>
                    </div>
                    <p className="font-semibold text-green-700 mb-1">Talebiniz Alindi</p>
                    <p className="text-green-600 text-sm mb-4">En kisa surede size donecegiz.</p>
                    <button onClick={() => setDestekGonderildi(false)} className={btnO}>
                      Yeni Talep Gonder
                    </button>
                  </div>
                ) : (
                  <div className="max-w-lg flex flex-col gap-3">
                    {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{hata}</div>}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Konu</label>
                      <input className={ic} value={destekForm.konu} placeholder="Destek konusu"
                        onChange={(e) => setDestekForm({ ...destekForm, konu: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Mesaj</label>
                      <textarea className={ic + ' resize-none'} value={destekForm.mesaj}
                        placeholder="Mesajinizi yazin..." rows={5}
                        onChange={(e) => setDestekForm({ ...destekForm, mesaj: e.target.value })} />
                    </div>
                    <button onClick={handleDestekGonder} className={btnO}>Gonder</button>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
