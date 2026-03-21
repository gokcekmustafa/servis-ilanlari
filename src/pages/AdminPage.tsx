import React, { useState, useEffect } from 'react';
import { Users, FileText, Trash2, Eye, CheckCircle, XCircle, LogOut, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { destekTalepleriniGetir, destekDurumGuncelle } from '../lib/ilanlar';
import { Ilan } from '../types';

interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  type: string;
  il: string;
  ilce: string;
  adres: string;
  sifre_acik: string;
  created_at: string;
}

const menuItems = [
  { id: 'ilanlar', label: 'Tum İlanlar', icon: FileText },
  { id: 'kullanicilar', label: 'Tum Kullanicilar', icon: Users },
  { id: 'destek', label: 'Destek Talepleri', icon: HelpCircle },
];

const durumRenk: Record<string, string> = {
  beklemede: 'bg-orange-100 text-orange-700',
  islemde: 'bg-blue-100 text-blue-700',
  cozuldu: 'bg-green-100 text-green-700',
};

const durumLabel: Record<string, string> = {
  beklemede: 'Beklemede',
  islemde: 'İslemde',
  cozuldu: 'Cozuldu',
};

function DestekKart({ destek, onGuncelle }: { destek: any; onGuncelle: () => void }) {
  const [cevapMetni, setCevapMetni] = useState(destek.cevap || '');
  const [cevapAcik, setCevapAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleDurumDegistir = async (yeniDurum: string) => {
    setYukleniyor(true);
    await destekDurumGuncelle(destek.id, yeniDurum);
    setYukleniyor(false);
    onGuncelle();
  };

  const handleCevapGonder = async () => {
    if (!cevapMetni.trim()) return;
    setYukleniyor(true);
    await destekDurumGuncelle(destek.id, 'islemde', cevapMetni);
    setYukleniyor(false);
    setCevapAcik(false);
    onGuncelle();
  };

  return (
    <div className={`border rounded-xl p-4 ${destek.durum === 'beklemede' ? 'border-orange-200 bg-orange-50' : destek.durum === 'islemde' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-800">{destek.konu}</p>
          <p className="text-xs text-gray-500">
            {destek.profiles?.full_name || destek.profiles?.phone_number} - {new Date(destek.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${durumRenk[destek.durum] || 'bg-gray-100 text-gray-700'}`}>
          {durumLabel[destek.durum] || destek.durum}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-3 p-3 bg-white rounded-lg border border-gray-100">{destek.mesaj}</p>

      {destek.cevap && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-medium text-green-700 mb-1">Admin Cevabi:</p>
          <p className="text-sm text-gray-700">{destek.cevap}</p>
          {destek.cevap_tarihi && (
            <p className="text-xs text-gray-400 mt-1">{new Date(destek.cevap_tarihi).toLocaleDateString('tr-TR')}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <div className="flex gap-2">
          {destek.durum !== 'beklemede' && (
            <button
              onClick={() => handleDurumDegistir('beklemede')}
              disabled={yukleniyor}
              className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition disabled:opacity-50"
            >
              Beklemede
            </button>
          )}
          {destek.durum !== 'islemde' && (
            <button
              onClick={() => handleDurumDegistir('islemde')}
              disabled={yukleniyor}
              className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
            >
              İslemde
            </button>
          )}
          {destek.durum !== 'cozuldu' && (
            <button
              onClick={() => handleDurumDegistir('cozuldu')}
              disabled={yukleniyor}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
            >
              Cozuldu
            </button>
          )}
        </div>

        <button
          onClick={() => setCevapAcik(!cevapAcik)}
          className="px-3 py-1.5 text-xs font-medium bg-[#1a3c6e] text-white rounded-lg hover:bg-blue-900 transition"
        >
          {cevapAcik ? 'İptal' : 'Cevap Ver'}
        </button>
      </div>

      {cevapAcik && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={cevapMetni}
            onChange={(e) => setCevapMetni(e.target.value)}
            placeholder="Cevabinizi yazin..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]"
          />
          <button
            onClick={handleCevapGonder}
            disabled={yukleniyor || !cevapMetni.trim()}
            className="self-end px-4 py-2 bg-[#f97316] text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {yukleniyor ? 'Gonderiliyor...' : 'Gonder ve İslemde Yap'}
          </button>
        </div>
      )}
    </div>
  );
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
  const [destekler, setDestekler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<Profile | null>(null);
  const [bekleyenDestek, setBekleyenDestek] = useState(0);

  useEffect(() => {
    if (activeMenu === 'ilanlar') ilanlariYukle();
    else if (activeMenu === 'kullanicilar') kullanicilariYukle();
    else if (activeMenu === 'destek') destekleriYukle();
  }, [activeMenu]);

  useEffect(() => {
    destekTalepleriniGetir().then(({ data }) => {
      if (data) setBekleyenDestek(data.filter((d: any) => d.durum === 'beklemede').length);
    });
  }, []);

  const ilanlariYukle = async () => {
    setYukleniyor(true);
    const { data } = await supabase.from('ilanlar').select('*').order('created_at', { ascending: false });
    if (data) setIlanlar(data as Ilan[]);
    setYukleniyor(false);
  };

  const kullanicilariYukle = async () => {
    setYukleniyor(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setKullanicilar(data as Profile[]);
    setYukleniyor(false);
  };

  const destekleriYukle = async () => {
    setYukleniyor(true);
    const { data } = await destekTalepleriniGetir();
    if (data) {
      setDestekler(data);
      setBekleyenDestek(data.filter((d: any) => d.durum === 'beklemede').length);
    }
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
    if (!confirm('Bu kullaniciyi ve tum verilerini silmek istediginizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('user_id', id);
    await supabase.from('araclar').delete().eq('user_id', id);
    await supabase.from('favoriler').delete().eq('user_id', id);
    await supabase.from('destek').delete().eq('user_id', id);
    await supabase.from('profiles').delete().eq('id', id);
    setKullanicilar(kullanicilar.filter((k) => k.id !== id));
    if (secilenKullanici?.id === id) setSecilenKullanici(null);
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
            <p className="text-xs text-blue-200 mt-1">Superadmin</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition border-b border-gray-100 ${
                  activeMenu === item.id ? 'bg-[#1a3c6e] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} />
                  {item.label}
                </div>
                {item.id === 'destek' && bekleyenDestek > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {bekleyenDestek}
                  </span>
                )}
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
                <h2 className="text-lg font-bold text-[#1a3c6e]">
                  Tum İlanlar
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{ilanlar.length}</span>
                </h2>
              </div>
              {yukleniyor ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>)}
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
                            <p className="text-gray-700 font-medium line-clamp-1 max-w-xs">{ilan.aciklama}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                              {ilan.kategori.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{ilan.ilan_veren}</td>
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
                              <button onClick={() => onIlanDetay(ilan)} className="p-1.5 text-gray-400 hover:text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => handleDurumDegistir(ilan.id, ilan.durum)} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition">
                                {ilan.durum === 'aktif' ? <XCircle size={15} /> : <CheckCircle size={15} />}
                              </button>
                              <button onClick={() => handleIlanSil(ilan.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
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
            <div className="flex gap-4">
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-[#1a3c6e] mb-6">
                  Tum Kullanicilar
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{kullanicilar.length}</span>
                </h2>
                {yukleniyor ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Ad Soyad</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Telefon</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Sifre</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Tip</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">İl</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Tarih</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">İslemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kullanicilar.map((k) => (
                          <tr
                            key={k.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${secilenKullanici?.id === k.id ? 'bg-blue-50' : ''}`}
                            onClick={() => setSecilenKullanici(k)}
                          >
                            <td className="px-4 py-3 font-medium text-gray-700">{k.full_name || '-'}</td>
                            <td className="px-4 py-3 text-gray-600">{k.phone_number}</td>
                            <td className="px-4 py-3 text-gray-600 font-mono text-xs">{k.sifre_acik || '******'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                k.type === 'kurumsal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {k.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{k.il || '-'}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {new Date(k.created_at).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleKullaniciSil(k.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
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

              {secilenKullanici && (
                <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Kullanici Detayi</h3>
                    <button onClick={() => setSecilenKullanici(null)} className="text-gray-400 hover:text-gray-600">x</button>
                  </div>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Ad Soyad</p>
                      <p className="font-medium">{secilenKullanici.full_name || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Telefon</p>
                      <p className="font-medium">{secilenKullanici.phone_number}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Sifre</p>
                      <p className="font-mono font-medium text-orange-600">{secilenKullanici.sifre_acik || 'Kayitli degil'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Uyelik Tipi</p>
                      <p className="font-medium">{secilenKullanici.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">İl / İlce</p>
                      <p className="font-medium">{secilenKullanici.il || '-'} / {secilenKullanici.ilce || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Adres</p>
                      <p className="font-medium">{secilenKullanici.adres || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Kayit Tarihi</p>
                      <p className="font-medium">{new Date(secilenKullanici.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <button
                      onClick={() => handleKullaniciSil(secilenKullanici.id)}
                      className="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition mt-2"
                    >
                      Kullaniciyi Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'destek' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1a3c6e] mb-6">
                Destek Talepleri
                {bekleyenDestek > 0 && (
                  <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                    {bekleyenDestek} bekliyor
                  </span>
                )}
              </h2>
              {yukleniyor ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
                </div>
              ) : destekler.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <HelpCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Henuz destek talebi yok</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {destekler.map((destek) => (
                    <DestekKart
                      key={destek.id}
                      destek={destek}
                      onGuncelle={destekleriYukle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
