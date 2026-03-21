import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Lock, Unlock, Phone, MapPin, Calendar, LayoutDashboard
} from 'lucide-react';
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
    ilan_silebilir: boolean;
    profil_duzenleyebilir: boolean;
    destek_acabilir: boolean;
  };
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ilanlar', label: 'İlan Yönetimi', icon: FileText },
  { id: 'kullanicilar', label: 'Kullanıcılar', icon: Users },
  { id: 'destek', label: 'Destek Talepleri', icon: HelpCircle },
];

const durumRenk: Record<string, string> = {
  beklemede: 'bg-orange-100 text-orange-700',
  islemde: 'bg-blue-100 text-blue-700',
  cozuldu: 'bg-green-100 text-green-700',
};

// --- YARDIMCI BİLEŞEN: DESTEK KARTI ---
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
    <div className={`border rounded-xl p-5 shadow-sm transition-all ${destek.durum === 'beklemede' ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-gray-400">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-800">{destek.konu}</p>
            <p className="text-xs text-gray-500">
              {destek.profiles?.full_name || destek.profiles?.phone_number} • {new Date(destek.created_at).toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${durumRenk[destek.durum] || 'bg-gray-100'}`}>
          {destek.durum.toUpperCase()}
        </span>
      </div>
      <div className="text-sm text-gray-700 mb-4 p-4 bg-white/80 rounded-xl border border-dashed border-gray-200 leading-relaxed italic">
        "{destek.mesaj}"
      </div>
      
      {destek.cevap && (
        <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-xl relative">
          <div className="absolute -top-2 left-4 px-2 bg-green-100 text-green-700 text-[10px] font-bold rounded">ADMİN YANITI</div>
          <p className="text-sm text-gray-700">{destek.cevap}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {['beklemede', 'islemde', 'cozuldu'].map((d) => (
            destek.durum !== d && (
              <button key={d} onClick={() => handleDurumDegistir(d)} disabled={yukleniyor}
                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition shadow-sm">
                {d} yap
              </button>
            )
          ))}
        </div>
        <button onClick={() => setCevapAcik(!cevapAcik)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#1a3c6e] text-white rounded-lg hover:bg-blue-900 transition shadow-md">
          {cevapAcik ? <X size={16}/> : <Edit size={16}/>}
          {cevapAcik ? 'İptal' : 'Yanıtla'}
        </button>
      </div>

      {cevapAcik && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <textarea value={cevapMetni} onChange={(e) => setCevapMetni(e.target.value)}
            placeholder="Cevabınızı buraya yazın..." rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e] bg-white shadow-inner" />
          <div className="flex justify-end">
            <button onClick={handleCevapGonder} disabled={yukleniyor || !cevapMetni.trim()}
              className="px-6 py-2 bg-[#f97316] text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition shadow-lg flex items-center gap-2">
              <Save size={16}/> {yukleniyor ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- YARDIMCI BİLEŞEN: KULLANICI DETAY (MODAL) ---
function KullaniciDetay({ kullanici, onKapat, onGuncelle, onSil }: {
  kullanici: Profile;
  onKapat: () => void;
  onGuncelle: (id: string, updates: any) => void;
  onSil: (id: string) => void;
}) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniSifre, setYeniSifre] = useState(kullanici.sifre_acik || '');
  const [yetkiler, setYetkiler] = useState(kullanici.yetkiler || { 
    ilan_verebilir: true, 
    mesaj_gonderebilir: true, 
    favori_ekleyebilir: true,
    ilan_silebilir: false,
    profil_duzenleyebilir: true,
    destek_acabilir: true
  });
  const [aktif, setAktif] = useState(kullanici.aktif !== false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basari, setBasari] = useState('');

  const handleKaydet = async () => {
    setYukleniyor(true);
    const updates: any = { yetkiler, aktif, sifre_acik: yeniSifre };
    
    // Şifre değişmişse hash'le
    if (yeniSifre !== kullanici.sifre_acik) {
      const encoder = new TextEncoder();
      const data = encoder.encode(yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', kullanici.id);
    
    if (!error) {
      onGuncelle(kullanici.id, updates);
      setYukleniyor(false);
      setDuzenle(false);
      setBasari('Değişiklikler başarıyla kaydedildi!');
      setTimeout(() => setBasari(''), 3000);
    } else {
      alert("Güncelleme sırasında hata oluştu!");
      setYukleniyor(false);
    }
  };

  const toggleYetki = (key: string) => {
    if (!duzenle) return;
    setYetkiler(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1a3c6e] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/10">
              {kullanici.profil_resmi ? (
                <img src={kullanici.profil_resmi} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-full h-full p-2 text-white/50" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{kullanici.full_name || 'İsimsiz Kullanıcı'}</h3>
              <p className="text-xs text-blue-200">{kullanici.phone_number}</p>
            </div>
          </div>
          <button onClick={onKapat} className="p-2 hover:bg-white/10 rounded-full transition"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {basari && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-bounce">
              <CheckCircle size={18} /> {basari}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol Kolon: Bilgiler */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Kullanıcı Bilgileri</h4>
              
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Görünen Şifre</label>
                <div className="flex items-center gap-2 mt-1">
                  <Lock size={14} className="text-orange-500" />
                  {duzenle ? (
                    <input 
                      type="text" 
                      value={yeniSifre} 
                      onChange={(e) => setYeniSifre(e.target.value)}
                      className="bg-white border rounded px-2 py-1 w-full text-sm font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-mono font-bold text-gray-700">{kullanici.sifre_acik || 'Belirlenmemiş'}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-blue-500" /> {kullanici.phone_number}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-red-500" /> {kullanici.il} / {kullanici.ilce}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar size={16} className="text-green-500" /> {new Date(kullanici.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Sağ Kolon: Yetkiler */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Hesap & Yetkiler</h4>
                <button onClick={() => setDuzenle(!duzenle)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                  <Edit size={12} /> {duzenle ? 'İptal' : 'Düzenle'}
                </button>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-4">
                {/* Hesap Aktiflik Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Hesap Durumu (Aktif)</span>
                  <button 
                    onClick={() => duzenle && setAktif(!aktif)}
                    disabled={!duzenle}
                    className={`w-12 h-6 rounded-full relative transition-colors ${aktif ? 'bg-green-500' : 'bg-gray-300'} ${!duzenle && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aktif ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="h-px bg-blue-100 my-2" />

                {/* Yetki Listesi */}
                {[
                  { key: 'ilan_verebilir', label: 'İlan Verebilir' },
                  { key: 'mesaj_gonderebilir', label: 'Mesaj Gönderebilir' },
                  { key: 'favori_ekleyebilir', label: 'Favori Ekleyebilir' },
                  { key: 'ilan_silebilir', label: 'Kendi İlanını Silebilir' },
                  { key: 'profil_duzenleyebilir', label: 'Profil Güncelleyebilir' },
                  { key: 'destek_acabilir', label: 'Destek Talebi Açabilir' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <button 
                      onClick={() => toggleYetki(item.key)}
                      disabled={!duzenle}
                      className={`w-10 h-5 rounded-full relative transition-colors ${(yetkiler as any)[item.key] ? 'bg-blue-600' : 'bg-gray-300'} ${!duzenle && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${(yetkiler as any)[item.key] ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t flex gap-3">
          {duzenle ? (
            <button onClick={handleKaydet} disabled={yukleniyor}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
              <Save size={18} /> {yukleniyor ? 'Kaydediliyor...' : 'Değişiklikleri Uygula'}
            </button>
          ) : (
            <button onClick={() => onSil(kullanici.id)}
              className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2">
              <Trash2 size={18} /> Kullanıcıyı Tamamen Sil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- ANA SAYFA: ADMIN PANEL ---
export default function AdminPage({
  onLogout,
  onIlanDetay,
}: {
  onLogout: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<Profile | null>(null);
  const [bekleyenDestek, setBekleyenDestek] = useState(0);
  const [aramaMetni, setAramaMetni] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    verileriGetir();
  }, [activeMenu]);

  const verileriGetir = async () => {
    setYukleniyor(true);
    if (activeMenu === 'dashboard' || activeMenu === 'ilanlar') {
      const { data } = await supabase.from('ilanlar').select('*').order('created_at', { ascending: false });
      if (data) setIlanlar(data as Ilan[]);
    }
    if (activeMenu === 'dashboard' || activeMenu === 'kullanicilar') {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setKullanicilar(data as Profile[]);
    }
    if (activeMenu === 'dashboard' || activeMenu === 'destek') {
      const { data } = await destekTalepleriniGetir();
      if (data) {
        setDestekler(data);
        setBekleyenDestek(data.filter((d: any) => d.durum === 'beklemede').length);
      }
    }
    setYukleniyor(false);
  };

  const handleIlanSil = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    await supabase.from('ilanlar').delete().eq('id', id);
    setIlanlar(ilanlar.filter((i) => i.id !== id));
  };

  const handleDurumDegistir = async (id: string, durum: string) => {
    const yeniDurum = durum === 'aktif' ? 'pasif' : 'aktif';
    await supabase.from('ilanlar').update({ durum: yeniDurum }).eq('id', id);
    setIlanlar(ilanlar.map((i) => i.id === id ? { ...i, durum: yeniDurum } : i));
  };

  const handleKullaniciSil = async (id: string) => {
    if (!confirm('DİKKAT! Bu kullanıcıyı silmek, ona ait TÜM ilanları ve araçları da silecektir. Onaylıyor musunuz?')) return;
    await supabase.from('ilanlar').delete().eq('user_id', id);
    await supabase.from('profiles').delete().eq('id', id);
    setKullanicilar(kullanicilar.filter((k) => k.id !== id));
    setSecilenKullanici(null);
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      
      {/* MOBIL HEADER */}
      <div className="md:hidden bg-[#1a3c6e] p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2 text-white">
          <Shield className="text-orange-400" />
          <span className="font-black tracking-tighter text-xl uppercase">SALONUM <span className="text-orange-400">ADMİN</span></span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[100] w-72 bg-[#1a3c6e] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-orange-400 rounded-xl rotate-12 flex items-center justify-center shadow-lg">
              <Shield className="text-[#1a3c6e] -rotate-12" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">SALONUM <span className="text-orange-400 italic font-medium text-sm">panel</span></span>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${activeMenu === item.id ? 'bg-orange-400 text-[#1a3c6e] font-bold shadow-lg shadow-orange-400/20' : 'hover:bg-white/10 text-blue-100'}`}
              >
                <item.icon size={20} className={activeMenu === item.id ? 'text-[#1a3c6e]' : 'text-blue-300 group-hover:text-white'} />
                {item.label}
                {item.id === 'destek' && bekleyenDestek > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
                    {bekleyenDestek}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-5 py-4 rounded-2xl text-red-300 hover:bg-red-500/10 hover:text-red-100 transition-colors">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* KARARTMA (Mobil Sidebar için) */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* ANA İÇERİK */}
      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          
          {/* Dashboard İstatistikleri */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                    <Users size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kullanıcılar</p>
                    <h3 className="text-3xl font-black text-gray-800">{kullanicilar.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                    <FileText size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Toplam İlan</p>
                    <h3 className="text-3xl font-black text-gray-800">{ilanlar.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                    <HelpCircle size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bekleyen Destek</p>
                    <h3 className="text-3xl font-black text-gray-800">{bekleyenDestek}</h3>
                  </div>
                </div>
              </div>

              {/* Son Aktiviteler / Hızlı Bakış */}
              <div className="bg-[#1a3c6e] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-2">Hoş Geldin, Admin! 👋</h2>
                  <p className="text-blue-200 text-sm max-w-md">Salonum.site platformundaki tüm kullanıcıları, ilanları ve destek taleplerini buradan kontrol edebilir, yetkileri yönetebilirsin.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              </div>
            </div>
          )}

          {/* İlan Yönetimi */}
          {activeMenu === 'ilanlar' && (
            <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xl font-black text-[#1a3c6e] flex items-center gap-2">
                  <FileText /> İlan Listesi
                </h2>
                <span className="bg-[#1a3c6e] text-white text-xs font-bold px-3 py-1 rounded-full">{ilanlar.length} İlan</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 uppercase text-[10px] font-black tracking-tighter border-b">
                      <th className="px-6 py-4">Açıklama</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Yayınlayan</th>
                      <th className="px-6 py-4">Durum</th>
                      <th className="px-6 py-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ilanlar.map((ilan) => (
                      <tr key={ilan.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-700 line-clamp-1">{ilan.aciklama}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-[#1a3c6e] text-[10px] font-black px-2 py-1 rounded uppercase">
                            {ilan.kategori.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{ilan.ilan_veren}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDurumDegistir(ilan.id, ilan.durum)}
                            className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full transition-all ${ilan.durum === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${ilan.durum === 'aktif' ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`} />
                            {ilan.durum.toUpperCase()}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onIlanDetay(ilan)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Eye size={16}/></button>
                            <button onClick={() => handleIlanSil(ilan.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kullanıcı Yönetimi */}
          {activeMenu === 'kullanicilar' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2rem] border shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-black text-[#1a3c6e] flex items-center gap-2">
                    <Users /> Kullanıcı Kontrolü
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      value={aramaMetni}
                      onChange={(e) => setAramaMetni(e.target.value)}
                      placeholder="İsim, telefon veya il ara..."
                      className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-80 shadow-inner"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 uppercase text-[10px] font-black border-b">
                        <th className="px-4 py-3">Kullanıcı</th>
                        <th className="px-4 py-3">Telefon</th>
                        <th className="px-4 py-3 text-orange-600"><Lock size={12} className="inline mr-1" /> Şifre</th>
                        <th className="px-4 py-3">Bölge</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtreliKullanicilar.map((k) => (
                        <tr key={k.id} onClick={() => setSecilenKullanici(k)}
                          className={`cursor-pointer transition-all hover:bg-blue-50/50 group ${secilenKullanici?.id === k.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                          <td className="px-4 py-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden shadow-sm">
                              {k.profil_resmi ? <img src={k.profil_resmi} className="w-full h-full object-cover" /> : k.full_name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{k.full_name || 'İsimsiz'}</p>
                              <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 px-1.5 rounded">{k.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-600">{k.phone_number}</td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                              {k.sifre_acik || '******'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500">{k.il || '-'}</td>
                          <td className="px-4 py-4">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${k.aktif !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {k.aktif !== false ? 'AKTİF' : 'PASİF'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button className="p-2 text-[#1a3c6e] bg-gray-50 rounded-lg group-hover:bg-[#1a3c6e] group-hover:text-white transition-all shadow-sm">
                              <Unlock size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

          {/* Destek Talepleri */}
          {activeMenu === 'destek' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#1a3c6e] flex items-center gap-2">
                  <HelpCircle /> Destek Merkezi
                </h2>
                {bekleyenDestek > 0 && (
                  <div className="bg-red-500 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg animate-pulse">
                    {bekleyenDestek} BEKLEYEN TALEP VAR
                  </div>
                )}
              </div>
              
              {destekler.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-dashed border-gray-300 py-20 text-center text-gray-400">
                  <HelpCircle size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold">Henüz hiç destek talebi gelmedi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {destekler.map((destek) => (
                    <DestekKart key={destek.id} destek={destek} onGuncelle={verileriGetir} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
