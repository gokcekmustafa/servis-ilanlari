import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Unlock, Phone, LayoutDashboard, UserPlus, 
  ShieldCheck, Megaphone, LayoutPanelTop, Plus, Image as ImageIcon,
  Clock, ExternalLink, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { destekTalepleriniGetir } from '../lib/ilanlar';
import { Ilan } from '../types';

const SUPER_ADMIN_TELEFON = "05369500280";

export default function AdminPage({ onLogout, onIlanDetay }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenKullanici, setSecilenKullanici] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');

  // Duyuru Form State
  const [duyuruForm, setDuyuruForm] = useState({ baslik: '', mesaj: '', resim_url: '', saniye: 5, aktif: true });

  useEffect(() => {
    const checkUser = async () => {
      const saved = localStorage.getItem('user');
      if (saved) {
        const p = JSON.parse(saved);
        const { data } = await supabase.from('profiles').select('*').eq('id', p.id).single();
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

  // --- İŞLEM FONKSİYONLARI ---
  const handleYeniBannerEkle = async () => {
    const { error } = await supabase.from('reklamlar').insert([{
      baslik: 'Yeni Reklam Başlığı',
      alt_baslik: 'Alt başlık metni buraya',
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
    const path = `${table}-${id}-${Date.now()}`;
    const { data, error } = await supabase.storage.from('reklam-resimleri').upload(path, file);
    if (error) return alert("Hata: " + error.message);
    
    const { data: urlData } = supabase.storage.from('reklam-resimleri').getPublicUrl(data.path);
    await supabase.from(table).update({ resim_url: urlData.publicUrl }).eq('id', id);
    verileriYukle();
  };

  const isSuper = currentUser?.phone_number === SUPER_ADMIN_TELEFON;
  const canSeePasswords = isSuper || currentUser?.yetkiler?.sifreleri_gor;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* PROFESYONEL SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1e293b] text-white transform transition-all duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Shield className="text-white" size={28} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter uppercase leading-none">SALONUM</h1>
              <span className="text-[10px] font-bold text-orange-400 tracking-[0.2em]">KONTROL PANELİ</span>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'ilanlar', label: 'İlanları Yönet', icon: FileText },
              { id: 'kullanicilar', label: 'Üye Listesi', icon: Users },
              { id: 'reklamlar', label: 'Banner & Reklam', icon: LayoutPanelTop },
              { id: 'duyurular', label: 'Popup Duyuru', icon: Megaphone },
              { id: 'personel', label: 'Personel Ayarları', icon: ShieldCheck, super: true },
            ].map(item => (
              (!item.super || isSuper) && (
                <button key={item.id} onClick={() => { setActiveMenu(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${activeMenu === item.id ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                  <item.icon size={20} className={activeMenu === item.id ? 'text-white' : 'group-hover:text-orange-400'} />
                  {item.label}
                </button>
              )
            ))}
          </nav>

          <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-6 py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold">
            <LogOut size={20} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* MOBİL ÜST BAR */}
      <div className="md:hidden bg-[#1e293b] p-4 flex justify-between items-center text-white sticky top-0 z-[90]">
        <div className="flex items-center gap-2">
          <Shield className="text-orange-500" size={24} />
          <span className="font-black">SALONUM ADMİN</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-xl"><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">

          {/* 1. DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Users size={28}/></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Toplam Üye</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-1">{kullanicilar.length}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><FileText size={28}/></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktif İlan</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-1">{ilanlar.length}</h3>
                  </div>
               </div>
               <div className="bg-[#1e293b] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10">
                   <h2 className="text-3xl font-black mb-2">Hoş Geldin, Yönetici 👋</h2>
                   <p className="text-slate-400 max-w-md leading-relaxed text-sm">Sistemi buradan tam yetkiyle yönetebilirsin. Tüm değişiklikler anında yayına alınır.</p>
                 </div>
                 <Shield size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
               </div>
            </div>
          )}

          {/* 2. İLANLAR (GELİŞMİŞ TABLO) */}
          {activeMenu === 'ilanlar' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">Yayındaki İlanlar</h2>
                <div className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold">{ilanlar.length} İLAN</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                      <th className="px-8 py-5">İlan Detayı</th>
                      <th className="px-8 py-5">Kategori</th>
                      <th className="px-8 py-5">Yayınlayan</th>
                      <th className="px-8 py-5">Tarih</th>
                      <th className="px-8 py-5 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ilanlar.map(ilan => (
                      <tr key={ilan.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">{ilan.aciklama}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${ilan.durum === 'aktif' ? 'bg-green-500' : 'bg-slate-300'}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{ilan.durum}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-black text-[10px] uppercase">
                            {ilan.kategori.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-600 text-xs">{ilan.ilan_veren}</p>
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-xs font-medium">
                          {new Date(ilan.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onIlanDetay(ilan)} className="p-2 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"><Eye size={16}/></button>
                            <button onClick={async () => { if(confirm("SİLELİM Mİ?")) { await supabase.from('ilanlar').delete().eq('id', ilan.id); verileriYukle(); } }} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. REKLAM & BANNER (GELİŞMİŞ TASARIM) */}
          {activeMenu === 'reklamlar' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Banner & Slider Ayarları</h2>
                    <p className="text-sm text-slate-400">Ana sayfadaki reklam alanlarını buradan yönetin.</p>
                  </div>
                  <button onClick={handleYeniBannerEkle} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-orange-500/20">
                    <Plus /> YENİ BANNER EKLE
                  </button>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  {reklamlar.map((r, idx) => (
                    <div key={r.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 items-center group hover:shadow-xl transition-all">
                      {/* Resim Alanı */}
                      <div className="w-full lg:w-72 h-44 bg-slate-100 rounded-[2rem] overflow-hidden relative border-4 border-slate-50">
                        {r.resim_url ? (
                          <img src={r.resim_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                            <ImageIcon size={32} className="opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Görsel Bekleniyor</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white transition-all backdrop-blur-sm">
                           <div className="flex flex-col items-center gap-2">
                              <ImageIcon size={24} />
                              <span className="text-[10px] font-black uppercase">Resmi Değiştir</span>
                           </div>
                           <input type="file" className="hidden" onChange={(e) => handleResimYukle(e, 'reklamlar', r.id)} />
                        </label>
                      </div>

                      {/* Bilgi Formu */}
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Banner Başlığı</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold" defaultValue={r.baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ baslik: e.target.value }).eq('id', r.id); }} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Alt Başlık</label>
                            <input className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500" defaultValue={r.alt_baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ alt_baslik: e.target.value }).eq('id', r.id); }} />
                         </div>
                         <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Bağlantı Linki (URL)</label>
                            <div className="relative">
                              <input className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-blue-600 text-xs font-mono" defaultValue={r.link_url} onBlur={async (e) => { await supabase.from('reklamlar').update({ link_url: e.target.value }).eq('id', r.id); }} />
                              <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            </div>
                         </div>
                      </div>

                      <button onClick={async () => { if(confirm("SİLİNSİN Mİ?")) { await supabase.from('reklamlar').delete().eq('id', r.id); verileriYukle(); } }} className="p-5 bg-red-50 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={24}/>
                      </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 4. DUYURU & POPUP (RESİMLİ VE SÜRELİ) */}
          {activeMenu === 'duyurular' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
               {/* Duyuru Ekleme Kartı */}
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 h-fit">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Megaphone size={24}/></div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Yeni Duyuru Hazırla</h2>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Duyuru Başlığı</label>
                      <input className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner" placeholder="..." value={duyuruForm.baslik} onChange={e => setDuyuruForm({...duyuruForm, baslik: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Duyuru Mesajı</label>
                      <textarea rows={4} className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner" placeholder="..." value={duyuruForm.mesaj} onChange={e => setDuyuruForm({...duyuruForm, mesaj: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Görünme Süresi (Sn)</label>
                          <div className="relative">
                            <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner" value={duyuruForm.saniye} onChange={e => setDuyuruForm({...duyuruForm, saniye: parseInt(e.target.value)})} />
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          </div>
                       </div>
                       <div className="flex flex-col justify-end">
                         <button onClick={async () => {
                            if(!duyuruForm.baslik || !duyuruForm.mesaj) return alert("Başlık ve mesaj girin!");
                            const { data, error } = await supabase.from('duyurular').insert([duyuruForm]).select();
                            if(error) alert("Hata: " + error.message);
                            else { alert("Duyuru başarıyla kaydedildi."); setDuyuruForm({ baslik: '', mesaj: '', resim_url: '', saniye: 5, aktif: true }); verileriYukle(); }
                         }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">ŞİMDİ YAYINLA</button>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Önceki Duyurular Galerisi */}
               <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-400 tracking-tighter flex items-center gap-2">
                    <History size={20} /> ÖNCEKİ DUYURULAR
                  </h3>
                  {duyurular.map(d => (
                    <div key={d.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 relative group overflow-hidden">
                       <div className="flex gap-6">
                          <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border relative group/img">
                            {d.resim_url ? <img src={d.resim_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-6 text-slate-200" />}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer text-white text-[8px] font-black transition-all">
                              RESİM SEÇ
                              <input type="file" className="hidden" onChange={(e) => handleResimYukle(e, 'duyurular', d.id)} />
                            </label>
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <h4 className="font-black text-slate-800 text-lg leading-none">{d.baslik}</h4>
                                <button onClick={async () => { if(confirm("DUYURU SİLİNSİN Mİ?")) { await supabase.from('duyurular').delete().eq('id', d.id); verileriYukle(); } }} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                             </div>
                             <p className="text-xs text-slate-500 mt-2 line-clamp-2">{d.mesaj}</p>
                             <div className="flex items-center gap-3 mt-4">
                               <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded tracking-widest uppercase">{d.saniye} SANİYE</span>
                               <span className="text-[9px] font-black text-slate-300">{new Date(d.created_at).toLocaleString('tr-TR')}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- EK BİLEŞENLER (Dashboard sayacı gibi) ---
function History({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>; }
3. Adım: HomePage.tsx (Süreli ve Resimli Popup)
Bu kod, duyuru geldiğinde otomatik olarak ekrana basar, resmi gösterir ve belirtilen saniye sonunda kendiliğinden kapanır.
Dosya: src/pages/HomePage.tsx
code
Tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { X, Clock } from 'lucide-react';

export default function HomePage({ onIlanDetay }: any) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [aktifDuyuru, setAktifDuyuru] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifSliderIndex, setAktifSliderIndex] = useState(0);
  const [kalanSaniye, setKalanSaniye] = useState(0);

  useEffect(() => {
    verileriYukle();
  }, []);

  // POPUP SÜRE SİSTEMİ
  useEffect(() => {
    let timer: any;
    if (aktifDuyuru && kalanSaniye > 0) {
      timer = setInterval(() => {
        setKalanSaniye(prev => prev - 1);
      }, 1000);
    } else if (kalanSaniye === 0 && aktifDuyuru) {
      setAktifDuyuru(null);
    }
    return () => clearInterval(timer);
  }, [aktifDuyuru, kalanSaniye]);

  const verileriYukle = async () => {
    setYukleniyor(true);
    const { data: ilanData } = await ilanlariGetir();
    if (ilanData) setIlanlar(ilanData as Ilan[]);

    const { data: reklamData } = await supabase.from('reklamlar').select('*').eq('aktif', true).order('sira');
    if (reklamData) setReklamlar(reklamData);

    const { data: duyuruData } = await supabase.from('duyurular').select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(1);
    if (duyuruData && duyuruData.length > 0) {
      const isClosed = sessionStorage.getItem(`kapali_${duyuruData[0].id}`);
      if (!isClosed) {
        setAktifDuyuru(duyuruData[0]);
        setKalanSaniye(duyuruData[0].saniye || 5);
      }
    }
    setYukleniyor(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* BANNER SLIDER */}
      {reklamlar.length > 0 && (
        <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden bg-slate-900">
           {reklamlar.map((r, i) => (
             <div key={r.id} className={`absolute inset-0 transition-all duration-1000 ${i === aktifSliderIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                {r.resim_url && <img src={r.resim_url} className="w-full h-full object-cover opacity-60" />}
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                   <div className="max-w-4xl space-y-4">
                      <h2 className="text-3xl md:text-6xl font-black text-white drop-shadow-2xl">{r.baslik}</h2>
                      <p className="text-lg md:text-2xl text-orange-400 font-bold drop-shadow-lg uppercase tracking-widest">{r.alt_baslik}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* POPUP SİSTEMİ */}
      {aktifDuyuru && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setAktifDuyuru(null)}>
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            {/* Süre Sayacı */}
            <div className="absolute top-6 left-6 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2 text-[10px] font-black text-slate-500">
               <Clock size={12} /> {kalanSaniye} SN KALDI
            </div>
            
            <button onClick={() => setAktifDuyuru(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
            
            {aktifDuyuru.resim_url && (
              <img src={aktifDuyuru.resim_url} className="w-full h-64 object-cover border-b" alt="Duyuru" />
            )}
            
            <div className="p-10 text-center">
               <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter leading-none">{aktifDuyuru.baslik}</h3>
               <p className="text-slate-500 leading-relaxed mb-8">{aktifDuyuru.mesaj}</p>
               <button onClick={() => setAktifDuyuru(null)} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-200">KAPAT</button>
            </div>
          </div>
        </div>
      )}

      {/* İLAN LİSTESİ (SADECE ÖRNEK) */}
      <div className="max-w-7xl mx-auto px-4 py-10">
         <div className="grid grid-cols-1 gap-6">
            {ilanlar.map(ilan => <IlanCard key={ilan.id} ilan={ilan} onDetay={onIlanDetay} />)}
         </div>
      </div>
    </div>
  );
}
