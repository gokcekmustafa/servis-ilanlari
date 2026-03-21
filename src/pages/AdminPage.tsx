import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Lock, Unlock, Phone, MapPin, Calendar, 
  LayoutDashboard, UserPlus, ShieldCheck, EyeOff, Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { destekTalepleriniGetir, destekDurumGuncelle } from '../lib/ilanlar';
import { Ilan } from '../types';

// Superadmin Sabiti
const SUPER_ADMIN_PHONE = "05369500280";

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
    view_dashboard: boolean;
    manage_ads: boolean;
    manage_users: boolean;
    view_passwords: boolean;
    manage_support: boolean;
    manage_staff: boolean;
    delete_data: boolean;
    profil_duzenleyebilir: boolean;
    destek_acabilir: boolean;
  };
}

const durumRenk: Record<string, string> = {
  beklemede: 'bg-orange-100 text-orange-700',
  islemde: 'bg-blue-100 text-blue-700',
  cozuldu: 'bg-green-100 text-green-700',
};

// --- BİLEŞEN: DESTEK KARTI ---
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
        <div className="mt-4 space-y-3">
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

// --- BİLEŞEN: KULLANICI DETAY ---
function KullaniciDetay({ kullanici, onKapat, onGuncelle, onSil, isSuper, canSeePasswords }: {
  kullanici: Profile;
  onKapat: () => void;
  onGuncelle: (id: string, updates: any) => void;
  onSil: (id: string) => void;
  isSuper: boolean;
  canSeePasswords: boolean;
}) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniSifre, setYeniSifre] = useState(kullanici.sifre_acik || '');
  const [yetkiler, setYetkiler] = useState(kullanici.yetkiler || { 
    ilan_verebilir: true, mesaj_gonderebilir: true, favori_ekleyebilir: true,
    view_dashboard: false, manage_ads: false, manage_users: false, 
    view_passwords: false, manage_support: false, manage_staff: false, delete_data: false
  });
  const [aktif, setAktif] = useState(kullanici.aktif !== false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleKaydet = async () => {
    setYukleniyor(true);
    const updates: any = { yetkiler, aktif, sifre_acik: yeniSifre };
    if (yeniSifre !== kullanici.sifre_acik) {
      const encoder = new TextEncoder();
      const data = encoder.encode(yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    await supabase.from('profiles').update(updates).eq('id', kullanici.id);
    onGuncelle(kullanici.id, updates);
    setYukleniyor(false);
    setDuzenle(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#1a3c6e] p-6 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{kullanici.full_name || 'Kullanıcı Detayı'}</h3>
          <button onClick={onKapat} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 border-b pb-1 uppercase">Genel Bilgiler</h4>
              <div className="bg-gray-50 p-3 rounded-xl border">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Şifre (Açık)</p>
                {canSeePasswords ? (
                  duzenle ? (
                    <input value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} className="w-full text-sm font-mono border rounded px-2 mt-1" />
                  ) : (
                    <p className="font-mono font-bold text-orange-600">{kullanici.sifre_acik || 'Belirtilmemiş'}</p>
                  )
                ) : <p className="text-gray-400 italic text-sm">Görmeye yetkiniz yok</p>}
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Telefon:</strong> {kullanici.phone_number}</p>
                <p><strong>Bölge:</strong> {kullanici.il} / {kullanici.ilce}</p>
                <p><strong>Adres:</strong> {kullanici.adres}</p>
                <p><strong>Tür:</strong> {kullanici.type}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-sm font-bold text-gray-400 uppercase">Hesap & Yetkiler</h4>
                <button onClick={() => setDuzenle(!duzenle)} className="text-xs text-blue-600 font-bold hover:underline">Düzenle</button>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                <label className="flex items-center justify-between text-xs font-bold text-gray-600">
                  <span>HESAP AKTİF</span>
                  <input type="checkbox" disabled={!duzenle} checked={aktif} onChange={() => setAktif(!aktif)} className="w-4 h-4" />
                </label>
                {Object.keys(yetkiler).map((key) => (
                  <label key={key} className="flex items-center justify-between text-xs text-gray-500">
                    <span className="uppercase">{key.replace(/_/g, ' ')}</span>
                    <input type="checkbox" disabled={!duzenle} checked={(yetkiler as any)[key]} onChange={() => setYetkiler({...yetkiler, [key]: !(yetkiler as any)[key]})} className="w-4 h-4" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          {duzenle ? (
            <button onClick={handleKaydet} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold">Değişiklikleri Kaydet</button>
          ) : (
            <button onClick={() => onSil(kullanici.id)} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold">Kullanıcıyı Sil</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- BİLEŞEN: PERSONEL EKLE MODAL ---
function PersonelEkleModal({ onKapat, onEklendi }: { onKapat: () => void, onEklendi: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [yetkiler, setYetkiler] = useState({
    view_dashboard: true, manage_ads: true, manage_users: false, 
    view_passwords: false, manage_support: true, manage_staff: false, 
    delete_data: false, ilan_verebilir: true, mesaj_gonderebilir: true, favori_ekleyebilir: true
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleEkle = async () => {
    if (!form.name || !form.phone || !form.password) return alert("Alanları doldurun!");
    setYukleniyor(true);
    const encoder = new TextEncoder();
    const data = encoder.encode(form.password + 'servis-ilanlari-salt');
    const hash = await crypto.subtle.digest('SHA-256', data);
    const password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    await supabase.from('profiles').insert([{
      full_name: form.name, phone_number: form.phone, password_hash, 
      sifre_acik: form.password, type: 'staff', aktif: true, yetkiler
    }]);
    onEklendi();
    onKapat();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1a3c6e]/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8">
        <h2 className="text-2xl font-black text-[#1a3c6e] mb-6">Personel Ekle</h2>
        <div className="space-y-4 mb-6">
          <input placeholder="Ad Soyad" className="w-full p-3 border rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Telefon" className="w-full p-3 border rounded-xl" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <input placeholder="Şifre" className="w-full p-3 border rounded-xl" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl mb-6 max-h-48 overflow-y-auto space-y-2">
          {Object.keys(yetkiler).map(k => (
            <label key={k} className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
              {k.replace(/_/g, ' ')}
              <input type="checkbox" checked={(yetkiler as any)[k]} onChange={() => setYetkiler({...yetkiler, [k]: !(yetkiler as any)[k]})} />
            </label>
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={onKapat} className="flex-1 font-bold">İptal</button>
          <button onClick={handleEkle} disabled={yukleniyor} className="flex-2 bg-[#1a3c6e] text-white py-3 rounded-xl font-bold flex-1">Kaydet</button>
        </div>
      </div>
    </div>
  );
}

// --- ANA COMPONENT ---
export default function AdminPage({ onLogout, onIlanDetay }: { onLogout: () => void, onIlanDetay: (ilan: Ilan) => void }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<Profile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [personelEkleAcik, setPersonelEkleAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');

  useEffect(() => {
    const check = async () => {
      const saved = localStorage.getItem('user');
      if (saved) {
        const p = JSON.parse(saved);
        const { data } = await supabase.from('profiles').select('*').eq('id', p.id).single();
        if (data) setCurrentUser(data);
      }
    };
    check();
  }, []);

  useEffect(() => {
    verileriYukle();
  }, [activeMenu]);

  const verileriYukle = async () => {
    setYukleniyor(true);
    const { data: ads } = await supabase.from('ilanlar').select('*').order('created_at', { ascending: false });
    if (ads) setIlanlar(ads);
    const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (users) setKullanicilar(users);
    const { data: support } = await destekTalepleriniGetir();
    if (support) setDestekler(support);
    setYukleniyor(false);
  };

  const isSuper = currentUser?.phone_number === SUPER_ADMIN_PHONE;
  const canSeePasswords = isSuper || currentUser?.yetkiler?.view_passwords;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1a3c6e] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center"><Shield size={28}/></div>
            <h1 className="font-black text-xl">SALONUM ADMİN</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${activeMenu === 'dashboard' ? 'bg-orange-400 text-blue-900 font-bold' : ''}`}><LayoutDashboard size={20}/> Dashboard</button>
            <button onClick={() => setActiveMenu('ilanlar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${activeMenu === 'ilanlar' ? 'bg-orange-400 text-blue-900 font-bold' : ''}`}><FileText size={20}/> İlanlar</button>
            <button onClick={() => setActiveMenu('kullanicilar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${activeMenu === 'kullanicilar' ? 'bg-orange-400 text-blue-900 font-bold' : ''}`}><Users size={20}/> Kullanıcılar</button>
            <button onClick={() => setActiveMenu('destek')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${activeMenu === 'destek' ? 'bg-orange-400 text-blue-900 font-bold' : ''}`}><HelpCircle size={20}/> Destek</button>
            {isSuper && <button onClick={() => setActiveMenu('personel')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl ${activeMenu === 'personel' ? 'bg-orange-400 text-blue-900 font-bold' : ''}`}><ShieldCheck size={20}/> Personel</button>}
          </nav>
          <button onClick={onLogout} className="mt-auto flex items-center gap-4 p-5 text-red-300 font-bold"><LogOut size={20}/> Çıkış</button>
        </div>
      </aside>

      <div className="md:hidden bg-[#1a3c6e] p-4 flex justify-between text-white">
        <span className="font-bold">ADMİN</span>
        <button onClick={() => setIsSidebarOpen(true)}><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10">
        {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <p className="text-xs font-bold text-gray-400">ÜYELER</p>
              <h3 className="text-3xl font-black">{kullanicilar.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <p className="text-xs font-bold text-gray-400">İLANLAR</p>
              <h3 className="text-3xl font-black">{ilanlar.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <p className="text-xs font-bold text-gray-400">DESTEK</p>
              <h3 className="text-3xl font-black">{destekler.filter(d => d.durum === 'beklemede').length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm">
              <p className="text-xs font-bold text-gray-400">PERSONEL</p>
              <h3 className="text-3xl font-black">{kullanicilar.filter(k => k.type === 'staff').length}</h3>
            </div>
          </div>
        )}

        {activeMenu === 'kullanicilar' && (
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
             <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <h2 className="text-xl font-black">Kullanıcı Listesi</h2>
                <input placeholder="Ara..." className="p-2 border rounded-xl" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="border-b text-gray-400">
                   <tr className="text-left">
                     <th className="p-3">Ad Soyad</th>
                     <th className="p-3">Şifre</th>
                     <th className="p-3">Bölge</th>
                     <th className="p-3 text-right">Eylem</th>
                   </tr>
                 </thead>
                 <tbody>
                   {kullanicilar.filter(u => u.type !== 'staff').filter(u => u.full_name?.toLowerCase().includes(aramaMetni.toLowerCase())).map(u => (
                     <tr key={u.id} className="border-b hover:bg-gray-50">
                       <td className="p-3 font-bold">{u.full_name}</td>
                       <td className="p-3">{canSeePasswords ? <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded font-mono">{u.sifre_acik}</span> : '******'}</td>
                       <td className="p-3 text-xs">{u.il} / {u.ilce}</td>
                       <td className="p-3 text-right">
                         <button onClick={() => setSecilenKullanici(u)} className="p-2 bg-gray-100 rounded-lg hover:bg-blue-600 hover:text-white transition"><Edit size={14}/></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeMenu === 'personel' && isSuper && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black">Yardımcı Personeller</h2>
              <button onClick={() => setPersonelEkleAcik(true)} className="bg-orange-400 px-4 py-2 rounded-xl font-bold">Yeni Ekle</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kullanicilar.filter(k => k.type === 'staff').map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h4 className="font-bold">{s.full_name}</h4>
                  <p className="text-sm text-gray-500">{s.phone_number}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setSecilenKullanici(s)} className="flex-1 bg-gray-100 py-2 rounded-lg text-xs font-bold">Düzenle</button>
                    <button onClick={async () => {
                      if(confirm("Silinsin mi?")) {
                         await supabase.from('profiles').delete().eq('id', s.id);
                         verileriYukle();
                      }
                    }} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'destek' && (
          <div className="grid grid-cols-1 gap-4">
            {destekler.map(d => <DestekKart key={d.id} destek={d} onGuncelle={verileriYukle} />)}
          </div>
        )}
      </main>

      {personelEkleAcik && <PersonelEkleModal onKapat={() => setPersonelEkleAcik(false)} onEklendi={verileriYukle} />}
      {secilenKullanici && (
        <KullaniciDetay 
          kullanici={secilenKullanici} 
          onKapat={() => setSecilenKullanici(null)} 
          onGuncelle={verileriYukle} 
          onSil={async (id) => {
            if(confirm("Tamamen silinecek?")) {
              await supabase.from('ilanlar').delete().eq('user_id', id);
              await supabase.from('profiles').delete().eq('id', id);
              setSecilenKullanici(null);
              verileriYukle();
            }
          }}
          isSuper={isSuper}
          canSeePasswords={canSeePasswords}
        />
      )}
    </div>
  );
}
