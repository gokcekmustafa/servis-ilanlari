import React, { useState, useEffect } from 'react';
import { kullaniciIlanlari, ilanSil, araclarGetir, aracEkle, aracSil, favorileriGetir, favoriKaldir, gelenMesajlar, okunmamisMesajSayisi, mesajOkunduIsaretle, destekGonder } from '../lib/ilanlar';
import { Ilan } from '../types';
import { ilceler } from '../data/ilceler';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Eye, Trash2, Plus, Bell, Heart, Car, MessageSquare, HelpCircle, User } from 'lucide-react';

const menuItems = [
  { id: 'Profilim', icon: User },
  { id: 'İlanlarım', icon: Eye },
  { id: 'Araçlarım', icon: Car },
  { id: 'İlan Mesajları', icon: MessageSquare },
  { id: 'Favori İlanlarım', icon: Heart },
  { id: 'Destek', icon: HelpCircle },
];

const iller = Object.keys(ilceler).sort();

const aracTipleri = ['Minibus 16+1', 'Midibus 27+1', 'Otobüs 45+1', 'Sedan', 'Van'];
const markalar = ['Mercedes', 'Ford', 'Volkswagen', 'Renault', 'Peugeot', 'Citroen', 'Iveco', 'Temsa', 'Isuzu'];

export default function PanelPage({
  onLogout,
  onIlanEkle,
  onIlanDetay,
  userId,
}: {
  onLogout: () => void;
  onIlanEkle: () => void;
  onIlanDetay: (ilan: Ilan) => void;
  userId: string;
}) {
  const [activeMenu, setActiveMenu] = useState('Profilim');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [araclar, setAraclar] = useState<any[]>([]);
  const [favoriler, setFavoriler] = useState<any[]>([]);
  const [mesajlar, setMesajlar] = useState<any[]>([]);
  const [okunmamisSayi, setOkunmamisSayi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basari, setBasari] = useState('');
  const [hata, setHata] = useState('');
  const [aracForm, setAracForm] = useState({
    marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: ''
  });
  const [aracFormAcik, setAracFormAcik] = useState(false);
  const [destekForm, setDestekForm] = useState({ konu: '', mesaj: '' });
  const [destekGonderildi, setDestekGonderildi] = useState(false);

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
    if (activeMenu === 'İlanlarım') ilanlariYukle();
    if (activeMenu === 'Araçlarım') araclarimYukle();
    if (activeMenu === 'Favori İlanlarım') favorileriYukle();
    if (activeMenu === 'İlan Mesajları') mesajlariYukle();
  }, [activeMenu]);

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

  const handleFavoriKaldir = async (userId: string, ilanId: string) => {
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
      const encoder = new TextEncoder();
      const data = encoder.encode(profil.yeniSifre + 'servis-ilanlari-salt');
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition border relative ${
              activeMenu === item.id
                ? 'bg-[#f97316] text-white border-[#f97316]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            <item.icon size={14} />
            {item.id}
            {item.id === 'İlan Mesajları' && okunmamisSayi > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {okunmamisSayi}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeMenu === 'Profilim' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Profil Bilgileriniz</h2>
          {basari && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{basari}</div>}
          {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{hata}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ad Soyad</label>
              <input
                value={profil.ad}
                onChange={(e) => setProfil({ ...profil, ad: e.target.value })}
                placeholder="Ad Soyadiniz"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">GSM Numaraniz</label>
              <input
                value={profil.telefon}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Adres</label>
            <textarea
              value={profil.adres}
              onChange={(e) => setProfil({ ...profil, adres: e.target.value })}
              placeholder="Adresiniz"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">İl</label>
              <select
                value={profil.il}
                onChange={(e) => setProfil({ ...profil, il: e.target.value, ilce: '' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              >
                <option value="">Seciniz</option>
                {iller.map((il) => <option key={il} value={il}>{il}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">İlçe</label>
              <select
                value={profil.ilce}
                onChange={(e) => setProfil({ ...profil, ilce: e.target.value })}
                disabled={!profil.il}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] disabled:bg-gray-50"
              >
                <option value="">Seciniz</option>
                {ilceleri.map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Yeni Şifreniz</label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="password"
                value={profil.yeniSifre}
                onChange={(e) => setProfil({ ...profil, yeniSifre: e.target.value })}
                placeholder="Yeni sifre"
                className="w-64 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              />
              <span className="text-xs text-red-500">Degistirmek istemiyorsaniz bos bırakin.</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleHesapSil}
              className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition"
            >
              Kullanici hesabini kapat
            </button>
            <button
              onClick={handleProfilGuncelle}
              className="bg-[#f97316] text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Bilgileri Guncelle
            </button>
          </div>
        </div>
      )}

      {activeMenu === 'İlanlarım' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800 text-lg">İlanlarım</h2>
            <button
              onClick={onIlanEkle}
              className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              <Plus size={16} />
              Yeni İlan Ekle
            </button>
          </div>
          {yukleniyor ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>)}
            </div>
          ) : ilanlar.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">Henuz ilaniniz yok</p>
              <button onClick={onIlanEkle} className="mt-4 bg-[#f97316] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                İlan Ver
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">İlan</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Tarih</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Durum</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">İslemler</th>
                  </tr>
                </thead>
                <tbody>
                  {ilanlar.map((ilan) => (
                    <tr key={ilan.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-gray-700 font-medium line-clamp-1 max-w-xs">{ilan.aciklama}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ilan.guzergahlar[0]?.kalkis_ilce} - {ilan.guzergahlar[0]?.varis_ilce}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                          {ilan.kategori.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onIlanDetay(ilan)} className="p-1.5 text-gray-400 hover:text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition"><Eye size={15} /></button>
                          <button onClick={() => handleIlanSil(ilan.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeMenu === 'Araçlarım' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800 text-lg">Araçlarım</h2>
            <button
              onClick={() => setAracFormAcik(!aracFormAcik)}
              className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              <Plus size={16} />
              Araç Ekle
            </button>
          </div>

          {basari && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{basari}</div>}
          {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{hata}</div>}

          {aracFormAcik && (
            <div className="border border-gray-200 rounded-xl p-4 mb-6 bg-gray-50">
              <h3 className="font-medium text-gray-700 mb-4">Yeni Araç Ekle</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Marka *</label>
                  <select
                    value={aracForm.marka}
                    onChange={(e) => setAracForm({ ...aracForm, marka: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  >
                    <option value="">Secin</option>
                    {markalar.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Model *</label>
                  <input
                    value={aracForm.model}
                    onChange={(e) => setAracForm({ ...aracForm, model: e.target.value })}
                    placeholder="Sprinter, Transit..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Yil</label>
                  <input
                    value={aracForm.yil}
                    onChange={(e) => setAracForm({ ...aracForm, yil: e.target.value })}
                    placeholder="2020"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Plaka *</label>
                  <input
                    value={aracForm.plaka}
                    onChange={(e) => setAracForm({ ...aracForm, plaka: e.target.value })}
                    placeholder="34 ABC 123"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Koltuk Sayisi</label>
                  <input
                    value={aracForm.koltuk_sayisi}
                    onChange={(e) => setAracForm({ ...aracForm, koltuk_sayisi: e.target.value })}
                    placeholder="16+1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Araç Tipi</label>
                  <select
                    value={aracForm.arac_tipi}
                    onChange={(e) => setAracForm({ ...aracForm, arac_tipi: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  >
                    <option value="">Secin</option>
                    {aracTipleri.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setAracFormAcik(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleAracEkle}
                  className="flex-1 bg-[#f97316] text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}

          {yukleniyor ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
            </div>
          ) : araclar.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Car size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Henuz arac eklemediniz</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {araclar.map((arac) => (
                <div key={arac.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Car size={18} className="text-[#1a3c6e]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{arac.marka} {arac.model} {arac.yil}</p>
                      <p className="text-xs text-gray-500">{arac.plaka} • {arac.koltuk_sayisi} koltuk • {arac.arac_tipi}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAracSil(arac.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeMenu === 'İlan Mesajları' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">İlan Mesajları</h2>
          {yukleniyor ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
            </div>
          ) : mesajlar.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Henuz mesajiniz yok</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mesajlar.map((mesaj) => (
                <div
                  key={mesaj.id}
                  onClick={() => !mesaj.okundu && handleMesajOku(mesaj.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition ${
                    mesaj.okundu ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {mesaj.gonderen?.full_name || mesaj.gonderen?.phone_number}
                      </p>
                      <p className="text-xs text-gray-500">{mesaj.ilanlar?.aciklama}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!mesaj.okundu && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(mesaj.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{mesaj.mesaj}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeMenu === 'Favori İlanlarım' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Favori İlanlarım</h2>
          {yukleniyor ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
            </div>
          ) : favoriler.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Henuz favori ilaniniz yok</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {favoriler.map((fav) => (
                <div key={fav.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800 text-sm line-clamp-1">{fav.ilanlar?.aciklama}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{fav.ilanlar?.ilan_veren} • {fav.ilanlar?.kategori?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onIlanDetay(fav.ilanlar)}
                      className="p-1.5 text-gray-400 hover:text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleFavoriKaldir(userId, fav.ilan_id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Heart size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeMenu === 'Destek' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Destek</h2>
          {destekGonderildi ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-sm text-center">
              <p className="font-medium">Destek talebiniz basariyla gonderildi!</p>
              <p className="mt-1">En kisa surede size donecegiz.</p>
              <button
                onClick={() => setDestekGonderildi(false)}
                className="mt-3 bg-[#f97316] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
              >
                Yeni Talep Gonder
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-lg">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Konu</label>
                <input
                  value={destekForm.konu}
                  onChange={(e) => setDestekForm({ ...destekForm, konu: e.target.value })}
                  placeholder="Destek konusu"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mesaj</label>
                <textarea
                  value={destekForm.mesaj}
                  onChange={(e) => setDestekForm({ ...destekForm, mesaj: e.target.value })}
                  placeholder="Mesajinizi yazin..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                />
              </div>
              <button
                onClick={handleDestekGonder}
                className="bg-[#f97316] text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition"
              >
                Gonder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
