import React, { useState, useEffect } from 'react';
import { Users, FileText, Trash2, Eye, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';

interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  type: string;
  il: string;
  created_at: string;
}

export default function AdminPage({
  onLogout,
  onIlanDetay,
}: {
  onLogout: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}) {
  const [activeMenu, setActiveMenu] = useState('ilanlar');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (activeMenu === 'ilanlar') {
      ilanlariYukle();
    } else {
      kullanicilariYukle();
    }
  }, [activeMenu]);

  const ilanlariYukle = async () => {
    setYukleniyor(true);
    const { data } = await supabase
      .from('ilanlar')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const kullanicilariYukle = async () => {
    setYukleniyor(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setKullanicilar(data as Profile[]);
    setYukleniyor(false);
  };

  const handleIlanSil = async (id: string) => {
    if (!confirm('Bu ilani silmek istediginizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('id', id);
    setIlanlar(ilanlar.filter((i) => i.id !== id));
  };

  const handleDurumDegistir = async (id: string, durum: string) => {
    const yeniDurum = durum === 'aktif' ? 'pasif' : 'aktif';
    await supabase.from('ilanlar').update({ durum: yeniDurum }).eq('id', id);
    setIlanlar(ilanlar.map((i) => i.id === id ? { ...i, durum: yeniDurum } : i));
  };

  const handleKullaniciSil = async (id: string) => {
    if (!confirm('Bu kullaniciyi silmek istediginizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('user_id', id);
    await supabase.from('profiles').delete().eq('id', id);
    setKullanicilar(kullanicilar.filter((k) => k.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-[#1a3c6e] rounded-2xl p-6 mb-4 text-white text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-[#1a3c6e] font-bold text-2xl">A</span>
            </div>
            <p className="font-bold">Admin Panel</p>
            <p className="text-xs text-blue-200 mt-1">Yonetici</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveMenu('ilanlar')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition border-b border-gray-100 ${
                activeMenu === 'ilanlar' ? 'bg-[#1a3c6e] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} />
              Tum İlanlar
            </button>
            <button
              onClick={() => setActiveMenu('kullanicilar')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition border-b border-gray-100 ${
                activeMenu === 'kullanicilar' ? 'bg-[#1a3c6e] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={16} />
              Tum Kullanicilar
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              Cikis Yap
            </button>
          </div>
        </aside>

        <div className="flex-1">
          {activeMenu === 'ilanlar' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1a3c6e]">
                  Tum İlanlar
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {ilanlar.length}
                  </span>
                </h2>
              </div>

              {yukleniyor ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : ilanlar.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Hic ilan yok</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">İlan</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">İlan Veren</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Tarih</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Durum</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">İslemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ilanlar.map((ilan) => (
                        <tr key={ilan.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-gray-700 font-medium line-clamp-1 max-w-xs">
                              {ilan.aciklama}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                              {ilan.kategori.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {ilan.ilan_veren}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              ilan.durum === 'aktif'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onIlanDetay(ilan)}
                                className="p-1.5 text-gray-400 hover:text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition"
                                title="Goruntule"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleDurumDegistir(ilan.id, ilan.durum)}
                                className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition"
                                title="Durum Degistir"
                              >
                                {ilan.durum === 'aktif'
                                  ? <XCircle size={15} />
                                  : <CheckCircle size={15} />
                                }
                              </button>
                              <button
                                onClick={() => handleIlanSil(ilan.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Sil"
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

          {activeMenu === 'kullanicilar' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1a3c6e]">
                  Tum Kullanicilar
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {kullanicilar.length}
                  </span>
                </h2>
              </div>

              {yukleniyor ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : kullanicilar.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Hic kullanici yok</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Ad Soyad</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Telefon</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Tip</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Il</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Kayit Tarihi</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">İslemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kullanicilar.map((kullanici) => (
                        <tr key={kullanici.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {kullanici.full_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {kullanici.phone_number}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              kullanici.type === 'kurumsal'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {kullanici.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {kullanici.il || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(kullanici.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleKullaniciSil(kullanici.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
