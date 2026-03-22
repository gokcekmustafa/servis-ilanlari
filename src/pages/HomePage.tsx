import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import IlanCard from '../components/IlanCard';
import { ilanlariGetir } from '../lib/ilanlar';
import { KategoriType, Ilan } from '../types';
import { supabase } from '../lib/supabase';
import { X, Search, ChevronRight, MapPin, Tag } from 'lucide-react';

export default function HomePage({ onIlanDetay }: any) {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [aktifSlider, setAktifSlider] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const yukle = async () => {
      const { data: ads } = await ilanlariGetir();
      if (ads) setIlanlar(ads as Ilan[]);
      const { data: recs } = await supabase.from('reklamlar').select('*').eq('aktif', true).order('sira');
      if (recs) setReklamlar(recs);
      setYukleniyor(false);
    };
    yukle();
  }, []);

  useEffect(() => {
    if (reklamlar.length > 1) {
      const t = setInterval(() => setAktifSlider(p => (p === reklamlar.length - 1 ? 0 : p + 1)), 6000);
      return () => clearInterval(t);
    }
  }, [reklamlar]);

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      
      {/* PROFESSIONAL BANNER (TASIMACILAR STYLE) */}
      {reklamlar.length > 0 && (
        <div className="relative h-[450px] md:h-[650px] w-full bg-slate-900 overflow-hidden">
          {reklamlar.map((r, i) => (
            <div key={r.id} className={`absolute inset-0 transition-all duration-1000 ease-out ${i === aktifSlider ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
               <img src={r.resim_url} className="w-full h-full object-cover opacity-50" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
               <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div className="max-w-6xl space-y-6">
                     <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-700">{r.baslik}</h2>
                     <p className="text-xl md:text-3xl text-orange-400 font-bold uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-10 duration-1000">{r.alt_baslik}</p>
                     {r.link_url && (
                        <a href={r.link_url} className="inline-block mt-8 px-14 py-6 bg-orange-500 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-orange-600 transition-all transform hover:scale-110">KEŞFETMEYE BAŞLA</a>
                     )}
                  </div>
               </div>
            </div>
          ))}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3">
             {reklamlar.map((_, i) => (
               <button key={i} onClick={() => setAktifSlider(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === aktifSlider ? 'bg-orange-500 w-16' : 'bg-white/30 w-4'}`} />
             ))}
          </div>
        </div>
      )}

      {/* SEARCH OVERLAY (PROFESYONEL ARAMA) */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">
         <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full relative">
               <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
               <input className="w-full pl-20 pr-10 py-7 bg-slate-50 rounded-[3rem] border-none font-bold text-xl placeholder:text-slate-300" placeholder="İlanlarda, bölgelerde veya plakada ara..." />
            </div>
            <button className="w-full md:w-auto px-16 py-7 bg-[#1e293b] text-white rounded-[3rem] font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-blue-900/20">İLANLARI BUL</button>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-20">
         <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-72 space-y-6">
               <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
                  <h3 className="font-black text-slate-800 text-xl mb-6 flex items-center gap-2"><Tag className="text-orange-500"/> Kategoriler</h3>
                  {/* Buraya mevcut Sidebar içeriğini kopyalayabilirsin */}
               </div>
            </aside>
            <div className="flex-1 space-y-6">
               {ilanlar.map(ilan => <IlanCard key={ilan.id} ilan={ilan} onDetay={onIlanDetay} />)}
            </div>
         </div>
      </main>

    </div>
  );
}
