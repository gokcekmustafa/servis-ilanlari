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
  type: string; // 'bireysel', 'kurumsal', 'staff', 'admin'
  il: string;
  ilce: string;
  adres: string;
  sifre_acik: string;
  created_at: string;
  profil_resmi: string;
  aktif: boolean;
  yetkiler: {
    // Genel Yetkiler
    ilan_verebilir: boolean;
    mesaj_gonderebilir: boolean;
    favori_ekleyebilir: boolean;
    // Admin/Personel Yetkileri
    view_dashboard: boolean;
    manage_ads: boolean;
    manage_users: boolean;
    view_passwords: boolean;
    manage_support: boolean;
    manage_staff: boolean; // Sadece personeli yönetme yetkisi
    delete_data: boolean;  // Silme yetkisi kısıtlaması
  };
}

// Menü Öğeleri Tanımı
const getMenuItems = (isSuper: boolean, yetkiler: any) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: yetkiler?.view_dashboard || isSuper },
    { id: 'ilanlar', label: 'İlan Yönetimi', icon: FileText, show: yetkiler?.manage_ads || isSuper },
    { id: 'kullanicilar', label: 'Kullanıcılar', icon: Users, show: yetkiler?.manage_users || isSuper },
    { id: 'destek', label: 'Destek Talepleri', icon: HelpCircle, show: yetkiler?.manage_support || isSuper },
    { id: 'personel', label: 'Personel Yönetimi', icon: ShieldCheck, show: isSuper }, // Sadece sen görebilirsin
  ];
  return items.filter(item => item.show);
};

// --- YARDIMCI BİLEŞEN: PERSONEL EKLEME MODAL ---
function PersonelEkleModal({ onKapat, onEklendi }: { onKapat: () => void, onEklendi: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [yetkiler, setYetkiler] = useState({
    view_dashboard: true,
    manage_ads: true,
    manage_users: false,
    view_passwords: false,
    manage_support: true,
    manage_staff: false,
    delete_data: false,
    ilan_verebilir: true,
    mesaj_gonderebilir: true,
    favori_ekleyebilir: true
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleEkle = async () => {
    if (!form.name || !form.phone || !form.password) return alert("Tüm alanları doldurun!");
    setYukleniyor(true);

    // Şifre Hashleme
    const encoder = new TextEncoder();
    const data = encoder.encode(form.password + 'servis-ilanlari-salt');
    const hash = await crypto.subtle.digest('SHA-256', data);
    const password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('profiles').insert([{
      full_name: form.name,
      phone_number: form.phone,
      password_hash,
      sifre_acik: form.password,
      type: 'staff',
      aktif: true,
      yetkiler: yetkiler
    }]);

    if (!error) {
      alert("Personel başarıyla eklendi!");
      onEklendi();
      onKapat();
    } else {
      alert("Hata: " + error.message);
    }
    setYukleniyor(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1a3c6e]/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-black text-[#1a3c6e]">Yeni Personel Tanımla</h2>
            <p className="text-sm text-gray-500">Yardımcı personel için yetki sınırlarını belirleyin.</p>
          </div>
          <button onClick={onKapat} className="p-2 hover:bg-gray-200 rounded-full transition"><X /></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Ad Soyad" className="p-3 border rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Telefon (05xx...)" className="p-3 border rounded-xl" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <input placeholder="Giriş Şifresi" className="p-3 border rounded-xl" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
            <h3 className="font-bold text-[#1a3c6e] mb-4 flex items-center gap-2"><Settings size={18}/> Yetki Kısıtlamaları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(yetkiler).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-50 shadow-sm cursor-pointer hover:bg-blue-100/50 transition">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{key.replace(/_/g, ' ')}</span>
                  <input type="checkbox" checked={val} onChange={() => setYetkiler({...yetkiler, [key]: !val})} className="w-5 h-5 accent-blue-600" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t flex gap-4">
          <button onClick={onKapat} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700">Vazgeç</button>
          <button onClick={handleEkle} disabled={yukleniyor} className="flex-[2] py-4 bg-[#1a3c6e] text-white rounded-2xl font-bold shadow-lg hover:bg-blue-900 transition flex items-center justify-center gap-2">
            <UserPlus size={20}/> {yukleniyor ? 'Oluşturuluyor...' : 'Personeli Kaydet'}
          </button>
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

  // Admin Kontrolü ve Veri Yükleme
  useEffect(() => {
    const checkUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const { data } = await supabase.from('profiles').select('*').eq('id', parsed.id).single();
        if (data) setCurrentUser(data);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    verileriYukle();
  }, [activeMenu]);

  const verileriYukle = async () => {
    setYukleniyor(true);
    // Dinamik veri çekme (Yetkiye göre)
    const { data: ads } = await supabase.from('ilanlar').select('*').order('created_at', { ascending: false });
    if (ads) setIlanlar(ads);

    const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (users) setKullanicilar(users);

    const { data: support } = await destekTalepleriniGetir();
    if (support) setDestekler(support);
    
    setYukleniyor(false);
  };

  const isSuper = currentUser?.phone_number === SUPER_ADMIN_PHONE;
  const menuList = getMenuItems(isSuper, currentUser?.yetkiler);

  // Kısıtlamalı Şifre Görme
  const canSeePasswords = isSuper || currentUser?.yetkiler?.view_passwords;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1a3c6e] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="text-[#1a3c6e]" size={28} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter leading-none">SALONUM</h1>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Yönetim Paneli</span>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {menuList.map(item => (
              <button key={item.id} onClick={() => { setActiveMenu(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${activeMenu === item.id ? 'bg-orange-400 text-[#1a3c6e] font-black shadow-lg shadow-orange-400/20' : 'hover:bg-white/10 text-blue-100'}`}>
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center font-bold text-[#1a3c6e]">
                {currentUser?.full_name?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{currentUser?.full_name}</p>
                <p className="text-[10px] text-blue-300 uppercase">{isSuper ? 'Süper Yönetici' : 'Yardımcı Personel'}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3 text-red-300 hover:bg-red-500/20 rounded-xl transition-colors font-bold">
              <LogOut size={18} /> Güvenli Çıkış
            </button>
          </div>
        </div>
      </aside>

      {/* MOBİL HEADER */}
      <div className="md:hidden bg-[#1a3c6e] p-4 flex justify-between items-center sticky top-0 z-[90]">
        <span className="text-white font-black">SALONUM ADMİN</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white bg-white/10 rounded-lg"><Menu /></button>
      </div>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-4 md:p-10">
        
        {/* DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-50">
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Toplam Üye</p>
                   <h3 className="text-4xl font-black text-[#1a3c6e]">{kullanicilar.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-50">
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Aktif İlanlar</p>
                   <h3 className="text-4xl font-black text-orange-500">{ilanlar.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-green-50">
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Çözülen Destek</p>
                   <h3 className="text-4xl font-black text-green-500">{destekler.filter(d => d.durum === 'cozuldu').length}</h3>
                </div>
                <div className="bg-[#1a3c6e] p-6 rounded-[2rem] shadow-xl text-white">
                   <p className="text-[10px] font-black text-blue-300 uppercase mb-2">Personel Sayısı</p>
                   <h3 className="text-4xl font-black">{kullanicilar.filter(k => k.type === 'staff').length}</h3>
                </div>
             </div>
             <div className="bg-gradient-to-br from-[#1a3c6e] to-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                <h2 className="text-3xl font-black mb-4">Sistem Durumu: Çevrimiçi</h2>
                <p className="text-blue-100 max-w-xl leading-relaxed">Şu an tüm sistemler stabil çalışıyor. Son 24 saatte {kullanicilar.filter(k => new Date(k.created_at) > new Date(Date.now() - 86400000)).length} yeni kullanıcı katıldı.</p>
             </div>
          </div>
        )}

        {/* PERSONEL YÖNETİMİ (Sadece Superadmin) */}
        {activeMenu === 'personel' && isSuper && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border">
               <div>
                  <h2 className="text-2xl font-black text-[#1a3c6e]">Yardımcı Personeller</h2>
                  <p className="text-gray-500">Ekibinize yeni personeller ekleyebilir veya yetkilerini kısıtlayabilirsiniz.</p>
               </div>
               <button onClick={() => setPersonelEkleAcik(true)} className="px-6 py-4 bg-orange-400 text-[#1a3c6e] font-black rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                 <UserPlus size={20}/> Personel Ekle
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kullanicilar.filter(k => k.type === 'staff').map(staff => (
                <div key={staff.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border hover:border-orange-400 transition group">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-[#1a3c6e] font-black text-2xl group-hover:bg-orange-100 transition">
                         {staff.full_name[0]}
                      </div>
                      <div>
                         <h4 className="font-black text-lg text-gray-800">{staff.full_name}</h4>
                         <p className="text-sm text-gray-500 font-mono">{staff.phone_number}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2 mb-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase border-b pb-1 mb-2">Aktif Yetkiler</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(staff.yetkiler || {}).map(([y, v]) => v && (
                          <span key={y} className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase">
                            {y.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition" onClick={() => setSecilenKullanici(staff)}>Düzenle</button>
                      <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition" onClick={async () => {
                         if(confirm("Bu personeli işten çıkarmak istediğinize emin misiniz?")) {
                            await supabase.from('profiles').delete().eq('id', staff.id);
                            verileriYukle();
                         }
                      }}><Trash2 size={18}/></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DİĞER MENÜLER (Kullanıcılar, İlanlar vb. önceki kodundaki gibi ama yetki kontrolü ile) */}
        {activeMenu === 'kullanicilar' && (currentUser?.yetkiler?.manage_users || isSuper) && (
           <div className="bg-white rounded-[2rem] border shadow-sm p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[#1a3c6e]">Sistem Kullanıcıları</h2>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} placeholder="İsim veya telefon ara..." className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl w-80 shadow-inner" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                      <th className="pb-4 px-4">Kullanıcı</th>
                      <th className="pb-4 px-4">Şifre</th>
                      <th className="pb-4 px-4">Tip</th>
                      <th className="pb-4 px-4">Durum</th>
                      <th className="pb-4 px-4 text-right">Eylem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {kullanicilar.filter(u => u.type !== 'staff').filter(u => !aramaMetni || u.full_name.toLowerCase().includes(aramaMetni.toLowerCase())).map(user => (
                      <tr key={user.id} className="hover:bg-blue-50/50 transition">
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-800">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.phone_number}</p>
                        </td>
                        <td className="py-4 px-4">
                          {canSeePasswords ? (
                            <span className="font-mono bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold">{user.sifre_acik}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 text-xs"><EyeOff size={14}/> Gizli</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${user.type === 'kurumsal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.type}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`w-3 h-3 rounded-full ${user.aktif ? 'bg-green-500' : 'bg-red-500'} shadow-sm shadow-green-200`}></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button onClick={() => setSecilenKullanici(user)} className="p-2 hover:bg-white rounded-xl shadow-sm border transition"><Unlock size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {/* İlanlar ve Destek sekmeleri benzer yetki kontrolleri ile buraya gelecek */}

      </main>

      {/* MODALLAR */}
      {personelEkleAcik && <PersonelEkleModal onKapat={() => setPersonelEkleAcik(false)} onEklendi={verileriYukle} />}
      {secilenKullanici && (
         /* Daha önce yaptığımız KullaniciDetay modalını buraya ekliyoruz, 
            ancak yetki kontrollerini props olarak geçiyoruz */
         <KullaniciDetay 
            kullanici={secilenKullanici} 
            onKapat={() => setSecilenKullanici(null)} 
            onGuncelle={verileriYukle} 
            onSil={verileriYukle} 
         />
      )}
    </div>
  );
}
