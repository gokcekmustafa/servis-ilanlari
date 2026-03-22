import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  LogOut,
  HelpCircle,
  Edit,
  Save,
  X,
  Image,
  Bell,
  Plus,
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
  yetkiler: any;
}

const menuItems = [
  { id: 'ilanlar', label: 'Tum İlanlar', icon: FileText },
  { id: 'kullanicilar', label: 'Tum Kullanicilar', icon: Users },
  { id: 'reklamlar', label: 'Banner / Reklamlar', icon: Image },
  { id: 'duyurular', label: 'Popup Duyurular', icon: Bell },
  { id: 'destek', label: 'Destek Talepleri', icon: HelpCircle },
];

export default function AdminPage({ onLogout, onIlanDetay }: any) {
  const [activeMenu, setActiveMenu] = useState('ilanlar');
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Profile[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  // FORM STATE
  const [reklamForm, setReklamForm] = useState<any>({});
  const [duyuruForm, setDuyuruForm] = useState<any>({});
  const [reklamFile, setReklamFile] = useState<File | null>(null);
  const [duyuruFile, setDuyuruFile] = useState<File | null>(null);

  useEffect(() => {
    if (activeMenu === 'ilanlar') ilanYukle();
    if (activeMenu === 'kullanicilar') kullaniciYukle();
    if (activeMenu === 'destek') destekYukle();
    if (activeMenu === 'reklamlar') reklamYukle();
    if (activeMenu === 'duyurular') duyuruYukle();
  }, [activeMenu]);

  const ilanYukle = async () => {
    const { data } = await supabase.from('ilanlar').select('*');
    if (data) setIlanlar(data);
  };

  const kullaniciYukle = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setKullanicilar(data);
  };

  const destekYukle = async () => {
    const { data } = await destekTalepleriniGetir();
    if (data) setDestekler(data);
  };

  const reklamYukle = async () => {
    const { data } = await supabase.from('reklamlar').select('*').order('id', { ascending: false });
    if (data) setReklamlar(data);
  };

  const duyuruYukle = async () => {
    const { data } = await supabase.from('duyurular').select('*').order('id', { ascending: false });
    if (data) setDuyurular(data);
  };

  // 🔥 REKLAM EKLE
  const handleReklamEkle = async () => {
    let url = '';
    if (reklamFile) {
      const { data } = await supabase.storage.from('reklamlar').upload(`banner-${Date.now()}`, reklamFile);
      if (data) {
        const { data: urlData } = supabase.storage.from('reklamlar').getPublicUrl(data.path);
        url = urlData.publicUrl;
      }
    }

    await supabase.from('reklamlar').insert([{ ...reklamForm, resim_url: url, aktif: true }]);
    setReklamForm({});
    setReklamFile(null);
    reklamYukle();
  };

  // 🔥 DUYURU EKLE
  const handleDuyuruEkle = async () => {
    let url = '';
    if (duyuruFile) {
      const { data } = await supabase.storage.from('duyurular').upload(`duyuru-${Date.now()}`, duyuruFile);
      if (data) {
        const { data: urlData } = supabase.storage.from('duyurular').getPublicUrl(data.path);
        url = urlData.publicUrl;
      }
    }

    await supabase.from('duyurular').insert([{ ...duyuruForm, resim_url: url, aktif: true }]);
    setDuyuruForm({});
    setDuyuruFile(null);
    duyuruYukle();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">

        {/* SIDEBAR */}
        <aside className="w-64">
          <div className="bg-[#1a3c6e] text-white p-6 rounded-2xl text-center mb-4">
            Admin Panel
          </div>

          {menuItems.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMenu(m.id)}
              className="w-full text-left px-4 py-2 border-b hover:bg-gray-50"
            >
              {m.label}
            </button>
          ))}

          <button onClick={onLogout} className="text-red-500 mt-4">
            Çıkış
          </button>
        </aside>

        {/* CONTENT */}
        <div className="flex-1">

          {/* REKLAMLAR */}
          {activeMenu === 'reklamlar' && (
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="font-bold mb-4">Banner Ekle</h2>

              <input placeholder="Başlık"
                className="border p-2 w-full mb-2"
                onChange={(e) => setReklamForm({ ...reklamForm, baslik: e.target.value })} />

              <input placeholder="Alt Başlık"
                className="border p-2 w-full mb-2"
                onChange={(e) => setReklamForm({ ...reklamForm, alt_baslik: e.target.value })} />

              <input placeholder="Link"
                className="border p-2 w-full mb-2"
                onChange={(e) => setReklamForm({ ...reklamForm, link_url: e.target.value })} />

              <input type="file" onChange={(e) => setReklamFile(e.target.files?.[0] || null)} />

              <button onClick={handleReklamEkle} className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">
                Ekle
              </button>

              <div className="mt-6">
                {reklamlar.map((r) => (
                  <div key={r.id} className="flex gap-4 mb-3 border p-2 rounded">
                    <img src={r.resim_url} className="w-32 h-16 object-cover" />
                    <div>{r.baslik}</div>
                    <button onClick={async () => {
                      await supabase.from('reklamlar').update({ aktif: !r.aktif }).eq('id', r.id);
                      reklamYukle();
                    }}>
                      {r.aktif ? 'Pasif' : 'Aktif'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DUYURULAR */}
          {activeMenu === 'duyurular' && (
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="font-bold mb-4">Duyuru Ekle</h2>

              <input placeholder="Başlık"
                className="border p-2 w-full mb-2"
                onChange={(e) => setDuyuruForm({ ...duyuruForm, baslik: e.target.value })} />

              <input placeholder="Mesaj"
                className="border p-2 w-full mb-2"
                onChange={(e) => setDuyuruForm({ ...duyuruForm, mesaj: e.target.value })} />

              <input placeholder="Saniye"
                type="number"
                className="border p-2 w-full mb-2"
                onChange={(e) => setDuyuruForm({ ...duyuruForm, saniye: Number(e.target.value) })} />

              <input type="file" onChange={(e) => setDuyuruFile(e.target.files?.[0] || null)} />

              <button onClick={handleDuyuruEkle} className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">
                Ekle
              </button>

              <div className="mt-6">
                {duyurular.map((d) => (
                  <div key={d.id} className="border p-3 mb-2 rounded">
                    <p>{d.baslik}</p>
                    <button onClick={async () => {
                      await supabase.from('duyurular').update({ aktif: !d.aktif }).eq('id', d.id);
                      duyuruYukle();
                    }}>
                      {d.aktif ? 'Pasif' : 'Aktif'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
