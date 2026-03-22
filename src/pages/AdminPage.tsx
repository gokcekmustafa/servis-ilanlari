import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';
import {
  LayoutDashboard, Users, FileText, Megaphone,
  Image, HeadphonesIcon, LogOut, Trash2, CheckCircle,
  XCircle, PlusCircle, RefreshCw, Eye, EyeOff
} from 'lucide-react';

type AdminPageProps = {
  onLogout: () => void;
  onIlanDetay: (ilan: Ilan) => void;
};

type Sekme =
  | 'istatistik'
  | 'ilanlar'
  | 'kullanicilar'
  | 'reklamlar'
  | 'duyurular'
  | 'destek';

export default function AdminPage({ onLogout, onIlanDetay }: AdminPageProps) {
  const [aktifSekme, setAktifSekme] = useState<Sekme>('istatistik');
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [yeniReklam, setYeniReklam] = useState({ baslik: '', resim_url: '', link_url: '', konum: 'liste' });
  const [yeniDuyuru, setYeniDuyuru] = useState({ baslik: '', mesaj: '', resim_url: '', saniye: 2 });
  const [yeniKullanici, setYeniKullanici] = useState({ full_name: '', phone_number: '', password: '', type: 'staff' });
  const [seciliKullanici, setSeciliKullanici] = useState<any>(null);
  const [yeniSifre, setYeniSifre] = useState('');
  const [seciliDestek, setSeciliDestek] = useState<any>(null);
  const [destekCevap, setDestekCevap] = useState('');

  useEffect(() => {
    hepsiniYukle();
  }, []);

  const hepsiniYukle = async () => {
    setYukleniyor(true);
    const [u, i, r, d, ds] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('ilanlar').select('*').order('created_at', { ascending: false }),
      supabase.from('reklamlar').select('*').order('id', { ascending: false }),
      supabase.from('duyurular').select('*').order('id', { ascending: false }),
      supabase.from('destek').select('*').order('created_at', { ascending: false }),
    ]);
    setKullanicilar(u.data || []);
    setIlanlar(i.data || []);
    setReklamlar(r.data || []);
    setDuyurular(d.data || []);
    setDestekler(ds.data || []);
    setYukleniyor(false);
  };

  const hashPassword = async (pass: string) => {
    const enc = new TextEncoder().encode(pass + 'servis-ilanlari-salt');
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const ilanSil = async (id: string) => {
    if (!window.confirm('Bu ilani silmek istediginizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('id', id);
    hepsiniYukle();
  };

  const ilanDurumDegistir = async (id: string, durum: string) => {
    await supabase.from('ilanlar').update({ durum }).eq('id', id);
    hepsiniYukle();
  };

  const kullaniciSil = async (id: string) => {
    if (!window.confirm('Bu kullaniciy silmek istediginizden emin misiniz?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    hepsiniYukle();
  };

  const kullaniciGuncelle = async () => {
    if (!seciliKullanici) return;
    const guncelleme: any = {
      full_name: seciliKullanici.full_name,
      phone_number: seciliKullanici.phone_number,
      aktif: seciliKullanici.aktif,
    };
    if (yeniSifre) {
      guncelleme.password_hash = await hashPassword(yeniSifre);
      guncelleme.sifre_acik = yeniSifre;
    }
    await supabase.from('profiles').update(guncelleme).eq('id', seciliKullanici.id);
    setYeniSifre('');
    setSeciliKullanici(null);
    hepsiniYukle();
  };

  const kullaniciEkle = async () => {
    if (!yeniKullanici.full_name || !yeniKullanici.phone_number || !yeniKullanici.password) return;
    const hash = await hashPassword(yeniKullanici.password);
    await supabase.from('profiles').insert([{
      full_name: yeniKullanici.full_name,
      phone_number: yeniKullanici.phone_number,
      type: yeniKullanici.type,
      sifre_acik: yeniKullanici.password,
      password_hash: hash,
      aktif: true,
      yetkiler: { ilan_sil: true, kullanici_sil: false },
    }]);
    setYeniKullanici({ full_name: '', phone_number: '', password: '', type: 'staff' });
    hepsiniYukle();
  };

  const reklamEkle = async () => {
    if (!yeniReklam.resim_url) return;
    await supabase.from('reklamlar').insert([{ ...yeniReklam, aktif: true }]);
    setYeniReklam({ baslik: '', resim_url: '', link_url: '', konum: 'liste' });
    hepsiniYukle();
  };

  const reklamSil = async (id: string) => {
    await supabase.from('reklamlar').delete().eq('id', id);
    hepsiniYukle();
  };

  const reklamToggle = async (id: string, aktif: boolean) => {
    await supabase.from('reklamlar').update({ aktif: !aktif }).eq('id', id);
    hepsiniYukle();
  };

  const duyuruEkle = async () => {
    if (!yeniDuyuru.baslik || !yeniDuyuru.mesaj) return;
    await supabase.from('duyurular').insert([{ ...yeniDuyuru, aktif: true }]);
    setYeniDuyuru({ baslik: '', mesaj: '', resim_url: '', saniye: 2 });
    hepsiniYukle();
  };

  const duyuruSil = async (id: string) => {
    await supabase.from('duyurular').delete().eq('id', id);
    hepsiniYukle();
  };

  const duyuruToggle = async (id: string, aktif: boolean) => {
    await supabase.from('duyurular').update({ aktif: !aktif }).eq('id', id);
    hepsiniYukle();
  };

  const destekCevapla = async () => {
    if (!seciliDestek || !destekCevap) return;
    await supabase.from('destek').update({
      cevap: destekCevap,
      durum: 'cevaplandi',
      cevap_tarihi: new Date().toISOString(),
    }).eq('id', seciliDestek.id);
    setDestekCevap('');
    setSeciliDestek(null);
    hepsiniYukle();
  };

  const menuItems = [
    { id: 'istatistik', label: 'Istatistikler', icon: LayoutDashboard },
    { id: 'ilanlar', label: 'Ilanlar', icon: FileText, sayi: ilanlar.length },
    { id: 'kullanicilar', label: 'Kullanicilar', icon: Users, sayi: kullanicilar.length },
    { id: 'reklamlar', label: 'Reklamlar', icon: Image, sayi: reklamlar.length },
    { id: 'duyurular', label: 'Duyurular', icon: Megaphone, sayi: duyurular.length },
    { id: 'destek', label: 'Destek', icon: HeadphonesIcon, sayi: destekler.filter(d => d.durum === 'bekliyor').length },
  ];

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";
  const btnOrange = "bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition";
  const btnSlate = "bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition";

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* SIDEBAR */}
      <aside className="w-56 bg-slate-800 flex-shrink-0 flex flex-col">
        <div className="px-4 py-5 border-b border-slate-700">
          <p className="text-white font-bold text-base">Admin Panel</p>
          <p className="text-slate-400 text-xs mt-0.5">salonum.site</p>
        </div>

        <nav className="flex-1 py-3">
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
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white')
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {item.label}
                </span>
                {item.sayi !== undefined && item.sayi > 0 && (
                  <span className={
                    'text-xs px-1.5 py-0.5 rounded-full font-bold ' +
                    (aktif ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-300')
                  }>
                    {item.sayi}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm py-2 transition"
          >
            <LogOut size={15} />
            Cikis Yap
          </button>
        </div>
      </aside>

      {/* ICERIK */}
      <main className="flex-1 p-6 overflow-auto">

        {/* YENILE BUTONU */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-slate-800 font-bold text-lg capitalize">
            {menuItems.find(m => m.id === aktifSekme)?.label}
          </h1>
          <button onClick={hepsiniYukle} className={btnSlate + ' flex items-center gap-1.5'}>
            <RefreshCw size={14} />
            Yenile
          </button>
        </div>

        {yukleniyor && (
          <div className="text-center py-20 text-slate-400 text-sm">Yukleniyor...</div>
        )}

        {/* ISTATISTIKLER */}
        {!yukleniyor && aktifSekme === 'istatistik' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Toplam Ilan', value: ilanlar.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Toplam Uye', value: kullanicilar.length, color: 'bg-green-50 text-green-700 border-green-200' },
                { label: 'Aktif Reklam', value: reklamlar.filter(r => r.aktif).length, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                { label: 'Bekleyen Destek', value: destekler.filter(d => d.durum === 'bekliyor').length, color: 'bg-red-50 text-red-700 border-red-200' },
              ].map((stat) => (
                <div key={stat.label} className={'rounded-xl border p-4 ' + stat.color}>
                  <p className="text-xs font-medium opacity-70 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Son Ilanlar</p>
                {ilanlar.slice(0, 5).map(i => (
                  <div key={i.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600 truncate">{i.ilan_veren || 'Anonim'}</span>
                    <span className="text-xs text-slate-400">{new Date(i.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Son Uyeler</p>
                {kullanicilar.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{u.full_name || 'Isimsiz'}</span>
                    <span className="text-xs text-slate-400">{u.phone_number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ILANLAR */}
        {!yukleniyor && aktifSekme === 'ilanlar' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ilan Veren</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {ilanlar.map((ilan) => (
                  <tr key={ilan.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700 font-medium">{ilan.ilan_veren || 'Anonim'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{ilan.kategori}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="px-4 py-3">
                      <span className={
                        'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                        (ilan.durum === 'aktif'
                          ? 'bg-green-100 text-green-700'
                          : ilan.durum === 'pasif'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-yellow-100 text-yellow-700')
                      }>
                        {ilan.durum || 'aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onIlanDetay(ilan)}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => ilanDurumDegistir(ilan.id, ilan.durum === 'aktif' ? 'pasif' : 'aktif')}
                          className="text-xs text-orange-500 hover:text-orange-700 font-medium"
                        >
                          {ilan.durum === 'aktif' ? 'Pasif' : 'Aktif'}
                        </button>
                        <button
                          onClick={() => ilanSil(ilan.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ilanlar.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">Hic ilan yok</div>
            )}
          </div>
        )}

        {/* KULLANICILAR */}
        {!yukleniyor && aktifSekme === 'kullanicilar' && (
          <div className="grid grid-cols-3 gap-4">

            {/* LISTE */}
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ad Soyad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Islem</th>
                  </tr>
                </thead>
                <tbody>
                  {kullanicilar.map((u) => (
                    <tr
                      key={u.id}
                      className={'border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ' + (seciliKullanici?.id === u.id ? 'bg-orange-50' : '')}
                      onClick={() => setSeciliKullanici(u)}
                    >
                      <td className="px-4 py-3 text-slate-700 font-medium">{u.full_name || 'Isimsiz'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.phone_number}</td>
                      <td className="px-4 py-3">
                        <span className={
                          'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                          (u.type === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500')
                        }>
                          {u.type || 'uye'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={
                          'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                          (u.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')
                        }>
                          {u.aktif !== false ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); kullaniciSil(u.id); }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DETAY / YENI KULLANICI */}
            <div className="flex flex-col gap-4">
              {seciliKullanici && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Kullanici Duzenle</p>
                  <input
                    className={inputClass + ' mb-2'}
                    value={seciliKullanici.full_name || ''}
                    onChange={e => setSeciliKullanici({ ...seciliKullanici, full_name: e.target.value })}
                    placeholder="Ad Soyad"
                  />
                  <input
                    className={inputClass + ' mb-2'}
                    value={seciliKullanici.phone_number || ''}
                    onChange={e => setSeciliKullanici({ ...seciliKullanici, phone_number: e.target.value })}
                    placeholder="Telefon"
                  />
                  <input
                    className={inputClass + ' mb-2'}
                    value={yeniSifre}
                    onChange={e => setYeniSifre(e.target.value)}
                    placeholder="Yeni sifre (bos birakilabilir)"
                    type="password"
                  />
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setSeciliKullanici({ ...seciliKullanici, aktif: true })}
                      className={'flex-1 text-xs py-1.5 rounded-lg border font-medium ' + (seciliKullanici.aktif !== false ? 'bg-green-500 text-white border-green-500' : 'text-slate-500 border-slate-200')}
                    >
                      Aktif
                    </button>
                    <button
                      onClick={() => setSeciliKullanici({ ...seciliKullanici, aktif: false })}
                      className={'flex-1 text-xs py-1.5 rounded-lg border font-medium ' + (seciliKullanici.aktif === false ? 'bg-red-500 text-white border-red-500' : 'text-slate-500 border-slate-200')}
                    >
                      Pasif
                    </button>
                  </div>
                  <button onClick={kullaniciGuncelle} className={btnOrange + ' w-full'}>
                    Kaydet
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                  <PlusCircle size={15} className="text-orange-500" />
                  Yeni Kullanici
                </p>
                <input className={inputClass + ' mb-2'} placeholder="Ad Soyad" value={yeniKullanici.full_name}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, full_name: e.target.value })} />
                <input className={inputClass + ' mb-2'} placeholder="Telefon" value={yeniKullanici.phone_number}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, phone_number: e.target.value })} />
                <input className={inputClass + ' mb-2'} placeholder="Sifre" type="password" value={yeniKullanici.password}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, password: e.target.value })} />
                <select className={inputClass + ' mb-3'} value={yeniKullanici.type}
                  onChange={e => setYeniKullanici({ ...yeniKullanici, type: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="uye">Uye</option>
                </select>
                <button onClick={kullaniciEkle} className={btnOrange + ' w-full'}>
                  Kullanici Olustur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REKLAMLAR */}
        {!yukleniyor && aktifSekme === 'reklamlar' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-3">
              {reklamlar.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <img
                    src={r.resim_url}
                    alt={r.baslik}
                    className="w-32 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 text-sm">{r.baslik || 'Baslıksız'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{r.link_url || 'Link yok'}</p>
                    <span className={'text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ' +
                      (r.konum === 'header' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500')}>
                      {r.konum === 'header' ? 'Header' : 'Liste'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => reklamToggle(r.id, r.aktif)}
                      className={'text-xs font-semibold px-3 py-1.5 rounded-lg border transition ' +
                        (r.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}
                    >
                      {r.aktif ? 'Aktif' : 'Pasif'}
                    </button>
                    <button onClick={() => reklamSil(r.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {reklamlar.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">
                  Hic reklam eklenmemis
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <PlusCircle size={15} className="text-orange-500" />
                Yeni Reklam Ekle
              </p>
              <input className={inputClass + ' mb-2'} placeholder="Baslik (opsiyonel)"
                value={yeniReklam.baslik}
                onChange={e => setYeniReklam({ ...yeniReklam, baslik: e.target.value })} />
              <input className={inputClass + ' mb-2'} placeholder="Resim URL (zorunlu)"
                value={yeniReklam.resim_url}
                onChange={e => setYeniReklam({ ...yeniReklam, resim_url: e.target.value })} />
              <input className={inputClass + ' mb-2'} placeholder="Tiklama linki (opsiyonel)"
                value={yeniReklam.link_url}
                onChange={e => setYeniReklam({ ...yeniReklam, link_url: e.target.value })} />
              <select className={inputClass + ' mb-3'}
                value={yeniReklam.konum}
                onChange={e => setYeniReklam({ ...yeniReklam, konum: e.target.value })}>
                <option value="liste">Liste Arasi</option>
                <option value="header">Header</option>
              </select>
              {yeniReklam.resim_url && (
                <img src={yeniReklam.resim_url} className="w-full h-20 object-cover rounded-lg mb-3 border border-slate-100"
                  onError={(e: any) => { e.target.style.display = 'none'; }} />
              )}
              <button onClick={reklamEkle} className={btnOrange + ' w-full'}>
                Reklam Ekle
              </button>
            </div>
          </div>
        )}

        {/* DUYURULAR */}
        {!yukleniyor && aktifSekme === 'duyurular' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-3">
              {duyurular.map((d) => (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{d.baslik}</p>
                      <p className="text-xs text-slate-500 mt-1">{d.mesaj}</p>
                      <p className="text-xs text-slate-400 mt-1">{d.saniye} saniye sonra goster</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <button
                        onClick={() => duyuruToggle(d.id, d.aktif)}
                        className={'text-xs font-semibold px-3 py-1.5 rounded-lg border transition ' +
                          (d.aktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200')}
                      >
                        {d.aktif ? 'Aktif' : 'Pasif'}
                      </button>
                      <button onClick={() => duyuruSil(d.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {duyurular.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">
                  Hic duyuru eklenmemis
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <PlusCircle size={15} className="text-orange-500" />
                Yeni Duyuru
              </p>
              <input className={inputClass + ' mb-2'} placeholder="Baslik"
                value={yeniDuyuru.baslik}
                onChange={e => setYeniDuyuru({ ...yeniDuyuru, baslik: e.target.value })} />
              <textarea className={inputClass + ' mb-2 resize-none'} placeholder="Mesaj" rows={3}
                value={yeniDuyuru.mesaj}
                onChange={e => setYeniDuyuru({ ...yeniDuyuru, mesaj: e.target.value })} />
              <input className={inputClass + ' mb-2'} placeholder="Resim URL (opsiyonel)"
                value={yeniDuyuru.resim_url}
                onChange={e => setYeniDuyuru({ ...yeniDuyuru, resim_url: e.target.value })} />
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-slate-500 flex-shrink-0">Gecikme (sn):</label>
                <input className={inputClass} type="number" min={0} max={30}
                  value={yeniDuyuru.saniye}
                  onChange={e => setYeniDuyuru({ ...yeniDuyuru, saniye: Number(e.target.value) })} />
              </div>
              <button onClick={duyuruEkle} className={btnOrange + ' w-full'}>
                Duyuru Ekle
              </button>
            </div>
          </div>
        )}

        {/* DESTEK */}
        {!yukleniyor && aktifSekme === 'destek' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-3">
              {destekler.map((d) => (
                <div
                  key={d.id}
                  onClick={() => { setSeciliDestek(d); setDestekCevap(d.cevap || ''); }}
                  className={'bg-white rounded-xl border p-4 cursor-pointer hover:border-orange-300 transition ' +
                    (seciliDestek?.id === d.id ? 'border-orange-400' : 'border-slate-200')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{d.konu}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.mesaj}</p>
                    </div>
                    <span className={'ml-4 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ' +
                      (d.durum === 'cevaplandi'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700')}>
                      {d.durum === 'cevaplandi' ? 'Cevaplandi' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
              {destekler.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-sm">
                  Hic destek talebi yok
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit">
              {seciliDestek ? (
                <>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{seciliDestek.konu}</p>
                  <p className="text-xs text-slate-500 mb-3">{seciliDestek.mesaj}</p>
                  <textarea
                    className={inputClass + ' mb-3 resize-none'}
                    placeholder="Cevabin..."
                    rows={5}
                    value={destekCevap}
                    onChange={e => setDestekCevap(e.target.value)}
                  />
                  <button onClick={destekCevapla} className={btnOrange + ' w-full'}>
                    Cevapla
                  </button>
                </>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  Cevaplamak icin bir talep sec
                </p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
