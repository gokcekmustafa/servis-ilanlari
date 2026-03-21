import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Lock, Unlock, Phone, MapPin, Calendar, 
  LayoutDashboard, UserPlus, ShieldCheck, Megaphone, LayoutPanelTop, Plus, ArrowUp, ArrowDown
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
    ilanlari_yonet: boolean;
    kullanicilari_yonet: boolean;
    sifreleri_gor: boolean;
    destek_yonet: boolean;
    personel_yonet: boolean;
    reklam_yonet: boolean;
    duyuru_yonet: boolean;
  };
}

// --- KULLANICI DETAY MODALI ---
function KullaniciDetay({ kullanici, onKapat, onGuncelle, onSil, isSuper, canSeePasswords }: any) {
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
    alert("Güncellendi!");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#1a3c6e] p-6 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{kullanici.full_name || 'Üye Detayı'}</h3>
          <button onClick={onKapat} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase border-b pb-2">Üyelik Bilgileri</h4>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-[10px] font-black text-orange-600 uppercase">Giriş Şifresi</p>
                {canSeePasswords ? (
                  duzenle ? (
                    <input value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} className="w-full mt-1 p-2 border rounded-lg font-mono text-sm" />
                  ) : (
                    <p className="text-xl font-mono font-black text-gray-800">{kullanici.sifre_acik || '---'}</p>
                  )
                ) : <p className="text-gray-400 italic text-sm">Görme yetkiniz yok</p>}
              </div>
              <div className="text-sm space-y-2">
                <p><strong>Telefon:</strong> {kullanici.phone_number}</p>
                <p><strong>İl/İlçe:</strong> {kullanici.il} / {kullanici.ilce}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-black text-gray-400 uppercase">Yetkiler</h4>
                <button onClick={() => setDuzenle(!duzenle)} className="text-xs font-bold text-blue-600 hover:underline">{duzenle ? 'İptal' : 'Düzenle'}</button>
              </div>
              <div className="space-y-2 bg-gray-50 p-4 rounded-2xl">
                <label className="flex items-center justify-between text-xs font-bold mb-4">
                  <span>HESAP AKTİF</span>
                  <input type="checkbox" disabled={!duzenle} checked={aktif} onChange={() => setAktif(!aktif)} className="w-5 h-5 accent-green-500" />
                </label>
                {['ilanlari_yonet', 'kullanicilari_yonet', 'sifreleri_gor', 'destek_yonet', 'personel_yonet', 'reklam_yonet', 'duyuru_yonet'].map(key => (
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
            <button onClick={handleKaydet} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold">Kaydet</button>
          ) : (
            <button onClick={() => onSil(kullanici.id)} className="flex-1 py-4 bg-red-100 text-red-600 rounded-2xl font-bold">Sil</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ onLogout, onIlanDetay }: any) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<Profile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');

  // Duyuru Formu
  const [duyuruForm, setDuyuruForm] = useState({ baslik: '', mesaj: '', resim_url: '', aktif: true });

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
    const { data: recs } = await supabase.from('reklamlar').select('*').order('sira', { ascending: true });
    if (recs) setReklamlar(recs);
    const { data: notices } = await supabase.from('duyurular').select('*').order('created_at', { ascending: false });
    if (notices) setDuyurular(notices);
    setYukleniyor(false);
  };

  const isSuper = currentUser?.phone_number === SUPER_ADMIN_TELEFON;
  const canSeePasswords = isSuper || currentUser?.yetkiler?.sifreleri_gor;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1a3c6e] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center shadow-xl"><Shield className="text-blue-900" size={28}/></div>
            <h1 className="font-black text-xl">SALONUM <span className="text-orange-400">ADMİN</span></h1>
          </div>
          <nav className="space-y-2 flex-1">
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'dashboard' ? 'bg-orange-400 text-blue-900 font-bold' : 'hover:bg-white/10'}`}><LayoutDashboard size={20}/> Dashboard</button>
            <button onClick={() => setActiveMenu('ilanlar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'ilanlar' ? 'bg-orange-400 text-blue-900 font-bold' : 'hover:bg-white/10'}`}><FileText size={20}/> İlanlar</button>
            <button onClick={() => setActiveMenu('kullanicilar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'kullanicilar' ? 'bg-orange-400 text-blue-900 font-bold' : 'hover:bg-white/10'}`}><Users size={20}/> Kullanıcılar</button>
            <button onClick={() => setActiveMenu('reklamlar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'reklamlar' ? 'bg-orange-400 text-blue-900 font-bold' : 'hover:bg-white/10'}`}><LayoutPanelTop size={20}/> Reklam & Banner</button>
            <button onClick={() => setActiveMenu('duyurular')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'duyurular' ? 'bg-orange-400 text-blue-900 font-bold' : 'hover:bg-white/10'}`}><Megaphone size={20}/> Duyurular</button>
            {isSuper && <button onClick={() => setActiveMenu('personel')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'personel' ? 'bg-orange-400 text-blue-900 font-bold' : 'hover:bg-white/10'}`}><ShieldCheck size={20}/> Personel</button>}
          </nav>
          <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-5 py-4 text-red-300 font-bold hover:bg-red-500/10 rounded-2xl"><LogOut size={20}/> Çıkış Yap</button>
        </div>
      </aside>

      {/* MOBİL HEADER */}
      <div className="md:hidden bg-[#1a3c6e] p-4 flex justify-between items-center text-white sticky top-0 z-[90]">
        <span className="font-black">SALONUM ADMİN</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg"><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10">
        {/* DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-blue-50">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Kullanıcılar</p>
              <h3 className="text-4xl font-black text-blue-900">{kullanicilar.length}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-orange-50">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Aktif İlanlar</p>
              <h3 className="text-4xl font-black text-orange-500">{ilanlar.length}</h3>
            </div>
          </div>
        )}

        {/* KULLANICILAR */}
        {activeMenu === 'kullanicilar' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               <h2 className="text-2xl font-black text-blue-900">Üyelik Yönetimi</h2>
               <div className="relative w-full md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input placeholder="Ara..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl shadow-inner" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-black text-gray-400 uppercase border-b">
                    <th className="p-4">Ad Soyad</th>
                    <th className="p-4 text-orange-600">Şifre</th>
                    <th className="p-4">Tip</th>
                    <th className="p-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {kullanicilar.filter(u => u.full_name?.toLowerCase().includes(aramaMetni.toLowerCase())).map(u => (
                    <tr key={u.id} className="hover:bg-blue-50/50 transition cursor-pointer" onClick={() => setSecilenKullanici(u)}>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{u.full_name}</p>
                        <p className="text-xs text-gray-500">{u.phone_number}</p>
                      </td>
                      <td className="p-4">
                        {canSeePasswords ? (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-mono font-bold text-xs">{u.sifre_acik}</span>
                        ) : '******'}
                      </td>
                      <td className="p-4 uppercase text-[10px] font-bold text-blue-600">{u.type}</td>
                      <td className="p-4 text-right">
                        <button className="p-2 border rounded-xl"><Unlock size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REKLAM YÖNETİMİ */}
        {activeMenu === 'reklamlar' && (
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[2rem] border flex justify-between items-center">
                <h2 className="text-2xl font-black text-blue-900">Reklam & Banner Alanları</h2>
                <button 
                  onClick={async () => {
                    await supabase.from('reklamlar').insert([{ baslik: 'Yeni Reklam', tip: 'ana_slider', sira: reklamlar.length }]);
                    verileriYukle();
                  }}
                  className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
                >
                  <Plus /> Yeni Ekle
                </button>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {reklamlar.map((r, idx) => (
                  <div key={r.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-2xl overflow-hidden relative group">
                       {r.resim_url && <img src={r.resim_url} className="w-full h-full object-cover" />}
                       <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                         RESİM YÜKLE
                         <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const path = `reklam-${Date.now()}`;
                            const { data } = await supabase.storage.from('reklam-resimleri').upload(path, file);
                            if (data) {
                               const { data: urlData } = supabase.storage.from('reklam-resimleri').getPublicUrl(data.path);
                               await supabase.from('reklamlar').update({ resim_url: urlData.publicUrl }).eq('id', r.id);
                               verileriYukle();
                            }
                         }} />
                       </label>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                       <input placeholder="Başlık" className="p-3 bg-gray-50 rounded-xl" defaultValue={r.baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ baslik: e.target.value }).eq('id', r.id); }} />
                       <input placeholder="Alt Başlık" className="p-3 bg-gray-50 rounded-xl" defaultValue={r.alt_baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ alt_baslik: e.target.value }).eq('id', r.id); }} />
                       <input placeholder="Yönlendirme Linki" className="p-3 bg-gray-50 rounded-xl md:col-span-2" defaultValue={r.link_url} onBlur={async (e) => { await supabase.from('reklamlar').update({ link_url: e.target.value }).eq('id', r.id); }} />
                    </div>
                    <button onClick={async () => { await supabase.from('reklamlar').delete().eq('id', r.id); verileriYukle(); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={20}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* DUYURU YÖNETİMİ */}
        {activeMenu === 'duyurular' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border">
                 <h2 className="text-2xl font-black text-blue-900 mb-6">Yeni Duyuru (Popup)</h2>
                 <div className="space-y-4">
                    <input placeholder="Popup Başlığı" className="w-full p-4 bg-gray-50 rounded-2xl" value={duyuruForm.baslik} onChange={e => setDuyuruForm({...duyuruForm, baslik: e.target.value})} />
                    <textarea placeholder="Mesajınız" rows={4} className="w-full p-4 bg-gray-50 rounded-2xl" value={duyuruForm.mesaj} onChange={e => setDuyuruForm({...duyuruForm, mesaj: e.target.value})} />
                    <button onClick={async () => { await supabase.from('duyurular').insert([duyuruForm]); setDuyuruForm({ baslik: '', mesaj: '', resim_url: '', aktif: true }); verileriYukle(); }} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-bold">Duyuruyu Yayınla</button>
                 </div>
              </div>
              <div className="space-y-4">
                 {duyurular.map(d => (
                    <div key={d.id} className="bg-white p-6 rounded-[2rem] border relative group">
                       <button onClick={async () => { await supabase.from('duyurular').delete().eq('id', d.id); verileriYukle(); }} className="absolute top-4 right-4 text-red-500"><Trash2 size={18}/></button>
                       <h4 className="font-bold">{d.baslik}</h4>
                       <p className="text-sm text-gray-600 mt-2">{d.mesaj}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {secilenKullanici && <KullaniciDetay kullanici={secilenKullanici} onKapat={() => setSecilenKullanici(null)} onGuncelle={verileriYukle} onSil={async (id: any) => { if(confirm("Silinsin mi?")) { await supabase.from('profiles').delete().eq('id', id); setSecilenKullanici(null); verileriYukle(); } }} isSuper={isSuper} canSeePasswords={canSeePasswords} />}
    </div>
  );
}
