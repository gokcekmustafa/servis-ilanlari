import React, { useState, useEffect } from 'react';
import {
  User,
  FileText,
  Plus,
  Settings,
  LogOut,
  Eye,
  Trash2,
} from 'lucide-react';
import { kullaniciIlanlari, ilanSil } from '../lib/ilanlar';
import { Ilan } from '../types';

const menuItems = [
  { id: 'ilanlar', label: 'İlanlarım', icon: FileText },
  { id: 'profil', label: 'Profil Bilgilerim', icon: User },
  { id: 'ayarlar', label: 'Ayarlar', icon: Settings },
];

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
  const [activeMenu, setActiveMenu] = useState('ilanlar');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (userId) {
      ilanlariYukle();
    }
  }, [userId]);

  const ilanlariYukle = async () => {
    setYukleniyor(true);
    const { data, error } = await kullaniciIlanlari(userId);
    if (!error && data) {
      setIlanlar(data as Ilan[]);
    }
    setYukleniyor(false);
  };

  const handleSil = async (id: string) => {
    const { error } = await ilanSil(id);
    if (!error) {
      setIlanlar(ilanlar.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#1a3c6e] rounded-full flex items-center justify-center mb-3">
                <User size={28} className="text-white" />
              </div>
              <p className="font-bold text-gray-800">Hosgeldiniz</p>
              <span className="mt-2 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                Aktif Uye
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition border-b border-gray-100 last:border-0 ${
                  activeMenu === item.id
                    ? 'bg-[#1a3c6e] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
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
                <h2 className="text-lg font-bold text-[#1a3c6e]">İlanlarım</h2>
                <button
                  onClick={onIlanEkle}
                  className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                >
                  <Plus size={16} />
                  Yeni Ilan Ekle
                </button>
              </div>

              {yukleniyor ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : ilanlar.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Henuz ilaniniz yok</p>
                  <p className="text-sm mt-1">Hemen ucretsiz ilan verin</p>
                  <button
                    onClick={onIlanEkle}
                    className="mt-4 bg-[#f97316] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                  >
                    Ilan Ver
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Ilan
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Tarih
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Islemler
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ilanlar.map((ilan) => (
                        <tr
                          key={ilan.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <p className="text-gray-700 font-medium line-clamp-1 max-w-xs">
                              {ilan.aciklama}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {ilan.guzergahlar[0]?.kalkis_ilce} -{' '}
                              {ilan.guzergahlar[0]?.varis_ilce}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                              {ilan.kategori.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(ilan.created_at).toLocaleDateString(
                              'tr-TR'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                ilan.durum === 'aktif'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
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

          {activeMenu === 'profil' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1a3c6e] mb-6">
                Profil Bilgilerim
              </h2>
              <div className="flex flex-col gap-4 max-w-md">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ad Soyad
                  </label>
                  <input
                    defaultValue=""
                    placeholder="Ad Soyadiniz"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    E-posta
                  </label>
                  <input
                    defaultValue=""
                    placeholder="E-posta adresiniz"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  />
                </div>
                <button className="bg-[#1a3c6e] text-white py-2.5 rounded-lg font-medium hover:bg-blue-900 transition">
                  Bilgileri Guncelle
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'ayarlar' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1a3c6e] mb-6">Ayarlar</h2>
              <div className="flex flex-col gap-4 max-w-md">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Yeni Sifre
                  </label>
                  <input
                    type="password"
                    placeholder="Yeni sifrenizi girin"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Sifre Tekrar
                  </label>
                  <input
                    type="password"
                    placeholder="Sifrenizi tekrar girin"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
                  />
                </div>
                <button className="bg-[#1a3c6e] text-white py-2.5 rounded-lg font-medium hover:bg-blue-900 transition">
                  Sifremi Guncelle
                </button>
                <hr className="my-2" />
                <button
                  onClick={onLogout}
                  className="bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Hesaptan Cikis Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
