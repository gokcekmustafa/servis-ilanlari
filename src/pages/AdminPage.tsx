import React, { useState, useEffect } from 'react';
import { Users, FileText, Trash2, Eye, CheckCircle, XCircle, LogOut, HelpCircle, Edit, Save, X } from 'lucide-react';
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
  profil_resmi: string;
  aktif: boolean;
  yetkiler: {
    ilan_verebilir: boolean;
    mesaj_gonderebilir: boolean;
    favori_ekleyebilir: boolean;
  };
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
            <button onClick={() => handleDurumDegistir('beklemede')} disabled={yukleniyor}
              className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition disabled:opacity-50">
              Beklemede
            </button>
          )}
          {destek.durum !== 'islemde' && (
            <button onClick={() => handleDurumDegistir('islemde')} disabled={yukleniyor}
              className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50">
              İslemde
            </button>
          )}
          {destek.durum !== 'cozuldu' && (
            <button onClick={() => handleDurumDegistir('cozuldu')} disabled={yukleniyor}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50">
              Cozuldu
            </button>
          )}
        </div>
        <button onClick={() => setCevapAcik(!cevapAcik)}
          className="px-3 py-1.5 text-xs font-medium bg-[#1a3c6e] text-white rounded-lg hover:bg-blue-900 transition">
          {cevapAcik ? 'İptal' : 'Cevap Ver'}
        </button>
      </div>
      {cevapAcik && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea value={cevapMetni} onChange={(e) => setCevapMetni(e.target.value)}
            placeholder="Cevabinizi yazin..." rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]" />
          <button onClick={handleCevapGonder} disabled={yukleniyor || !cevapMetni.trim()}
            className="self-end px-4 py-2 bg-[#f97316] text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition disabled:opacity-50">
            {yukleniyor ? 'Gonderiliyor...' : 'Gonder ve İslemde Yap'}
          </button>
        </div>
      )}
    </div>
  );
}

function KullaniciDetay({ kullanici, onKapat, onGuncelle, onSil }: {
  kullanici: Profile;
  onKapat: () => void;
  onGuncelle: (id: string, updates: any) => void;
  onSil: (id: string) => void;
}) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniSifre, setYeniSifre] = useState('');
  const [yetkiler, setYetkiler] = useState(kullanici.yetkiler || { ilan_verebilir: true, mesaj_gonderebilir: true, favori_ekleyebilir: true });
  const [aktif, setAktif] = useState(kullanici.aktif !== false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basari, setBasari] = useState('');

  const handleKaydet = async () => {
    setYukleniyor(true);
    const updates: any = { yetkiler, aktif };
    if (yeniSifre) {
      const encoder = new TextEncoder();
      const data = encoder.encode(yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
      updates.sifre_acik = yeniSifre;
    }
    await supabase.from('profiles').update(updates).eq('id', kullanici.id);
    onGuncelle(kullanici.id, updates);
    setYukleniyor(false);
    setDuzenle(false);
    setYeniSifre('');
    setBasari('Kaydedildi!');
    setTimeout(() => setBasari(''), 2000);
  };

  const handleResimSil = async () => {
    await supabase.from('profiles').update({ profil_resmi: null }).eq('id', kullanici.id);
    onGuncelle(kullanici.id, { profil_resmi: null });
  };

  const handleResimDegistir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data } = await supabase.storage.from('profil-resimleri').upload(`profil-${kullanici.id}-${Date.now()}`, file);
    if (data) {
      const { data: urlData } = supabase.storage.from('profil-resimleri').getPublicUrl(data.path);
      await supabase.from('profiles').update({ profil_resmi: urlData.publicUrl }).eq('id', kullanici.id);
      onGuncelle(kullanici.id, { profil_resmi: urlData.publicUrl });
    }
  };

  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">Kullanici Detayi</h3>
        <button onClick={onKapat} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {basari && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-3 text-xs">{basari}</div>}

      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden mb-2">
          {kullanici.profil_resmi ? (
            <img src={kullanici.profil_resmi} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <Users size={28} className="text-gray-400" />
          )}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition">
            Degistir
            <input type="file" accept="image/*" onChange={handleResimDegistir} className="hidden" />
          </label>
          {kullanici.profil_resmi && (
            <button onClick={handleResimSil} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200 transition">Sil</button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Ad Soyad</p>
          <p className="font-medium">{kullanici.full_name || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Telefon</p>
          <p className="font-medium">{kullanici.phone_number}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Sifre</p>
          <p className="font-mono font-medium text-orange-600">{kullanici.sifre_acik || '******'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Uyelik Tipi</p>
          <p className="font-medium">{kullanici.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Il / İlce</p>
          <p className="font-medium">{kullanici.il || '-'} / {kullanici.ilce || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Adres</p>
          <p className="font-medium">{kullanici.adres || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Kayit Tarihi</p>
          <p className="font-medium">{new Date(kullanici.created_at).toLocaleDateString('tr-TR')}</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-700">Hesap Durumu ve Yetkiler</p>
          <button onClick={() => setDuzenle(!duzenle)} className="text-xs text-[#1a3c6e] hover:underline flex items-center gap-1">
            <Edit size={12} /> Duzenle
          </button>
        </div>

        <div className="mb-3">
          <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Hesap Aktif</span>
            <div className={`relative inline-flex items-center cursor-pointer ${!duzenle ? 'opacity-60' : ''}`}>
              <input type="checkbox" checked={aktif} onChange={(e) => duzenle && setAktif(e.target.checked)} className="sr-only" disabled={!duzenle} />
              <div onClick={() => duzenle && setAktif(!aktif)} className={`w-9 h-5 rounded-full transition ${aktif ? 'bg-green-500' : 'bg-gray-300'} cursor-pointer`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${aktif ? 'translate-x-4' : ''}`}></div>
              </div>
            </div>
          </label>
        </div>

        {[
          { key: 'ilan_verebilir', label: 'İlan Verebilir' },
          { key: 'mesaj_gonderebilir', label: 'Mesaj Gonderebilir' },
          { key: 'favori_ekleyebilir', label: 'Favori Ekleyebilir' },
        ].map((item) => (
          <label key={item.key} className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>{item.label}</span>
            <div className={`relative inline-flex items-center cursor-pointer ${!duzenle ? 'opacity-60' : ''}`}>
              <input type="checkbox" checked={(yetkiler as any)[item.key]} onChange={(e) => duzenle && setYetkiler({ ...yetkiler, [item.key]: e.target.checked })} className="sr-only" disabled={!duzenle} />
              <div onClick={() => duzenle && setYetkiler({ ...yetkiler, [item.key]: !(yetkiler as any)[item.key] })}
                className={`w-9 h-5 rounded-full transition cursor-pointer ${(yetkiler as any)[item.key] ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${(yetkiler as any)[item.key] ? 'translate-x-4' : ''}`}></div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {duzenle && (
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Yeni Sifre (bos bırakabilirsiniz)</label>
          <input type="text" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)}
            placeholder="Yeni sifre"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]" />
        </div>
      )}

      {duzenle && (
        <button onClick={handleKaydet} disabled={yukleniyor}
          className="w-full bg-[#1a3c6e] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition mb-2 flex items-center justify-center gap-2 disabled:opacity-50">
          <Save size={14} />
          {yukleniyor ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
        </button>
      )}

      <button onClick={() => onSil(kullanici.id)}
        className="w-full bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
        Kullaniciyi Sil
      </button>
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
  const [aramaMetni, setAramaMetni] = useState('');

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

  const handleKullaniciGuncelle = (id: string, updates: any) => {
    setKullanicilar(kullanicilar.map((k) => k.id === id ? { ...k, ...updates } : k));
    if (secilenKullanici?.id === id) setSecilenKullanici({ ...secilenKullanici, ...updates });
  };

  const filtreliKullanicilar = kullanicilar.filter((k) =>
    !aramaMetni ||
    k.full_name?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    k.phone_number?.includes(aramaMetni) ||
    k.il?.toLowerCase().includes(aramaMetni.toLowerCase())
  );

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
              <button key={item.id} onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition border-b border-gray-100 ${activeMenu === item.id ? 'bg-[#1a3c6e] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <item.icon size={16} />
                  {item.label}
                </div>
                {item.id === 'destek' && bekleyenDestek > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{bekleyenDestek}</span>
                )}
              </button>
            ))}
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition">
              <LogOut size={16} /> Cikis Yap
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
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
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => onIlanDetay(ilan)} className="p-1.5 text-gray-400 hover:text-[#1a3c6e] hover:bg-blue-50 rounded-lg transition"><Eye size={15} /></button>
                              <button onClick={() => handleDurumDegistir(ilan.id, ilan.durum)} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition">
                                {ilan.durum === 'aktif' ? <XCircle size={15} /> : <CheckCircle size={15} />}
                              </button>
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

          {activeMenu === 'kullanicilar' && (
            <div className="flex gap-4">
              <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1a3c6e]">
                    Tum Kullanicilar
                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{kullanicilar.length}</span>
                  </h2>
                </div>
                <input
                  value={aramaMetni}
                  onChange={(e) => setAramaMetni(e.target.value)}
                  placeholder="Ad, telefon veya il ile ara..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] mb-4"
                />
                {yukleniyor ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Resim</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Ad Soyad</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Telefon</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Sifre</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Tip</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Il</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">Durum</th>
                          <th className="px-3 py-3 text-left font-medium text-gray-600">İslemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtreliKullanicilar.map((k) => (
                          <tr key={k.id}
                            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${secilenKullanici?.id === k.id ? 'bg-blue-50' : ''}`}
                            onClick={() => setSecilenKullanici(k)}>
                            <td className="px-3 py-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                {k.profil_resmi ? (
                                  <img src={k.profil_resmi} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users size={14} className="text-gray-400" />
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 font-medium text-gray-700">{k.full_name || '-'}</td>
                            <td className="px-3 py-3 text-gray-600">{k.phone_number}</td>
                            <td className="px-3 py-3 text-gray-600 font-mono text-xs">{k.sifre_acik || '******'}</td>
                            <td className="px-3 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${k.type === 'kurumsal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {k.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-600 text-xs">{k.il || '-'}</td>
                            <td className="px-3 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${k.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {k.aktif !== false ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <button onClick={(e) => { e.stopPropagation(); handleKullaniciSil(k.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
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
                <KullaniciDetay
                  kullanici={secilenKullanici}
                  onKapat={() => setSecilenKullanici(null)}
                  onGuncelle={handleKullaniciGuncelle}
                  onSil={handleKullaniciSil}
                />
              )}
            </div>
          )}

          {activeMenu === 'destek' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1a3c6e] mb-6">
                Destek Talepleri
                {bekleyenDestek > 0 && (
                  <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{bekleyenDestek} bekliyor</span>
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
                    <DestekKart key={destek.id} destek={destek} onGuncelle={destekleriYukle} />
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
