import React, { useState, useEffect } from 'react';
import {
  kullaniciIlanlari, ilanSil, ilanGuncelle, araclarGetir, aracEkle, aracSil,
  favorileriGetir, favoriKaldir, gelenMesajlar, okunmamisMesajSayisi,
  mesajOkunduIsaretle, destekGonder
} from '../lib/ilanlar';
import { Ilan } from '../types';
import { ilceler } from '../data/ilceler';
import { mevcutKullanici } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  Eye, Trash2, Plus, Heart, Car, MessageSquare,
  HelpCircle, User, LogOut, Bell, ChevronLeft, Menu, X, Pencil, Save, ChevronDown, ChevronUp
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
  const [aracForm, setAracForm] = useState({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
  // Mobilde sidebar drawer
  const [menuAcik, setMenuAcik] = useState(false);
  // Düzenleme modalı
  const [duzenleIlan, setDuzenleIlan] = useState<Ilan | null>(null);
  const [duzenleForm, setDuzenleForm] = useState({
    aciklama: '',
    ucret: '',
    ucret_tipi: 'ay',
    servis_turu: [] as string[],
    guzergahlar: [] as any[],
  });
  const [duzenleYukleniyor, setDuzenleYukleniyor] = useState(false);

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
    okunmamisMesajSayisi(userId).then(({ count }) => { if (count) setOkunmamisSayi(count); });
  }, [userId]);

  useEffect(() => {
    if (aktifSekme === 'ilanlar') ilanlariYukle();
    if (aktifSekme === 'araclar') araclarimYukle();
    if (aktifSekme === 'favoriler') favorileriYukle();
    if (aktifSekme === 'mesajlar') mesajlariYukle();
  }, [aktifSekme]);

  useEffect(() => {
    document.body.style.overflow = menuAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAcik]);

  const ilanlariYukle = async () => { setYukleniyor(true); const { data } = await kullaniciIlanlari(userId); if (data) setIlanlar(data as Ilan[]); setYukleniyor(false); };
  const araclarimYukle = async () => { setYukleniyor(true); const { data } = await araclarGetir(userId); if (data) setAraclar(data); setYukleniyor(false); };
  const favorileriYukle = async () => { setYukleniyor(true); const { data } = await favorileriGetir(userId); if (data) setFavoriler(data); setYukleniyor(false); };
  const mesajlariYukle = async () => { setYukleniyor(true); const { data } = await gelenMesajlar(userId); if (data) setMesajlar(data); setYukleniyor(false); };

  const handleIlanSil = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    const { error } = await ilanSil(id);
    if (!error) setIlanlar(ilanlar.filter(i => i.id !== id));
  };

  const handleAracEkle = async () => {
    if (!aracForm.marka || !aracForm.model || !aracForm.plaka) { setHata('Marka, model ve plaka zorunludur.'); return; }
    setHata('');
    const { data, error } = await aracEkle({ ...aracForm, user_id: userId });
    if (!error && data) {
      setAraclar([...araclar, data[0]]);
      setAracForm({ marka: '', model: '', yil: '', plaka: '', koltuk_sayisi: '', arac_tipi: '' });
      setAracFormAcik(false);
      setBasari('Araç başarıyla eklendi!');
      setTimeout(() => setBasari(''), 3000);
    }
  };

  const handleAracSil = async (id: string) => {
    if (!confirm('Bu aracı silmek istediğinizden emin misiniz?')) return;
    const { error } = await aracSil(id);
    if (!error) setAraclar(araclar.filter(a => a.id !== id));
  };

  const handleFavoriKaldir = async (ilanId: string) => {
    await favoriKaldir(userId, ilanId);
    setFavoriler(favoriler.filter(f => f.ilan_id !== ilanId));
  };

  const handleMesajOku = async (mesajId: string) => {
    await mesajOkunduIsaretle(mesajId);
    setMesajlar(mesajlar.map(m => m.id === mesajId ? { ...m, okundu: true } : m));
    setOkunmamisSayi(Math.max(0, okunmamisSayi - 1));
  };

  const handleProfilGuncelle = async () => {
    setHata(''); setBasari('');
    const updates: any = { full_name: profil.ad, adres: profil.adres, il: profil.il, ilce: profil.ilce };
    if (profil.yeniSifre) {
      const enc = new TextEncoder();
      const data = enc.encode(profil.yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
      updates.sifre_acik = profil.yeniSifre;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) { setHata('Güncelleme sırasında hata oluştu.'); }
    else { const u = { ...user, ...updates }; localStorage.setItem('user', JSON.stringify(u)); setBasari('Bilgileriniz başarıyla güncellendi!'); setProfil({ ...profil, yeniSifre: '' }); }
  };

  const handleHesapSil = async () => {
    if (!confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('user_id', userId);
    await supabase.from('araclar').delete().eq('user_id', userId);
    await supabase.from('favoriler').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    localStorage.removeItem('user');
    onLogout();
  };

  const handleDestekGonder = async () => {
    if (!destekForm.konu || !destekForm.mesaj) { setHata('Konu ve mesaj alanları zorunludur.'); return; }
    const { error } = await destekGonder({ user_id: userId, ...destekForm });
    if (!error) { setDestekGonderildi(true); setDestekForm({ konu: '', mesaj: '' }); }
  };

  const handleDuzenlemeAc = (ilan: Ilan) => {
    setDuzenleIlan(ilan);
    setDuzenleForm({
      aciklama: ilan.aciklama || '',
      ucret: ilan.ekbilgiler?.ucret || '',
      ucret_tipi: ilan.ekbilgiler?.ucret_tipi || 'ay',
      servis_turu: ilan.servis_turu || [],
      guzergahlar: ilan.guzergahlar ? JSON.parse(JSON.stringify(ilan.guzergahlar)) : [],
    });
  };

  const handleDuzenleKaydet = async () => {
    if (!duzenleIlan) return;
    setDuzenleYukleniyor(true);
    const updates = {
      aciklama: duzenleForm.aciklama,
      servis_turu: duzenleForm.servis_turu,
      guzergahlar: duzenleForm.guzergahlar,
      ekbilgiler: {
        ...(duzenleIlan.ekbilgiler || {}),
        ucret: duzenleForm.ucret,
        ucret_tipi: duzenleForm.ucret_tipi,
      },
    };
    const { error } = await ilanGuncelle(duzenleIlan.id, updates);
    setDuzenleYukleniyor(false);
    if (!error) {
      setIlanlar(ilanlar.map(i => i.id === duzenleIlan.id ? { ...i, ...updates } : i));
      setDuzenleIlan(null);
      setBasari('İlan başarıyla güncellendi!');
      setTimeout(() => setBasari(''), 3000);
    } else {
      setHata('Güncelleme sırasında hata oluştu.');
    }
  };

  const handleGuzergahGuncelle = (idx: number, alan: string, deger: string) => {
    const yeni = [...duzenleForm.guzergahlar];
    yeni[idx] = { ...yeni[idx], [alan]: deger };
    setDuzenleForm({ ...duzenleForm, guzergahlar: yeni });
  };

  const servisTurleri = ['Klima', 'USB Şarj', 'Güvenlik Kamerası', 'WiFi', 'Engelli Erişimi', 'Çocuk Koltuğu'];

  const sekmeSecildi = (id: Sekme) => {
    setAktifSekme(id);
    setMenuAcik(false);
  };

  const ilceleri = profil.il ? (ilceler[profil.il] || []) : [];
  const ic = 'w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';
  const btnO = 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition';
  const btnS = 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-sm font-medium px-4 py-3 rounded-xl transition';

  const menuItems = [
    { id: 'profil',    label: 'Profilim',     icon: User },
    { id: 'ilanlar',   label: 'İlanlarım',    icon: Eye },
    { id: 'araclar',   label: 'Araçlarım',    icon: Car },
    { id: 'mesajlar',  label: 'Mesajlar',     icon: MessageSquare, badge: okunmamisSayi },
    { id: 'favoriler', label: 'Favorilerim',  icon: Heart },
    { id: 'destek',    label: 'Destek',       icon: HelpCircle },
  ];

  const sekmeBulunan = menuItems.find(m => m.id === aktifSekme);

  // ── Sidebar içeriği (hem drawer hem masaüstü) ─────────────────────────────
  const SidebarIcerik = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 px-4 py-4">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mb-2">
          <User size={18} className="text-white" />
        </div>
        <p className="text-white font-semibold text-sm truncate">{user?.full_name || 'Kullanıcı'}</p>
        <p className="text-slate-400 text-xs truncate">{user?.phone_number}</p>
      </div>
      <nav className="py-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const aktif = aktifSekme === item.id;
          return (
            <button key={item.id} onClick={() => sekmeSecildi(item.id as Sekme)}
              className={'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition ' +
                (aktif ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}>
              <span className="flex items-center gap-2.5"><Icon size={15} />{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={'text-xs px-1.5 py-0.5 rounded-full font-bold ' + (aktif ? 'bg-white/20 text-white' : 'bg-red-500 text-white')}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
        <button onClick={() => { onIlanEkle(); setMenuAcik(false); }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5">
          <Plus size={13} /> İlan Ver
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-red-500 text-xs py-2.5 rounded-lg hover:bg-red-50 transition">
          <LogOut size={13} /> Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* MOBİL ÜST BAR */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuAcik(true)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-slate-800 text-sm">{sekmeBulunan?.label || 'Panel'}</span>
        </div>
        <div className="flex items-center gap-2">
          {okunmamisSayi > 0 && (
            <button onClick={() => sekmeSecildi('mesajlar')} className="relative p-1.5 text-slate-400">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{okunmamisSayi}</span>
            </button>
          )}
          <button onClick={onIlanEkle} className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            + İlan Ver
          </button>
        </div>
      </div>

      {/* MOBİL SIDEBAR DRAWER */}
      {menuAcik && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMenuAcik(false)} />
          <div className="w-72 bg-slate-100 h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
              <span className="text-white font-semibold text-sm">Hesabım</span>
              <button onClick={() => setMenuAcik(false)} className="p-1 text-slate-300 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-3 flex-1">
              <SidebarIcerik />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

          {/* MASAÜSTÜ SIDEBAR */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <SidebarIcerik />
          </aside>

          {/* ANA İÇERİK */}
          <main className="flex-1 min-w-0">

            {/* PROFİL */}
            {aktifSekme === 'profil' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-base mb-4">Profil Bilgilerim</h2>
                {basari && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{basari}</div>}
                {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{hata}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Ad Soyad</label>
                    <input className={ic} value={profil.ad} onChange={e => setProfil({ ...profil, ad: e.target.value })} placeholder="Ad Soyadınız" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">GSM Numaranız</label>
                    <input className={ic + ' bg-slate-50 text-slate-400 cursor-not-allowed'} value={profil.telefon} disabled />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Adres</label>
                  <textarea className={ic + ' resize-none'} value={profil.adres} onChange={e => setProfil({ ...profil, adres: e.target.value })} placeholder="Adresiniz" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">İl</label>
                    <select className={ic} value={profil.il} onChange={e => setProfil({ ...profil, il: e.target.value, ilce: '' })}>
                      <option value="">Seçiniz</option>
                      {iller.map(il => <option key={il} value={il}>{il}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">İlçe</label>
                    <select className={ic} value={profil.ilce} disabled={!profil.il} onChange={e => setProfil({ ...profil, ilce: e.target.value })}>
                      <option value="">Seçiniz</option>
                      {ilceleri.map(ilce => <option key={ilce} value={ilce}>{ilce}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Yeni Şifre</label>
                  <input type="password" className={ic} value={profil.yeniSifre} onChange={e => setProfil({ ...profil, yeniSifre: e.target.value })} placeholder="Değiştirmek istemiyorsanız boş bırakın" />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button onClick={handleHesapSil} className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition text-center">
                    Hesabı Kapat
                  </button>
                  <button onClick={handleProfilGuncelle} className={btnO}>Bilgileri Güncelle</button>
                </div>
              </div>
            )}

            {/* İLANLARIM */}
            {aktifSekme === 'ilanlar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">İlanlarım</h2>
                  <button onClick={onIlanEkle} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5">
                    <Plus size={13} /> Yeni İlan
                  </button>
                </div>
                {yukleniyor ? (
                  <div className="p-4 flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
                ) : ilanlar.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-sm font-medium mb-3">Henüz ilanınız yok</p>
                    <button onClick={onIlanEkle} className={btnO}>İlan Ver</button>
                  </div>
                ) : (
                  /* Mobilde kart görünümü, masaüstünde tablo */
                  <>
                    {/* MOBİL KART GÖRÜNÜMÜ */}
                    <div className="sm:hidden divide-y divide-slate-100">
                      {ilanlar.map(ilan => (
                        <div key={ilan.id} className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-slate-700 font-medium text-sm line-clamp-2 flex-1">{ilan.aciklama}</p>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => onIlanDetay(ilan)} className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 rounded-lg">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleDuzenlemeAc(ilan)} className="p-2 text-slate-400 hover:text-orange-500 bg-slate-50 rounded-lg">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleIlanSil(ilan.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{ilan.kategori.replace(/_/g, ' ')}</span>
                            <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                              {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* MASAÜSTÜ TABLO */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {['İlan', 'Kategori', 'Tarih', 'Durum', 'İşlem'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ilanlar.map(ilan => (
                            <tr key={ilan.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                              <td className="px-4 py-3">
                                <p className="text-slate-700 font-medium text-sm line-clamp-1 max-w-xs">{ilan.aciklama}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{ilan.guzergahlar[0]?.kalkis_ilce} - {ilan.guzergahlar[0]?.varis_ilce}</p>
                              </td>
                              <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">{ilan.kategori.replace(/_/g, ' ')}</span></td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</td>
                              <td className="px-4 py-3">
                                <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                                  {ilan.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => onIlanDetay(ilan)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye size={14} /></button>
                                  <button onClick={() => handleDuzenlemeAc(ilan)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"><Pencil size={14} /></button>
                                  <button onClick={() => handleIlanSil(ilan.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ARAÇLARIM */}
            {aktifSekme === 'araclar' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Araçlarım</h2>
                  <button onClick={() => setAracFormAcik(!aracFormAcik)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5">
                    <Plus size={13} /> Araç Ekle
                  </button>
                </div>
                {basari && <div className="mx-4 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{basari}</div>}
                {hata && <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{hata}</div>}
                {aracFormAcik && (
                  <div className="mx-4 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Yeni Araç Ekle</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      {[
                        { label: 'Marka', type: 'select', options: markalar, field: 'marka' },
                        { label: 'Model', type: 'input', placeholder: 'Sprinter, Transit...', field: 'model' },
                        { label: 'Yıl', type: 'input', placeholder: '2020', field: 'yil' },
                        { label: 'Plaka', type: 'input', placeholder: '34 ABC 123', field: 'plaka' },
                        { label: 'Koltuk Sayısı', type: 'input', placeholder: '16+1', field: 'koltuk_sayisi' },
                        { label: 'Araç Tipi', type: 'select', options: aracTipleri, field: 'arac_tipi' },
                      ].map(({ label, type, options, placeholder, field }: any) => (
                        <div key={field}>
                          <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                          {type === 'select' ? (
                            <select className={ic} value={(aracForm as any)[field]} onChange={e => setAracForm({ ...aracForm, [field]: e.target.value })}>
                              <option value="">Seçin</option>
                              {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input className={ic} value={(aracForm as any)[field]} placeholder={placeholder} onChange={e => setAracForm({ ...aracForm, [field]: e.target.value })} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAracFormAcik(false)} className={btnS + ' flex-1'}>İptal</button>
                      <button onClick={handleAracEkle} className={btnO + ' flex-1'}>Kaydet</button>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">{[1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                  ) : araclar.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Car size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Henüz araç eklemediniz</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {araclar.map(arac => (
                        <div key={arac.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Car size={18} className="text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700 text-sm">{arac.marka} {arac.model} {arac.yil}</p>
                              <p className="text-xs text-slate-400 truncate">{arac.plaka} · {arac.koltuk_sayisi} koltuk · {arac.arac_tipi}</p>
                            </div>
                          </div>
                          <button onClick={() => handleAracSil(arac.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition flex-shrink-0 ml-2">
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
                <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">İlan Mesajları</h2>
                  {okunmamisSayi > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{okunmamisSayi} okunmamış</span>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">{[1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                  ) : mesajlar.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Henüz mesajınız yok</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {mesajlar.map(mesaj => (
                        <div key={mesaj.id}
                          onClick={() => !mesaj.okundu && handleMesajOku(mesaj.id)}
                          className={'border rounded-xl p-4 cursor-pointer transition ' + (mesaj.okundu ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50 active:bg-orange-100')}>
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700 text-sm">{mesaj.gonderen?.full_name || mesaj.gonderen?.phone_number}</p>
                              <p className="text-xs text-slate-400 truncate">{mesaj.ilanlar?.aciklama}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!mesaj.okundu && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
                              <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(mesaj.created_at).toLocaleDateString('tr-TR')}</span>
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

            {/* FAVORİLER */}
            {aktifSekme === 'favoriler' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-base">Favori İlanlarım</h2>
                </div>
                <div className="p-4 sm:p-5">
                  {yukleniyor ? (
                    <div className="flex flex-col gap-3">{[1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                  ) : favoriler.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Heart size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Henüz favori ilanınız yok</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {favoriler.map(fav => (
                        <div key={fav.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 text-sm line-clamp-1">{fav.ilanlar?.aciklama}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{fav.ilanlar?.ilan_veren} · {fav.ilanlar?.kategori?.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                            <button onClick={() => onIlanDetay(fav.ilanlar)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition"><Eye size={14} /></button>
                            <button onClick={() => handleFavoriKaldir(fav.ilan_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"><Heart size={14} /></button>
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
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-base mb-4">Destek</h2>
                {destekGonderildi ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 text-xl font-bold">✓</span>
                    </div>
                    <p className="font-semibold text-green-700 mb-1">Talebiniz Alındı</p>
                    <p className="text-green-600 text-sm mb-4">En kısa sürede size döneceğiz.</p>
                    <button onClick={() => setDestekGonderildi(false)} className={btnO}>Yeni Talep Gönder</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {hata && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{hata}</div>}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Konu</label>
                      <input className={ic} value={destekForm.konu} placeholder="Destek konusu" onChange={e => setDestekForm({ ...destekForm, konu: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Mesaj</label>
                      <textarea className={ic + ' resize-none'} value={destekForm.mesaj} placeholder="Mesajınızı yazın..." rows={5} onChange={e => setDestekForm({ ...destekForm, mesaj: e.target.value })} />
                    </div>
                    <button onClick={handleDestekGonder} className={btnO}>Gönder</button>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
      {/* DÜZENLEME MODALI */}
      {duzenleIlan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-orange-500 rounded-t-2xl sm:rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <Pencil size={16} className="text-white" />
                <h3 className="font-bold text-white text-sm">İlanı Düzenle</h3>
              </div>
              <button onClick={() => setDuzenleIlan(null)} className="text-white/80 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal İçerik */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">

              {/* Açıklama */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Açıklama</label>
                <textarea
                  className={ic + ' resize-none'}
                  rows={3}
                  value={duzenleForm.aciklama}
                  onChange={e => setDuzenleForm({ ...duzenleForm, aciklama: e.target.value })}
                  placeholder="İlan açıklaması..."
                />
              </div>

              {/* Ücret */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Ücret (₺)</label>
                  <input
                    type="number"
                    className={ic}
                    value={duzenleForm.ucret}
                    onChange={e => setDuzenleForm({ ...duzenleForm, ucret: e.target.value })}
                    placeholder="örn. 45000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Ücret Tipi</label>
                  <select
                    className={ic}
                    value={duzenleForm.ucret_tipi}
                    onChange={e => setDuzenleForm({ ...duzenleForm, ucret_tipi: e.target.value })}
                  >
                    <option value="ay">Aylık</option>
                    <option value="gün">Günlük</option>
                    <option value="sefer">Sefer Başı</option>
                    <option value="yıl">Yıllık</option>
                  </select>
                </div>
              </div>

              {/* Güzergahlar */}
              {duzenleForm.guzergahlar.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                    Güzergahlar ({duzenleForm.guzergahlar.length} adet)
                  </label>
                  <div className="space-y-3">
                    {duzenleForm.guzergahlar.map((g, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Güzergah {idx + 1}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400 mb-1 block">Giriş Saati</label>
                            <input
                              type="time"
                              className={ic}
                              value={g.giris_saati || ''}
                              onChange={e => handleGuzergahGuncelle(idx, 'giris_saati', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 mb-1 block">Çıkış Saati</label>
                            <input
                              type="time"
                              className={ic}
                              value={g.cikis_saati || ''}
                              onChange={e => handleGuzergahGuncelle(idx, 'cikis_saati', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 mb-1 block">Kalkış Mahalle</label>
                            <input
                              className={ic}
                              value={g.kalkis_mah || ''}
                              onChange={e => handleGuzergahGuncelle(idx, 'kalkis_mah', e.target.value)}
                              placeholder="Mahalle"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 mb-1 block">Varış Mahalle</label>
                            <input
                              className={ic}
                              value={g.varis_mah || ''}
                              onChange={e => handleGuzergahGuncelle(idx, 'varis_mah', e.target.value)}
                              placeholder="Mahalle"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servis Türü */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Özellikler</label>
                <div className="flex flex-wrap gap-2">
                  {servisTurleri.map(tur => {
                    const secili = duzenleForm.servis_turu.includes(tur);
                    return (
                      <button
                        key={tur}
                        type="button"
                        onClick={() => setDuzenleForm({
                          ...duzenleForm,
                          servis_turu: secili
                            ? duzenleForm.servis_turu.filter(t => t !== tur)
                            : [...duzenleForm.servis_turu, tur]
                        })}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                          secili
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        {tur}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Alt Butonlar */}
            <div className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setDuzenleIlan(null)}
                className={btnS + ' flex-1'}
              >
                İptal
              </button>
              <button
                onClick={handleDuzenleKaydet}
                disabled={duzenleYukleniyor}
                className={btnO + ' flex-1 flex items-center justify-center gap-2 disabled:opacity-60'}
              >
                {duzenleYukleniyor ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {duzenleYukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
