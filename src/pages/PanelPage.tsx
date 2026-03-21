import React, { useState, useEffect } from 'react';
import { kullaniciIlanlari, ilanSil } from '../lib/ilanlar';
import { Ilan } from '../types';
import { ilceler } from '../data/ilceler';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Eye, Trash2, Plus } from 'lucide-react';

const menuItems = [
  'Profilim', 'İlanlarım', 'Araçlarım', 'İlan Mesajları', 'Favori İlanlarım', 'Destek'
];

const iller = Object.keys(ilceler).sort();

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
  const [yukleniyor, setYukleniyor] = useState(true);
  const [basari, setBasari] = useState('');
  const [hata, setHata] = useState('');

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
    if (activeMenu === 'İlanlarım' && userId) {
      ilanlariYukle();
    }
  }, [activeMenu, userId]);

  const ilanlariYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await kullaniciIlanlari(userId);
    if (!error && data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const handleSil = async (id: string) => {
    if (!confirm('Bu ilani silmek istediginizden emin misiniz?')) return;
    const { error } = await ilanSil(id);
    if (!error) setIlanlar(ilanlar.filter((i) => i.id !== id));
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
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
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
    if (!confirm('Hesabinizi kalici olarak silmek istediginizden emin misiniz? Tum ilanlariniz da silinecek.')) return;
    await supabase.from('ilanlar').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    localStorage.removeItem('user');
    onLogout();
  };

  const ilceleri = profil.il ? (ilceler[profil.il] || []) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveMenu(item)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition border ${
              activeMenu === item
                ? 'bg-[#f97316] text-white border-[#f97316]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {activeMenu === 'Profilim' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Profil Bilgileriniz</h2>

          {basari && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {basari}
            </div>
          )}
          {hata && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {hata}
            </div>
          )}

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
                {iller.map((il) => (
                  <option key={il} value={il}>{il}</option>
                ))}
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
                {ilceleri.map((ilce) => (
                  <option key={ilce} value={ilce}>{ilce}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Yeni Şifreniz</label>
            <div className="flex items-center gap-3">
              <input
                type="password"
                value={profil.yeniSifre}
                onChange={(e) => setProfil({ ...profil, yeniSifre: e.target.value })}
                placeholder="Yeni sifre (degistirmek istemiyorsaniz bos bırakin)"
                className="w-64 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              />
              <span className="text-xs text-red-500">
                Şifrenizi değiştirmek istemiyorsanız bu alanı boş bırakınız.
              </span>
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
              Bigileri Guncelle
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : ilanlar.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">Henuz ilaniniz yok</p>
              <button
                onClick={onIlanEkle}
                className="mt-4 bg-[#f97316] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
              >
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
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ilan.guzergahlar[0]?.kalkis_ilce} - {ilan.guzergahlar[0]?.varis_ilce}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                          {ilan.kategori.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onIlanDetay(ilan)}
                            className="p-1.5 text-gray-400 hover:text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleSil(ilan.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={15} />
                          </button>
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
          <h2 className="font-bold text-gray-800 text-lg mb-4">Araçlarım</h2>
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Bu ozellik yakin zamanda eklenecek</p>
          </div>
        </div>
      )}

      {activeMenu === 'İlan Mesajları' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">İlan Mesajları</h2>
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Henuz mesajiniz yok</p>
          </div>
        </div>
      )}

      {activeMenu === 'Favori İlanlarım' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Favori İlanlarım</h2>
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">Henuz favori ilaniniz yok</p>
          </div>
        </div>
      )}

      {activeMenu === 'Destek' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Destek</h2>
          <div className="flex flex-col gap-4 max-w-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Konu</label>
              <input
                placeholder="Destek konusu"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mesaj</label>
              <textarea
                placeholder="Mesajinizi yazin..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              />
            </div>
            <button className="bg-[#f97316] text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition">
              Gonder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
