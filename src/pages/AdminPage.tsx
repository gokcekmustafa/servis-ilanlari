import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Lock, Unlock, Phone, MapPin, Calendar, 
  LayoutDashboard, UserPlus, ShieldCheck, Megaphone, LayoutPanelTop, Plus, ArrowUp, ArrowDown, Image as ImageIcon
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
  yetkiler: any;
}

// --- 1. PERSONEL EKLEME MODALI ---
function PersonelEkleModal({ onKapat, onEklendi }: { onKapat: () => void, onEklendi: () => void }) {
  const [form, setForm] = useState({ ad_soyad: '', telefon: '', sifre: '' });
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleKaydet = async () => {
    if (!form.ad_soyad || !form.telefon || !form.sifre) return alert("Lütfen tüm alanları doldurun!");
    setYukleniyor(true);
    
    // Şifreyi projenin standartına göre hashleyelim
    const encoder = new TextEncoder();
    const data = encoder.encode(form.sifre + 'servis-ilanlari-salt');
    const hash = await crypto.subtle.digest('SHA-256', data);
    const password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase.from('profiles').insert([{
      full_name: form.ad_soyad,
      phone_number: form.telefon,
      password_hash: password_hash,
      sifre_acik: form.sifre,
      type: 'staff',
      aktif: true,
      yetkiler: {
        ilanlari_yonet: true,
        kullanicilari_yonet: false,
        sifreleri_gor: false,
        destek_yonet: true,
        reklam_yonet: true,
        duyuru_yonet: true
      }
    }]);

    if (error) alert("Hata: " + error.message);
    else {
      alert("Personel başarıyla eklendi.");
      onEklendi();
      onKapat();
    }
    setYukleniyor(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2"><UserPlus /> Yeni Personel</h2>
        <div className="space-y-4">
          <input placeholder="Ad Soyad" className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner" value={form.ad_soyad} onChange={e => setForm({...form, ad_soyad: e.target.value})} />
          <input placeholder="Telefon (05xx...)" className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner" value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})} />
          <input placeholder="Giriş Şifresi" className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner" value={form.sifre} onChange={e => setForm({...form, sifre: e.target.value})} />
          <div className="flex gap-3 pt-4">
            <button onClick={onKapat} className="flex-1 py-4 font-bold text-gray-500">İptal</button>
            <button onClick={handleKaydet} disabled={yukleniyor} className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-bold">
              {yukleniyor ? 'Ekleniyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. KULLANICI/PERSONEL DETAY MODALI ---
function DetayModal({ kullanici, onKapat, onGuncelle, onSil, isSuper, canSeePasswords }: any) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniSifre, setYeniSifre] = useState(kullanici.sifre_acik || '');
  const [aktif, setAktif] = useState(kullanici.aktif !== false);

  const handleKaydet = async () => {
    const updates: any = { aktif, sifre_acik: yeniSifre };
    if (yeniSifre !== kullanici.sifre_acik) {
      const encoder = new TextEncoder();
      const data = encoder.encode(yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    await supabase.from('profiles').update(updates).eq('id', kullanici.id);
    onGuncelle();
    setDuzenle(false);
    alert("Güncellendi.");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">{kullanici.full_name}</h3>
          <button onClick={onKapat} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <p className="text-[10px] font-black text-orange-600 uppercase mb-2">Giriş Şifresi</p>
            {canSeePasswords ? (
              duzenle ? (
                <input value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} className="w-full p-2 border rounded-lg font-mono" />
              ) : (
                <p className="text-2xl font-mono font-black text-gray-800">{kullanici.sifre_acik || '---'}</p>
              )
            ) : <p className="text-gray-400 italic">Gizli</p>}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Telefon:</strong> {kullanici.phone_number}</p>
            <p><strong>Tür:</strong> {kullanici.type}</p>
            <p><strong>Bölge:</strong> {kullanici.il} / {kullanici.ilce}</p>
          </div>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
             <input type="checkbox" checked={aktif} onChange={() => setAktif(!aktif)} disabled={!duzenle} className="w-5 h-5 accent-green-500" />
             <span className="font-bold text-gray-700">Hesap Aktif ve Erişebilir Durumda</span>
          </label>
        </div>
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          {duzenle ? (
            <button onClick={handleKaydet} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg">Değişiklikleri Kaydet</button>
          ) : (
            <button onClick={() => setDuzenle(true)} className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-bold shadow-lg">Düzenle</button>
          )}
          <button onClick={() => onSil(kullanici.id)} className="px-6 py-4 bg-red-100 text-red-600 rounded-2xl font-bold">Kullanıcıyı Sil</button>
        </div>
      </div>
    </div>
  );
}

// --- 3. ANA ADMİN SAYFASI ---
export default function AdminPage({ onLogout, onIlanDetay }: any) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<Profile | null>(null);
  const [personelEkleAcik, setPersonelEkleAcik] = useState(false);
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
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
      
      {/* SIDEBAR (YAN MENÜ) */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1a3c6e] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center rotate-3"><Shield className="text-blue-900" size={28}/></div>
            <h1 className="font-black text-xl tracking-tighter">SALONUM <span className="text-orange-400">ADMİN</span></h1>
          </div>
          <nav className="space-y-2 flex-1">
            <button onClick={() => {setActiveMenu('dashboard'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'dashboard' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><LayoutDashboard size={20}/> Dashboard</button>
            <button onClick={() => {setActiveMenu('ilanlar'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'ilanlar' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><FileText size={20}/> İlanlar</button>
            <button onClick={() => {setActiveMenu('kullanicilar'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'kullanicilar' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><Users size={20}/> Kullanıcılar</button>
            <button onClick={() => {setActiveMenu('reklamlar'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'reklamlar' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><LayoutPanelTop size={20}/> Reklam/Banner</button>
            <button onClick={() => {setActiveMenu('duyurular'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'duyurular' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><Megaphone size={20}/> Duyurular</button>
            {isSuper && <button onClick={() => {setActiveMenu('personel'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === 'personel' ? 'bg-orange-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-white/10'}`}><ShieldCheck size={20}/> Personel Yönetimi</button>}
          </nav>
          <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-5 py-4 text-red-300 font-bold hover:bg-red-500/10 rounded-2xl transition-colors"><LogOut size={20}/> Çıkış Yap</button>
        </div>
      </aside>

      {/* MOBİL HEADER */}
      <div className="md:hidden bg-[#1a3c6e] p-4 flex justify-between items-center text-white sticky top-0 z-[90]">
        <span className="font-black tracking-widest">SALONUM ADMİN</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg"><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10">
        
        {/* DASHBOARD SEKMESİ */}
        {activeMenu === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Toplam Üye</p>
              <h3 className="text-4xl font-black text-blue-900">{kullanicilar.length}</h3>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktif İlanlar</p>
              <h3 className="text-4xl font-black text-orange-500">{ilanlar.length}</h3>
            </div>
          </div>
        )}

        {/* İLANLAR SEKMESİ */}
        {activeMenu === 'ilanlar' && (
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border animate-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-blue-900 mb-8">Yayındaki İlanlar</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-gray-400 border-b">
                      <th className="p-4">İlan Başlığı / Açıklama</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Yayınlayan</th>
                      <th className="p-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ilanlar.map(ilan => (
                      <tr key={ilan.id} className="hover:bg-blue-50/50 transition">
                         <td className="p-4">
                            <p className="font-bold text-gray-800 line-clamp-1">{ilan.aciklama}</p>
                            <p className="text-[10px] text-gray-400">{new Date(ilan.created_at).toLocaleDateString('tr-TR')}</p>
                         </td>
                         <td className="p-4 font-bold text-blue-600 uppercase text-[10px]">{ilan.kategori.replace(/_/g, ' ')}</td>
                         <td className="p-4 text-gray-600">{ilan.ilan_veren}</td>
                         <td className="p-4 text-right">
                           <button onClick={() => onIlanDetay(ilan)} className="p-2 hover:bg-white rounded-xl shadow-sm border"><Eye size={16}/></button>
                           <button onClick={async () => { if(confirm("İlan silinsin mi?")) { await supabase.from('ilanlar').delete().eq('id', ilan.id); verileriYukle(); } }} className="p-2 text-red-500 hover:bg-white rounded-xl shadow-sm border ml-2"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {/* KULLANICILAR SEKMESİ */}
        {activeMenu === 'kullanicilar' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border animate-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-blue-900">Üyelik Kontrolü</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input placeholder="Ara..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl shadow-inner" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                     <th className="p-4">Ad Soyad</th>
                     <th className="p-4 text-orange-600">Şifre</th>
                     <th className="p-4">Bölge / Tür</th>
                     <th className="p-4 text-right">İşlem</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {kullanicilar.filter(u => u.type !== 'staff').filter(u => u.full_name?.toLowerCase().includes(aramaMetni.toLowerCase())).map(u => (
                     <tr key={u.id} className="hover:bg-blue-50/50 transition cursor-pointer" onClick={() => setSecilenKullanici(u)}>
                       <td className="p-4 font-bold">{u.full_name} <br/><span className="font-mono font-normal text-xs text-gray-500">{u.phone_number}</span></td>
                       <td className="p-4">
                         {canSeePasswords ? (
                           <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-mono font-bold text-xs">{u.sifre_acik}</span>
                         ) : '******'}
                       </td>
                       <td className="p-4 text-xs font-bold text-blue-600 uppercase">{u.il} / {u.type}</td>
                       <td className="p-4 text-right"><button className="p-3 border rounded-xl"><Unlock size={16}/></button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* REKLAM YÖNETİMİ SEKMESİ */}
        {activeMenu === 'reklamlar' && (
          <div className="space-y-6">
             <div className="bg-blue-900 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-lg">
                <h2 className="text-2xl font-black">Banner ve Reklam Yönetimi</h2>
                <button onClick={async () => {
                    await supabase.from('reklamlar').insert([{ baslik: 'Yeni Banner', tip: 'ana_slider', aktif: true, sira: reklamlar.length }]);
                    verileriYukle();
                  }}
                  className="bg-orange-400 text-blue-900 px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition"
                >
                  <Plus /> Yeni Banner Ekle
                </button>
             </div>
             <div className="grid grid-cols-1 gap-6">
                {reklamlar.map(r => (
                  <div key={r.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row gap-6 items-center group">
                    <div className="w-full md:w-64 h-40 bg-gray-100 rounded-2xl overflow-hidden relative">
                       {r.resim_url && <img src={r.resim_url} className="w-full h-full object-cover" />}
                       <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-xs font-bold transition-all">
                         RESMİ DEĞİŞTİR
                         <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const path = `banner-${Date.now()}`;
                            const { data } = await supabase.storage.from('reklam-resimleri').upload(path, file);
                            if (data) {
                               const { data: urlData } = supabase.storage.from('reklam-resimleri').getPublicUrl(data.path);
                               await supabase.from('reklamlar').update({ resim_url: urlData.publicUrl }).eq('id', r.id);
                               verileriYukle();
                            }
                         }} />
                       </label>
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                       <input placeholder="Başlık" className="p-3 bg-gray-50 rounded-xl w-full font-bold border-none" defaultValue={r.baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ baslik: e.target.value }).eq('id', r.id); }} />
                       <input placeholder="Alt Başlık" className="p-3 bg-gray-50 rounded-xl w-full border-none" defaultValue={r.alt_baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ alt_baslik: e.target.value }).eq('id', r.id); }} />
                       <input placeholder="Yönlendirme Linki (URL)" className="p-3 bg-gray-50 rounded-xl w-full border-none text-blue-600 text-xs" defaultValue={r.link_url} onBlur={async (e) => { await supabase.from('reklamlar').update({ link_url: e.target.value }).eq('id', r.id); }} />
                    </div>
                    <button onClick={async () => { if(confirm("Banner silinsin mi?")) { await supabase.from('reklamlar').delete().eq('id', r.id); verileriYukle(); } }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={24}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* DUYURU YÖNETİMİ SEKMESİ */}
        {activeMenu === 'duyurular' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-blue-100 h-fit">
                 <h2 className="text-2xl font-black text-blue-900 mb-8 flex items-center gap-3"><Megaphone /> Duyuru Yayınla</h2>
                 <div className="space-y-4">
                    <input placeholder="Popup Başlığı" className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner" value={duyuruForm.baslik} onChange={e => setDuyuruForm({...duyuruForm, baslik: e.target.value})} />
                    <textarea placeholder="Mesajınız..." rows={4} className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner" value={duyuruForm.mesaj} onChange={e => setDuyuruForm({...duyuruForm, mesaj: e.target.value})} />
                    <button onClick={async () => {
                       if (!duyuruForm.baslik || !duyuruForm.mesaj) return alert("Doldurun!");
                       await supabase.from('duyurular').insert([duyuruForm]);
                       setDuyuruForm({ baslik: '', mesaj: '', resim_url: '', aktif: true });
                       verileriYukle();
                       alert("Duyuru yayında.");
                    }} className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition">Duyuruyu Şimdi Yayınla</button>
                 </div>
              </div>
              <div className="space-y-6">
                 <h3 className="text-xl font-black text-gray-400">Önceki Duyurular</h3>
                 {duyurular.map(d => (
                    <div key={d.id} className="bg-white p-6 rounded-[2rem] border relative group transition-all hover:border-blue-900">
                       <button onClick={async () => { await supabase.from('duyurular').delete().eq('id', d.id); verileriYukle(); }} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
                       <h4 className="font-black text-blue-900 text-lg mb-2">{d.baslik}</h4>
                       <p className="text-sm text-gray-600">{d.mesaj}</p>
                       <p className="mt-4 text-[10px] font-bold text-gray-400">{new Date(d.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* PERSONEL YÖNETİMİ SEKMESİ */}
        {activeMenu === 'personel' && isSuper && (
          <div className="space-y-6">
             <div className="bg-[#1a3c6e] p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
                <div>
                   <h2 className="text-3xl font-black mb-2">Personel Ekibi</h2>
                   <p className="text-blue-200">Panel yardımcılarınızı buradan yönetebilirsiniz.</p>
                </div>
                <button onClick={() => setPersonelEkleAcik(true)} className="p-6 bg-orange-400 text-blue-900 rounded-[2rem] font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-2"><UserPlus size={28}/> Personel Ekle</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kullanicilar.filter(k => k.type === 'staff').map(s => (
                   <div key={s.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border group hover:border-orange-400 transition-all">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 font-black text-blue-900 text-2xl group-hover:bg-orange-100 transition">{s.full_name[0]}</div>
                      <h4 className="font-black text-lg text-gray-800 mb-1">{s.full_name}</h4>
                      <p className="text-sm font-mono text-blue-600 mb-6">{s.phone_number}</p>
                      <div className="bg-orange-50 p-4 rounded-2xl mb-6">
                         <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Giriş Şifresi</p>
                         <p className="font-mono font-bold text-gray-700">{s.sifre_acik}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSecilenKullanici(s)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-blue-900 hover:text-white transition">Yetkiler</button>
                        <button onClick={async () => { if(confirm("Personel silinsin mi?")) { await supabase.from('profiles').delete().eq('id', s.id); verileriYukle(); } }} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20}/></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* MODALLAR (Açılır Pencereler) */}
      {personelEkleAcik && <PersonelEkleModal onKapat={() => setPersonelEkleAcik(false)} onEklendi={verileriYukle} />}
      {secilenKullanici && <DetayModal kullanici={secilenKullanici} onKapat={() => setSecilenKullanici(null)} onGuncelle={verileriYukle} onSil={async (id: any) => { if(confirm("Kullanıcı tamamen silinecek?")) { await supabase.from('profiles').delete().eq('id', id); setSecilenKullanici(null); verileriYukle(); } }} isSuper={isSuper} canSeePasswords={canSeePasswords} />}
    </div>
  );
}
