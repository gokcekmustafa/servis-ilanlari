import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Trash2, Eye, CheckCircle, XCircle, 
  LogOut, HelpCircle, Edit, Save, X, Menu, Shield, 
  Search, Unlock, Phone, LayoutDashboard, UserPlus, 
  ShieldCheck, Megaphone, LayoutPanelTop, Plus, Image as ImageIcon,
  Clock, ExternalLink, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { destekTalepleriniGetir } from '../lib/ilanlar';
import { Ilan } from '../types';

const SUPER_ADMIN_TELEFON = "05369500280";

// --- YARDIMCI BİLEŞEN: ÜYE/PERSONEL DETAY MODALI ---
function DetayModal({ kullanici, onKapat, onGuncelle, onSil, isSuper, canSeePasswords }: any) {
  const [duzenle, setDuzenle] = useState(false);
  const [yeniSifre, setYeniSifre] = useState(kullanici.sifre_acik || '');
  const [aktif, setAktif] = useState(kullanici.aktif !== false);
  const [yetkiler, setYetkiler] = useState(kullanici.yetkiler || {});

  const handleKaydet = async () => {
    const updates: any = { aktif, sifre_acik: yeniSifre, yetkiler };
    if (yeniSifre !== kullanici.sifre_acik) {
      const encoder = new TextEncoder();
      const data = encoder.encode(yeniSifre + 'servis-ilanlari-salt');
      const hash = await crypto.subtle.digest('SHA-256', data);
      updates.password_hash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    await supabase.from('profiles').update(updates).eq('id', kullanici.id);
    onGuncelle();
    setDuzenle(false);
    alert("Kayıt başarıyla güncellendi.");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        <div className="bg-[#1e293b] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold">{kullanici.full_name?.[0]}</div>
             <h3 className="font-bold text-lg">{kullanici.full_name}</h3>
          </div>
          <button onClick={onKapat} className="p-2 hover:bg-white/10 rounded-full transition"><X /></button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">GİRİŞ ŞİFRESİ (AÇIK)</p>
              {canSeePasswords ? (
                duzenle ? (
                  <input value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} className="p-2 border rounded-xl font-mono text-sm bg-white" />
                ) : (
                  <p className="text-3xl font-mono font-black text-slate-800">{kullanici.sifre_acik || '---'}</p>
                )
              ) : <p className="text-slate-400 italic font-bold tracking-widest">GİZLİ</p>}
            </div>
            {!duzenle && <button onClick={() => setDuzenle(true)} className="p-3 bg-white rounded-2xl shadow-sm text-orange-600"><Edit size={20}/></button>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Kişisel Bilgiler</p>
               <div className="space-y-3">
                 <p className="flex items-center gap-2 text-sm"><strong>Telefon:</strong> {kullanici.phone_number}</p>
                 <p className="flex items-center gap-2 text-sm"><strong>Bölge:</strong> {kullanici.il} / {kullanici.ilce}</p>
                 <p className="flex items-center gap-2 text-sm"><strong>Tür:</strong> <span className="uppercase font-bold text-blue-600">{kullanici.type}</span></p>
               </div>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Hesap Durumu</p>
               <label className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                 <span className="text-xs font-bold">AKTİF HESAP</span>
                 <input type="checkbox" checked={aktif} onChange={() => setAktif(!aktif)} disabled={!duzenle} className="w-5 h-5 accent-green-600" />
               </label>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t flex gap-4">
          {duzenle && (
            <button onClick={handleKaydet} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg">DEĞİŞİKLİKLERİ KAYDET</button>
          )}
          <button onClick={() => onSil(kullanici.id)} className="px-8 py-4 bg-red-100 text-red-600 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all">SİL</button>
        </div>
      </div>
    </div>
  );
}

// --- ANA COMPONENT ---
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

  // Form States
  const [duyuruForm, setDuyuruForm] = useState({ baslik: '', mesaj: '', resim_url: '', saniye: 5, aktif: true });
  const [personelForm, setPersonelForm] = useState({ full_name: '', phone_number: '', sifre_acik: '' });
  const [personelEkleAcik, setPersonelEkleAcik] = useState(false);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('user');
      if (saved) {
        const { data } = await supabase.from('profiles').select('*').eq('id', JSON.parse(saved).id).single();
        if (data) setCurrentUser(data);
      }
    };
    init();
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

  const handleYeniBannerEkle = async () => {
    const { error } = await supabase.from('reklamlar').insert([{ baslik: 'Yeni Banner', tip: 'ana_slider', sira: reklamlar.length, aktif: true }]);
    if (error) alert("Hata: " + error.message);
    else verileriYukle();
  };

  const handlePersonelEkle = async () => {
    if (!personelForm.full_name || !personelForm.phone_number || !personelForm.sifre_acik) return alert("Eksik alan!");
    const { error } = await supabase.from('profiles').insert([{ ...personelForm, type: 'staff', aktif: true }]);
    if (error) alert("Hata: " + error.message);
    else { setPersonelEkleAcik(false); setPersonelForm({ full_name: '', phone_number: '', sifre_acik: '' }); verileriYukle(); }
  };

  const isSuper = currentUser?.phone_number === SUPER_ADMIN_TELEFON;
  const canSeePasswords = isSuper || currentUser?.yetkiler?.sifreleri_gor;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-72 bg-[#1e293b] text-white transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12 border-b border-white/10 pb-6">
            <Shield className="text-orange-500" size={32} />
            <h1 className="font-black text-xl italic tracking-tighter">SALONUM <span className="text-orange-400">ADMİN</span></h1>
          </div>
          <nav className="space-y-1 flex-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'ilanlar', label: 'İlan Yönetimi', icon: FileText },
              { id: 'kullanicilar', label: 'Üye Listesi', icon: Users },
              { id: 'reklamlar', label: 'Reklam & Banner', icon: LayoutPanelTop },
              { id: 'duyurular', label: 'Duyuru & Popup', icon: Megaphone },
              { id: 'personel', label: 'Personel Ayarları', icon: ShieldCheck, super: true },
            ].map(item => (
              (!item.super || isSuper) && (
                <button key={item.id} onClick={() => {setActiveMenu(item.id); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeMenu === item.id ? 'bg-orange-500 text-white font-black shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:bg-white/5'}`}>
                  <item.icon size={20} /> {item.label}
                </button>
              )
            ))}
          </nav>
          <button onClick={onLogout} className="mt-auto flex items-center gap-4 p-5 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl"><LogOut size={20}/> Çıkış Yap</button>
        </div>
      </aside>

      {/* MOBİL ÜST BAR */}
      <div className="md:hidden bg-[#1e293b] p-4 flex justify-between items-center text-white sticky top-0 z-[90]">
        <span className="font-black">SALONUM ADMİN</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-xl"><Menu/></button>
      </div>

      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">

          {/* DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Users size={32}/></div>
                 <div><p className="text-xs font-black text-slate-400 uppercase">Toplam Üye</p><h3 className="text-4xl font-black">{kullanicilar.length}</h3></div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6">
                 <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><FileText size={32}/></div>
                 <div><p className="text-xs font-black text-slate-400 uppercase">Aktif İlan</p><h3 className="text-4xl font-black">{ilanlar.length}</h3></div>
              </div>
            </div>
          )}

          {/* İLANLAR */}
          {activeMenu === 'ilanlar' && (
            <div className="bg-white rounded-[3rem] shadow-sm border overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b bg-slate-50 flex justify-between items-center"><h2 className="text-2xl font-black">Sistemdeki İlanlar</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-[11px] font-black text-slate-400 uppercase bg-slate-50 border-b"><th className="p-6">İlan Başlığı</th><th className="p-6">Yayınlayan</th><th className="p-6 text-right">İşlem</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {ilanlar.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50 transition">
                        <td className="p-6 font-bold text-slate-700">{i.aciklama}</td>
                        <td className="p-6 text-xs text-slate-500 font-bold uppercase">{i.ilan_veren}</td>
                        <td className="p-6 text-right flex justify-end gap-2">
                          <button onClick={() => onIlanDetay(i)} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Eye size={18}/></button>
                          <button onClick={async () => { if(confirm("Silinsin mi?")) { await supabase.from('ilanlar').delete().eq('id', i.id); verileriYukle(); } }} className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ÜYE LİSTESİ */}
          {activeMenu === 'kullanicilar' && (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border animate-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h2 className="text-2xl font-black">Üye Yönetimi</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input placeholder="Ara..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl shadow-inner" value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="text-left text-[11px] font-black text-slate-400 uppercase border-b"><th className="p-4">Ad Soyad</th><th className="p-4 text-orange-600">Şifre</th><th className="p-4">Bölge</th><th className="p-4 text-right">Eylem</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {kullanicilar.filter(u => u.type !== 'staff' && u.full_name?.toLowerCase().includes(aramaMetni.toLowerCase())).map(u => (
                      <tr key={u.id} onClick={() => setSecilenKullanici(u)} className="hover:bg-blue-50/50 transition cursor-pointer">
                        <td className="p-4 font-bold">{u.full_name} <br/><span className="text-xs text-slate-400 font-normal">{u.phone_number}</span></td>
                        <td className="p-4">{canSeePasswords ? <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-mono font-bold text-xs">{u.sifre_acik}</span> : '******'}</td>
                        <td className="p-4 text-xs font-bold uppercase text-blue-600">{u.il || '-'}</td>
                        <td className="p-4 text-right"><button className="p-3 border rounded-2xl"><Unlock size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REKLAM & BANNER */}
          {activeMenu === 'reklamlar' && (
            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[2.5rem] border flex justify-between items-center shadow-sm">
                  <h2 className="text-2xl font-black">Banner & Slider Ayarları</h2>
                  <button onClick={handleYeniBannerEkle} className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg"><Plus /> YENİ BANNER EKLE</button>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {reklamlar.map(r => (
                    <div key={r.id} className="bg-white p-8 rounded-[3rem] border shadow-sm flex flex-col md:flex-row gap-8 items-center group">
                       <div className="w-full md:w-64 h-40 bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                          {r.resim_url && <img src={r.resim_url} className="w-full h-full object-cover" />}
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-white font-black text-xs transition-all">GÖRSELİ DEĞİŞTİR<input type="file" className="hidden" onChange={async (e) => {
                             const file = e.target.files?.[0]; if (!file) return;
                             const path = `banner-${Date.now()}`;
                             const { data } = await supabase.storage.from('reklam-resimleri').upload(path, file);
                             if (data) {
                                const { data: urlData } = supabase.storage.from('reklam-resimleri').getPublicUrl(data.path);
                                await supabase.from('reklamlar').update({ resim_url: urlData.publicUrl }).eq('id', r.id);
                                verileriYukle();
                             }
                          }} /></label>
                       </div>
                       <div className="flex-1 space-y-3 w-full">
                          <input className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black" defaultValue={r.baslik} onBlur={async (e) => { await supabase.from('reklamlar').update({ baslik: e.target.value }).eq('id', r.id); }} />
                          <input className="w-full p-4 bg-slate-50 rounded-2xl border-none text-blue-600 font-mono text-xs" defaultValue={r.link_url} onBlur={async (e) => { await supabase.from('reklamlar').update({ link_url: e.target.value }).eq('id', r.id); }} />
                       </div>
                       <button onClick={async () => { if(confirm("Silinsin mi?")) { await supabase.from('reklamlar').delete().eq('id', r.id); verileriYukle(); } }} className="p-5 bg-red-50 text-red-500 rounded-3xl"><Trash2/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* DUYURU & POPUP */}
          {activeMenu === 'duyurular' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4">
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm h-fit space-y-6">
                <h2 className="text-2xl font-black text-blue-900 flex items-center gap-3"><Megaphone /> Duyuru Yayınla</h2>
                <input placeholder="Popup Başlığı" className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner font-bold" value={duyuruForm.baslik} onChange={e => setDuyuruForm({...duyuruForm, baslik: e.target.value})} />
                <textarea placeholder="Mesajınız..." rows={4} className="w-full p-4 bg-slate-50 rounded-2xl border-none shadow-inner" value={duyuruForm.mesaj} onChange={e => setDuyuruForm({...duyuruForm, mesaj: e.target.value})} />
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                   <Clock size={20} className="text-slate-400" />
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400">GÖRÜNME SÜRESİ (SANİYE)</p>
                      <input type="number" className="bg-transparent font-bold w-full" value={duyuruForm.saniye} onChange={e => setDuyuruForm({...duyuruForm, saniye: parseInt(e.target.value)})} />
                   </div>
                </div>
                <button onClick={async () => { await supabase.from('duyurular').insert([duyuruForm]); setDuyuruForm({ baslik: '', mesaj: '', resim_url: '', saniye: 5, aktif: true }); verileriYukle(); }} className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black shadow-xl">ŞİMDİ YAYINLA</button>
              </div>
              <div className="space-y-6">
                {duyurular.map(d => (
                  <div key={d.id} className="bg-white p-8 rounded-[3rem] border relative group transition-all hover:border-blue-900">
                    <button onClick={async () => { await supabase.from('duyurular').delete().eq('id', d.id); verileriYukle(); }} className="absolute top-6 right-6 text-red-400"><Trash2 size={20}/></button>
                    <div className="flex gap-4">
                       <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border relative flex-shrink-0 group/img">
                          {d.resim_url ? <img src={d.resim_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-6 text-slate-200" />}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer text-white text-[8px] font-black transition-all">RESİM SEÇ<input type="file" className="hidden" onChange={async (e) => {
                             const file = e.target.files?.[0]; if (!file) return;
                             const path = `duyuru-${Date.now()}`;
                             const { data } = await supabase.storage.from('reklam-resimleri').upload(path, file);
                             if (data) {
                                const { data: urlData } = supabase.storage.from('reklam-resimleri').getPublicUrl(data.path);
                                await supabase.from('duyurular').update({ resim_url: urlData.publicUrl }).eq('id', d.id);
                                verileriYukle();
                             }
                          }} /></label>
                       </div>
                       <div>
                          <h4 className="font-black text-blue-900 text-lg mb-2">{d.baslik}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2">{d.mesaj}</p>
                          <span className="inline-block mt-4 text-[9px] font-black bg-slate-100 px-2 py-1 rounded uppercase tracking-tighter">{d.saniye} SANİYE</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PERSONEL YÖNETİMİ */}
          {activeMenu === 'personel' && isSuper && (
            <div className="space-y-8">
               <div className="bg-[#1e293b] p-10 rounded-[4rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2">Personel Ekibi</h2>
                    <p className="text-slate-400">Yardımcı adminleri buradan ekleyip yetkilendirebilirsiniz.</p>
                  </div>
                  <button onClick={() => setPersonelEkleAcik(true)} className="relative z-10 bg-orange-500 text-white px-8 py-5 rounded-[2.5rem] font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-3"><UserPlus /> YENİ PERSONEL EKLE</button>
                  <ShieldCheck size={160} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {kullanicilar.filter(k => k.type === 'staff').map(s => (
                    <div key={s.id} className="bg-white p-8 rounded-[3rem] border shadow-sm group hover:border-orange-500 transition-all">
                       <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center font-black text-2xl mb-6 group-hover:bg-orange-100 transition">{s.full_name[0]}</div>
                       <h4 className="font-black text-xl mb-1">{s.full_name}</h4>
                       <p className="text-sm font-mono text-blue-600 mb-6">{s.phone_number}</p>
                       <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">ŞİFRE</p>
                          <p className="font-mono font-bold text-slate-800">{s.sifre_acik}</p>
                       </div>
                       <div className="flex gap-3">
                          <button onClick={() => setSecilenKullanici(s)} className="flex-1 py-3 bg-blue-900 text-white rounded-2xl font-black">YETKİLER</button>
                          <button onClick={async () => { if(confirm("Personeli çıkar?")) { await supabase.from('profiles').delete().eq('id', s.id); verileriYukle(); } }} className="p-4 bg-red-50 text-red-500 rounded-2xl"><Trash2 size={20}/></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </main>

      {/* MODALLAR */}
      {personelEkleAcik && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <h2 className="text-2xl font-black mb-8">Personel Kayıt</h2>
              <div className="space-y-4">
                 <input placeholder="Ad Soyad" className="w-full p-4 bg-slate-50 rounded-2xl border-none" value={personelForm.full_name} onChange={e => setPersonelForm({...personelForm, full_name: e.target.value})} />
                 <input placeholder="Telefon" className="w-full p-4 bg-slate-50 rounded-2xl border-none" value={personelForm.phone_number} onChange={e => setPersonelForm({...personelForm, phone_number: e.target.value})} />
                 <input placeholder="Giriş Şifresi" className="w-full p-4 bg-slate-50 rounded-2xl border-none" value={personelForm.sifre_acik} onChange={e => setPersonelForm({...personelForm, sifre_acik: e.target.value})} />
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setPersonelEkleAcik(false)} className="flex-1 font-bold text-slate-400">İptal</button>
                    <button onClick={handlePersonelEkle} className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black shadow-lg">KAYDET</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {secilenKullanici && <DetayModal kullanici={secilenKullanici} onKapat={() => setSecilenKullanici(null)} onGuncelle={verileriYukle} onSil={async (id: any) => { if(confirm("Tüm verileri silinsin mi?")) { await supabase.from('profiles').delete().eq('id', id); setSecilenKullanici(null); verileriYukle(); } }} isSuper={isSuper} canSeePasswords={canSeePasswords} />}
    </div>
  );
}
