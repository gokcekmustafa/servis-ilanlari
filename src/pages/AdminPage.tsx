import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Lock, Unlock, Phone, MapPin, Calendar, 
  LayoutDashboard, UserPlus, ShieldCheck, EyeOff, Settings, Megaphone, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { destekTalepleriniGetir, destekDurumGuncelle } from '../lib/ilanlar';
import { Ilan } from '../types';

const SUPER_ADMIN_TELEFON = "05369500280";

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
    paneli_gorebilir: boolean;
    ilanlari_yonet: boolean;
    kullanicilari_yonet: boolean;
    sifreleri_gor: boolean;
    destek_yonet: boolean;
    personel_yonet: boolean;
    veri_sil: boolean;
  };
}

// --- BİLEŞEN: KULLANICI DETAY MODALI ---
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
  const [yetkiler, setYetkiler] = useState(kullanici.yetkiler || {});
  const [aktif, setAktif] = useState(kullanici.aktif !== false);

  const handleKaydet = async () => {
    const updates: any = { yetkiler, aktif, sifre_acik: yeniSifre };
    if (yeniSifre !== kullanici.sifre_acik) {
      const encoder = new TextEncoder();
      const data = encoder.encode(yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    await supabase.from('profiles').update(updates).eq('id', kullanici.id);
    onGuncelle(kullanici.id, updates);
    setDuzenle(false);
    alert("Bilgiler güncellendi.");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#1a3c6e] p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl">{kullanici.full_name || 'İsimsiz Üye'}</h3>
            <p className="text-xs text-blue-200">{kullanici.type.toUpperCase()} HESABI</p>
          </div>
          <button onClick={onKapat} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Üyelik Bilgileri</h4>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <label className="text-[10px] font-black text-orange-600 uppercase">Giriş Şifresi (Açık)</label>
                {canSeePasswords ? (
                  duzenle ? (
                    <input value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} className="w-full mt-1 p-2 border rounded-lg font-mono text-sm" />
                  ) : (
                    <p className="text-lg font-mono font-black text-gray-800">{kullanici.sifre_acik || '---'}</p>
                  )
                ) : <p className="text-gray-400 italic text-sm">Görme yetkiniz yok</p>}
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><strong>Telefon:</strong> <span>{kullanici.phone_number}</span></p>
                <p className="flex justify-between"><strong>İl/İlçe:</strong> <span>{kullanici.il} / {kullanici.ilce}</span></p>
                <p className="flex justify-between"><strong>Kayıt:</strong> <span>{new Date(kullanici.created_at).toLocaleDateString('tr-TR')}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Yetki Ayarları</h4>
                <button onClick={() => setDuzenle(!duzenle)} className="text-xs font-bold text-blue-600 hover:underline">{duzenle ? 'İptal' : 'Düzenle'}</button>
              </div>
              <div className="space-y-2 bg-gray-50 p-4 rounded-2xl max-h-60 overflow-y-auto">
                <label className="flex items-center justify-between text-xs font-bold p-2 bg-white rounded-lg shadow-sm mb-4">
                  <span>HESAP AKTİF Mİ?</span>
                  <input type="checkbox" disabled={!duzenle} checked={aktif} onChange={() => setAktif(!aktif)} className="w-5 h-5 accent-green-500" />
                </label>
                {Object.keys(yetkiler).map(key => (
                  <label key={key} className="flex items-center justify-between text-[11px] text-gray-600 uppercase">
                    <span>{key.replace(/_/g, ' ')}</span>
                    <input type="checkbox" disabled={!duzenle} checked={(yetkiler as any)[key]} onChange={() => setYetkiler({...yetkiler, [key]: !(yetkiler as any)[key]})} className="w-4 h-4 accent-blue-600" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex gap-4">
          {duzenle ? (
            <button onClick={handleKaydet} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition">Değişiklikleri Kaydet</button>
          ) : (
            <button onClick={() => onSil(kullanici.id)} className="flex-1 py-4 bg-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-200 transition">Kullanıcıyı Tamamen Sil</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- ANA ADMİN SAYFASI ---
export default function AdminPage({ onLogout, onIlanDetay }: { onLogout: () => void, onIlanDetay: (ilan: Ilan) => void }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<Profile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');

  // Duyuru Formu State
  const [yeniDuyuru, setYeniDuyuru] = useState({ baslik: '', mesaj: '', resim_url: '', aktif: true });

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
    const { data: notices } = await supabase.from('duyurular').select('*').order('created_at', { ascending: false });
    if (notices) setDuyurular(notices);
    setYukleniyor(false);
  };

  const duyuruEkle = async () => {
    if (!yeniDuyuru.baslik || !yeniDuyuru.mesaj) return alert("Başlık ve mesaj zorunludur!");
    await supabase.from('duyurular').insert([yeniDuyuru]);
    setYeniDuyuru({ baslik: '', mesaj: '', resim_url: '', aktif: true });
    verileriYukle();
    alert("Duyuru yayınlandı!");
  };

  const isSuper = currentUser?.phone_number === SUPER_ADMIN_TELEFON;
  const canSeePasswords = isSuper || currentUser?.yetkiler?.sifreleri_gor;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      
      {/* YAN MENÜ */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1a3c6e] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
              <Shield className="text-blue-900" size={28} />
            </div>
            <h1 className="font-black text-xl tracking-tighter">SALONUM <span className="text-orange-400">ADMİN</span></h1>
          </div>

          <nav className="space-y-2 flex-1">
            <button onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'dashboard' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><LayoutDashboard size={20}/> Dashboard</button>
            <button onClick={() => { setActiveMenu('ilanlar'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'ilanlar' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><FileText size={20}/> İlanlar</button>
            <button onClick={() => { setActiveMenu('kullanicilar'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'kullanicilar' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><Users size={20}/> Kullanıcılar</button>
            <button onClick={() => { setActiveMenu('destek'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'destek' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><HelpCircle size={20}/> Destek Talepleri</button>
            <button onClick={() => { setActiveMenu('duyurular'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'duyurular' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><Megaphone size={20}/> Duyuru Yönetimi</button>
            {isSuper && <button onClick={() => { setActiveMenu('personel'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'personel' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><ShieldCheck size={20}/> Personel Yönetimi</button>}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 text-red-300 font-bold hover:bg-red-500/10 rounded-2xl transition-colors"><LogOut size={20}/> Çıkış Yap</button>
          </div>
        </div>
      </aside>

      {/* MOBİL ÜST BAR */}
      <div className="md:hidden bg-[#1a3c6e] p-4 flex justify-between items-center text-white sticky top-0 z-[90]">
        <span className="font-black tracking-widest">SALONUM ADMİN</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg"><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10">
        
        {/* DASHBOARD ÖZETİ */}
        {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-blue-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Toplam Üye</p>
              <h3 className="text-4xl font-black text-blue-900">{kullanicilar.length}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktif İlanlar</p>
              <h3 className="text-4xl font-black text-orange-500">{ilanlar.length}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bekleyen Destek</p>
              <h3 className="text-4xl font-black text-red-500">{destekler.filter(d => d.durum === 'beklemede').length}</h3>
            </div>
            <div className="bg-[#1a3c6e] p-8 rounded-[2.5rem] shadow-xl text-white">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Sistem Personeli</p>
              <h3 className="text-4xl font-black">{kullanicilar.filter(k => k.type === 'staff').length}</h3>
            </div>
          </div>
        )}

        {/* KULLANICI LİSTESİ */}
        {activeMenu === 'kullanicilar' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border animate-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-blue-900">Üye Yönetimi</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input placeholder="İsim, telefon veya il ile ara..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 shadow-inner" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                     <th className="p-4">Ad Soyad</th>
                     <th className="p-4 text-orange-600">Şifre</th>
                     <th className="p-4">Bölge</th>
                     <th className="p-4">Durum</th>
                     <th className="p-4 text-right">İşlem</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {kullanicilar.filter(u => u.type !== 'staff').filter(u => u.full_name?.toLowerCase().includes(aramaMetni.toLowerCase())).map(u => (
                     <tr key={u.id} className="hover:bg-blue-50/50 transition cursor-pointer" onClick={() => setSecilenKullanici(u)}>
                       <td className="p-4">
                         <p className="font-bold text-gray-800">{u.full_name}</p>
                         <p className="text-xs text-gray-500 font-mono">{u.phone_number}</p>
                       </td>
                       <td className="p-4">
                         {canSeePasswords ? (
                           <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-mono font-bold text-xs">{u.sifre_acik}</span>
                         ) : <span className="text-gray-300 italic text-xs">Gizli</span>}
                       </td>
                       <td className="p-4 text-xs text-gray-500">{u.il} / {u.ilce}</td>
                       <td className="p-4">
                         <div className={`w-3 h-3 rounded-full ${u.aktif ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                       </td>
                       <td className="p-4 text-right">
                         <button className="p-3 bg-white border rounded-xl hover:bg-blue-900 hover:text-white transition shadow-sm"><Unlock size={16}/></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* DUYURU YÖNETİMİ (POPUP SİSTEMİ) */}
        {activeMenu === 'duyurular' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border h-fit">
              <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-3"><Megaphone /> Yeni Popup Yayınla</h2>
              <div className="space-y-4">
                <input placeholder="Popup Başlığı" className="w-full p-4 bg-gray-50 border-none rounded-2xl shadow-inner" value={yeniDuyuru.baslik} onChange={e => setYeniDuyuru({...yeniDuyuru, baslik: e.target.value})} />
                <textarea placeholder="Kullanıcılara iletilecek mesaj..." rows={4} className="w-full p-4 bg-gray-50 border-none rounded-2xl shadow-inner" value={yeniDuyuru.mesaj} onChange={e => setYeniDuyuru({...yeniDuyuru, mesaj: e.target.value})} />
                <input placeholder="Resim URL (Opsiyonel)" className="w-full p-4 bg-gray-50 border-none rounded-2xl shadow-inner" value={yeniDuyuru.resim_url} onChange={e => setYeniDuyuru({...yeniDuyuru, resim_url: e.target.value})} />
                <button onClick={duyuruEkle} className="w-full py-4 bg-[#1a3c6e] text-white rounded-2xl font-bold shadow-lg hover:bg-blue-900 transition flex items-center justify-center gap-2">
                  <Megaphone size={20}/> Şimdi Yayınla
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
              <h2 className="text-2xl font-black text-blue-900 mb-6">Aktif Duyurular</h2>
              <div className="space-y-4">
                {duyurular.map(d => (
                  <div key={d.id} className="p-6 border rounded-[2rem] bg-gray-50 relative group">
                    <button onClick={async () => { await supabase.from('duyurular').delete().eq('id', d.id); verileriYukle(); }} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={20}/></button>
                    <h4 className="font-bold text-blue-900 text-lg">{d.baslik}</h4>
                    <p className="text-sm text-gray-600 mt-2">{d.mesaj}</p>
                    {d.resim_url && <div className="mt-4 rounded-xl overflow-hidden h-32 border bg-white flex items-center justify-center"><img src={d.resim_url} className="h-full object-contain" alt="Popup" /></div>}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400">{new Date(d.created_at).toLocaleString('tr-TR')}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${d.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.aktif ? 'YAYINDA' : 'PASİF'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERSONEL YÖNETİMİ (Sadece Superadmin) */}
        {activeMenu === 'personel' && isSuper && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="bg-blue-900 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
                <div>
                   <h2 className="text-3xl font-black mb-2">Sistem Personeli</h2>
                   <p className="text-blue-200">Yardımcı adminler ekleyebilir ve yetkilerini kısıtlayabilirsiniz.</p>
                </div>
                <button onClick={() => alert("Kullanıcı Listesi'nden tipi 'staff' yaparak personel atayabilirsiniz.")} className="p-5 bg-orange-400 text-blue-900 rounded-[2rem] font-black shadow-lg hover:scale-105 transition-transform"><UserPlus size={28}/></button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kullanicilar.filter(k => k.type === 'staff').map(s => (
                   <div key={s.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-orange-100">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"><ShieldCheck className="text-blue-900" size={32}/></div>
                      <h4 className="font-black text-lg text-gray-800">{s.full_name}</h4>
                      <p className="text-sm font-mono text-blue-600 mb-6">{s.phone_number}</p>
                      <div className="bg-orange-50 p-3 rounded-xl mb-6">
                         <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Şifre</p>
                         <p className="font-mono font-bold">{s.sifre_acik}</p>
                      </div>
                      <button onClick={() => setSecilenKullanici(s)} className="w-full py-3 bg-gray-100 rounded-xl font-bold hover:bg-blue-900 hover:text-white transition">Yetkileri Düzenle</button>
                   </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* MODALLAR */}
      {secilenKullanici && (
        <KullaniciDetay 
          kullanici={secilenKullanici} 
          onKapat={() => setSecilenKullanici(null)} 
          onGuncelle={verileriYukle} 
          onSil={async (id) => {
            if(confirm("DİKKAT! Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
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
