import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Unlock, Phone, LayoutDashboard, UserPlus, 
  ShieldCheck, Megaphone, LayoutPanelTop, Plus, Image as ImageIcon,
  Clock, ExternalLink, Settings, MapPin, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';

const SUPER_ADMIN_TELEFON = "05369500280";

// --- YETKİ TANIMLARI ---
const YETKI_LISTESI = [
  { id: 'ilan_onay', label: 'İlan Onay / Pasif Yapma' },
  { id: 'ilan_sil', label: 'İlan Silme Yetkisi' },
  { id: 'uye_duzenle', label: 'Üye Bilgisi Düzenleme' },
  { id: 'uye_sil', label: 'Üye Silme Yetkisi' },
  { id: 'sifre_gor', label: 'Üye Şifrelerini Görme' },
  { id: 'reklam_yonet', label: 'Banner & Reklam Yönetimi' },
  { id: 'duyuru_yonet', label: 'Popup Duyuru Yönetimi' },
  { id: 'personel_yonet', label: 'Personel Yönetimi (Süper)' }
];

export default function AdminPage({ onLogout, onIlanDetay }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');

  // Modallar
  const [secilenKullanici, setSecilenKullanici] = useState<any>(null);
  const [personelEkleAcik, setPersonelEkleAcik] = useState(false);

  // Formlar
  const [duyuruForm, setDuyuruForm] = useState({ baslik: '', mesaj: '', resim_url: '', saniye: 5, aktif: true });
  const [personelForm, setPersonelForm] = useState({ full_name: '', phone_number: '', sifre_acik: '' });

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('user');
      if (saved) {
        const { data } = await supabase.from('profiles').select('*').eq('id', JSON.parse(saved).id).single();
        if (data) setCurrentUser(data);
      }
      verileriYukle();
    };
    init();
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
  const canSeePasswords = isSuper || currentUser?.yetkiler?.sifre_gor;

  // --- İŞLEMLER ---
  const handleYeniBannerEkle = async () => {
    const { error } = await supabase.from('reklamlar').insert([{ 
      baslik: 'Yeni Manşet', 
      tip: 'ana_slider', 
      aktif: true, 
      sira: reklamlar.length 
    }]);
    if (error) alert("Hata: " + error.message);
    else verileriYukle();
  };

  const handleResimYukle = async (e: any, table: string, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${table}/${id}-${Date.now()}.png`;
    const { data, error } = await supabase.storage.from('reklam-resimler').upload(path, file);
    if (error) {
      // Eğer kova ismi farklıysa kontrol et
      const { data: data2, error: error2 } = await supabase.storage.from('reklam-resimleri').upload(path, file);
      if (error2) return alert("Storage Hatası: Lütfen 'reklam-resimleri' bucket'ının Public olduğundan emin olun.");
      const { data: urlData } = supabase.storage.from('reklam-resimleri').getPublicUrl(data2.path);
      await supabase.from(table).update({ resim_url: urlData.publicUrl }).eq('id', id);
    } else {
      const { data: urlData } = supabase.storage.from('reklam-resimler').getPublicUrl(data.path);
      await supabase.from(table).update({ resim_url: urlData.publicUrl }).eq('id', id);
    }
    verileriYukle();
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1e293b] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12 border-b border-white/10 pb-8">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20"><Shield size={28}/></div>
            <h1 className="font-black text-2xl tracking-tighter italic text-white">SALONUM <span className="text-orange-400">ADMİN</span></h1>
          </div>
          <nav className="space-y-2 flex-1">
            {[
              { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
              { id: 'ilanlar', label: 'İlanları Yönet', icon: FileText },
              { id: 'kullanicilar', label: 'Üye Listesi', icon: Users },
              { id: 'reklamlar', label: 'Reklam & Banner', icon: LayoutPanelTop },
              { id: 'duyurular', label: 'Popup Duyurular', icon: Megaphone },
              { id: 'personel', label: 'Personel Ekibi', icon: ShieldCheck, super: true },
            ].map(item => (
              (!item.super || isSuper) && (
                <button key={item.id} onClick={() => {setActiveMenu(item.id); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeMenu === item.id ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:bg-white/5'}`}>
                  <item.icon size={20} /> {item.label}
                </button>
              )
            ))}
          </nav>
          <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-6 py-4 bg-red-500/10 text-red-400 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all"><LogOut size={20}/> Çıkış Yap</button>
        </div>
      </aside>

      {/* MOBİL HEADER */}
      <div className="md:hidden bg-[#1e293b] p-4 flex justify-between items-center text-white sticky top-0 z-[90]">
        <span className="font-black uppercase tracking-widest text-orange-400 italic">SALONUM</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-xl"><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">

          {/* 1. DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Toplam Üye</p>
                    <h3 className="text-4xl font-black text-slate-800">{kullanicilar.length}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Yayındaki İlan</p>
                    <h3 className="text-4xl font-black text-orange-500">{ilanlar.length}</h3>
                  </div>
               </div>
               <div className="bg-[#1e293b] rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                 <div className="relative z-10">
                   <h2 className="text-4xl font-black tracking-tighter mb-4">Hoş Geldiniz 👋</h2>
                   <p className="text-slate-400 max-w-lg leading-relaxed text-lg">Salonum.site yönetim merkezindesiniz. Buradan üye yetkilerinden, reklam alanlarına kadar her şeyi kontrol edebilirsiniz.</p>
                 </div>
                 <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
               </div>
            </div>
          )}

          {/* 2. REKLAM & BANNER (GELİŞMİŞ TASARIM) */}
          {activeMenu === 'reklamlar' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Banner & Slider Ayarları</h2>
                    <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Ana sayfa görsel alanlarını yönetin.</p>
                  </div>
                  <button onClick={handleYeniBannerEkle} className="px-10 py-5 bg-orange-500 text-white rounded-[2rem] font-black shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform flex items-center gap-3">
                    <Plus /> YENİ BANNER EKLE
                  </button>
               </div>
               
               <div className="grid grid-cols-1 gap-8">
                  {reklamlar.map((r) => (
                    <div key={r.id} className="bg-white p-8 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 items-center group hover:shadow-2xl transition-all">
                      {/* Resim */}
                      <div className="w-full lg:w-96 h-56 bg-slate-100 rounded-[3rem] overflow-hidden relative border-8 border-slate-50 shadow-inner">
                        {r.resim_url ? <img src={r.resim_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300 font-black italic">GÖRSEL YOK</div>}
                        <label className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-white transition-all backdrop-blur-sm">
                           <ImageIcon size={32} className="mb-2" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Resmi Değiştir</span>
                           <input type="file" className="hidden" onChange={(e) => handleResimYukle(e, 'reklamlar', r.id)} />
                        </label>
                      </div>
                      {/* Form */}
                      <div className="flex-1 w-full space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-slate-800" placeholder="Banner Başlığı" defaultValue={r.baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ baslik: e.target.value }).eq('id', r.id); }} />
                            <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-400" placeholder="Alt Başlık" defaultValue={r.alt_baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ alt_baslik: e.target.value }).eq('id', r.id); }} />
                         </div>
                         <input className="w-full p-5 bg-slate-50 rounded-2xl border-none text-blue-500 font-mono text-xs" placeholder="Bağlantı URL (https://...)" defaultValue={r.link_url} onBlur={async (e) => { await supabase.from('reklamlar').update({ link_url: e.target.value }).eq('id', r.id); }} />
                      </div>
                      <button onClick={async () => { if(confirm("BU BANNER SİLİNSİN Mİ?")) { await supabase.from('reklamlar').delete().eq('id', r.id); verileriYukle(); } }} className="p-6 bg-red-50 text-red-500 rounded-[2rem] hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 3. ÜYE LİSTESİ */}
          {activeMenu === 'kullanicilar' && (
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Üye Kontrol Paneli</h2>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input placeholder="İsim veya telefon ile ara..." className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] shadow-inner font-bold" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="text-left text-[11px] font-black text-slate-300 uppercase tracking-widest border-b"><th className="pb-6 px-6">Üye / Profil</th><th className="pb-6 px-6 text-orange-600">Giriş Şifresi</th><th className="pb-6 px-6">Durum</th><th className="pb-6 px-6 text-right">Eylem</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {kullanicilar.filter(u => u.type !== 'staff' && u.full_name?.toLowerCase().includes(aramaMetni.toLowerCase())).map(u => (
                      <tr key={u.id} onClick={() => setSecilenKullanici(u)} className="hover:bg-slate-50/50 transition cursor-pointer group">
                        <td className="py-8 px-6">
                          <p className="font-black text-slate-700 group-hover:text-blue-600 transition-colors text-lg leading-none">{u.full_name}</p>
                          <p className="text-sm text-slate-400 font-bold mt-1 tracking-tighter">{u.phone_number}</p>
                        </td>
                        <td className="py-8 px-6">
                           {canSeePasswords ? <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-xl font-mono font-black text-sm border border-orange-200">{u.sifre_acik}</span> : '******'}
                        </td>
                        <td className="py-8 px-6"><div className={`w-4 h-4 rounded-full ${u.aktif ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div></td>
                        <td className="py-8 px-6 text-right"><button className="p-4 bg-white border rounded-2xl shadow-sm"><Settings size={20}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. PERSONEL YÖNETİMİ (SÜPER DETAYLI) */}
          {activeMenu === 'personel' && isSuper && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4">
              <div className="bg-[#1e293b] p-12 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-4xl font-black tracking-tighter mb-4">Sistem Personelleri</h2>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Yardımcı adminleri yönetin ve kısıtlayın.</p>
                </div>
                <button onClick={() => setPersonelEkleAcik(true)} className="relative z-10 px-12 py-6 bg-orange-500 rounded-[2.5rem] font-black text-lg shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform flex items-center gap-3"><UserPlus size={28}/> YENİ PERSONEL EKLE</button>
                <ShieldCheck size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {kullanicilar.filter(k => k.type === 'staff').map(s => (
                  <div key={s.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm hover:border-orange-500 transition-all group relative overflow-hidden">
                    <div className="w-20 h-20 bg-slate-50 text-slate-800 rounded-3xl flex items-center justify-center font-black text-3xl mb-8 group-hover:bg-orange-100 transition shadow-inner">{s.full_name[0]}</div>
                    <h4 className="font-black text-2xl text-slate-800 mb-1 leading-none">{s.full_name}</h4>
                    <p className="text-sm font-bold text-blue-600 font-mono mb-8">{s.phone_number}</p>
                    <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 mb-8">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">ERİŞİM ŞİFRESİ</p>
                      <p className="font-mono font-black text-slate-800 text-xl tracking-widest">{s.sifre_acik}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setSecilenKullanici(s)} className="flex-1 py-4 bg-[#1e293b] text-white rounded-[1.5rem] font-black shadow-lg">YETKİLER</button>
                      <button onClick={async () => { if(confirm("Personeli sistemden çıkar?")) { await supabase.from('profiles').delete().eq('id', s.id); verileriYukle(); } }} className="p-4 bg-red-50 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* PERSONEL EKLEME MODALI */}
      {personelEkleAcik && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-3xl font-black tracking-tighter mb-8 text-slate-800">Personel Kayıt</h2>
              <div className="space-y-4">
                 <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold" placeholder="Ad Soyad" onChange={e => setPersonelForm({...personelForm, full_name: e.target.value})} />
                 <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold" placeholder="Telefon" onChange={e => setPersonelForm({...personelForm, phone_number: e.target.value})} />
                 <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold font-mono" placeholder="Giriş Şifresi" onChange={e => setPersonelForm({...personelForm, sifre_acik: e.target.value})} />
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setPersonelEkleAcik(false)} className="flex-1 font-black text-slate-400">Vazgeç</button>
                    <button onClick={async () => {
                       const { error } = await supabase.from('profiles').insert([{ ...personelForm, type: 'staff', aktif: true, yetkiler: { panel_giris: true } }]);
                       if(error) alert(error.message);
                       else { setPersonelEkleAcik(false); verileriYukle(); }
                    }} className="flex-[2] py-5 bg-blue-900 text-white rounded-3xl font-black shadow-xl shadow-blue-200">KAYDET</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ÜYE/PERSONEL DÜZENLEME VE YETKİ MODALI */}
      {secilenKullanici && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1e293b] p-10 text-white flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-3xl font-black">{secilenKullanici.full_name?.[0]}</div>
                <div><h3 className="font-black text-2xl">{secilenKullanici.full_name}</h3><p className="text-orange-400 font-bold uppercase text-[10px] tracking-widest">{secilenKullanici.type}</p></div>
              </div>
              <button onClick={() => setSecilenKullanici(null)} className="p-4 bg-white/10 rounded-full"><X/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Temel Bilgiler</h4>
                  <div className="bg-slate-50 p-8 rounded-[3rem] space-y-4">
                     <div><p className="text-[10px] font-black text-slate-400 mb-1">TELEFON</p><p className="font-bold text-lg">{secilenKullanici.phone_number}</p></div>
                     <div><p className="text-[10px] font-black text-slate-400 mb-1">ERİŞİM ŞİFRESİ</p>
                        <input className="w-full bg-white p-4 rounded-2xl border font-mono font-bold text-orange-600" value={secilenKullanici.sifre_acik} onChange={async (e) => {
                          const val = e.target.value;
                          setSecilenKullanici({...secilenKullanici, sifre_acik: val});
                        }} />
                     </div>
                     <button onClick={async () => {
                        const { error } = await supabase.from('profiles').update({ sifre_acik: secilenKullanici.sifre_acik }).eq('id', secilenKullanici.id);
                        if(!error) alert("Güncellendi!");
                     }} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black">BİLGİLERİ KAYDET</button>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Özel Yetkiler</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {YETKI_LISTESI.map(y => (
                      <button key={y.id} onClick={async () => {
                         const yeniYetkiler = { ...secilenKullanici.yetkiler, [y.id]: !secilenKullanici.yetkiler?.[y.id] };
                         await supabase.from('profiles').update({ yetkiler: yeniYetkiler }).eq('id', secilenKullanici.id);
                         setSecilenKullanici({...secilenKullanici, yetkiler: yeniYetkiler});
                      }} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${secilenKullanici.yetkiler?.[y.id] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                        <span className="text-xs font-black uppercase tracking-tighter">{y.label}</span>
                        {secilenKullanici.yetkiler?.[y.id] ? <ShieldCheck/> : <XCircle/>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
