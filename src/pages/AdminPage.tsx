import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Trash2,
  Eye,
  LogOut,
  Image,
  Bell,
  Plus,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';

export default function AdminPage({ onLogout, onIlanDetay }: any) {
  const [activeMenu, setActiveMenu] = useState('ilanlar');

  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);

  const [reklamForm, setReklamForm] = useState<any>({});
  const [duyuruForm, setDuyuruForm] = useState<any>({});
  const [reklamFile, setReklamFile] = useState<File | null>(null);
  const [duyuruFile, setDuyuruFile] = useState<File | null>(null);

  // 🔥 DATA LOAD FIX
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: ilanData } = await supabase
      .from('ilanlar')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: reklamData } = await supabase
      .from('reklamlar')
      .select('*')
      .order('id', { ascending: false });

    const { data: duyuruData } = await supabase
      .from('duyurular')
      .select('*')
      .order('id', { ascending: false });

    setIlanlar(ilanData || []);
    setKullanicilar(userData || []);
    setReklamlar(reklamData || []);
    setDuyurular(duyuruData || []);
  };

  // 🔥 STORAGE FIX
  const uploadFile = async (bucket: string, file: File) => {
    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error(error);
      return '';
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  // 🔥 REKLAM EKLE
  const handleReklamEkle = async () => {
    let url = '';

    if (reklamFile) {
      url = await uploadFile('reklamlar', reklamFile);
    }

    await supabase.from('reklamlar').insert([
      { ...reklamForm, resim_url: url, aktif: true },
    ]);

    setReklamForm({});
    setReklamFile(null);
    loadAll();
  };

  // 🔥 DUYURU EKLE
  const handleDuyuruEkle = async () => {
    let url = '';

    if (duyuruFile) {
      url = await uploadFile('duyurular', duyuruFile);
    }

    await supabase.from('duyurular').insert([
      { ...duyuruForm, resim_url: url, aktif: true },
    ]);

    setDuyuruForm({});
    setDuyuruFile(null);
    loadAll();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h2 className="text-xl font-bold mb-6 text-[#1a3c6e]">Admin Panel</h2>

        {[
          { id: 'ilanlar', label: 'İlanlar', icon: FileText },
          { id: 'kullanicilar', label: 'Kullanıcılar', icon: Users },
          { id: 'reklamlar', label: 'Banner', icon: Image },
          { id: 'duyurular', label: 'Duyuru', icon: Bell },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`flex items-center gap-2 w-full p-3 rounded-lg mb-2 ${
              activeMenu === item.id
                ? 'bg-[#1a3c6e] text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}

        <button
          onClick={onLogout}
          className="mt-6 text-red-500 flex items-center gap-2"
        >
          <LogOut size={16} /> Çıkış
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6">

        {/* İLANLAR */}
        {activeMenu === 'ilanlar' && (
          <div className="grid gap-4">
            {ilanlar.map((ilan) => (
              <div
                key={ilan.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between"
              >
                <div>
                  <p className="font-bold">{ilan.kategori}</p>
                  <p className="text-sm text-gray-500">
                    {ilan.aciklama}
                  </p>
                </div>

                <button onClick={() => onIlanDetay(ilan)}>
                  <Eye />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* KULLANICILAR */}
        {activeMenu === 'kullanicilar' && (
          <div className="grid gap-4">
            {kullanicilar.map((k) => (
              <div key={k.id} className="bg-white p-4 rounded-xl shadow">
                <p className="font-bold">{k.full_name}</p>
                <p className="text-sm text-gray-500">{k.phone_number}</p>
              </div>
            ))}
          </div>
        )}

        {/* REKLAMLAR */}
        {activeMenu === 'reklamlar' && (
          <div>
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <h3 className="font-bold mb-2">Banner Ekle</h3>

              <input
                placeholder="Başlık"
                className="border p-2 w-full mb-2"
                onChange={(e) =>
                  setReklamForm({ ...reklamForm, baslik: e.target.value })
                }
              />

              <input
                placeholder="Link"
                className="border p-2 w-full mb-2"
                onChange={(e) =>
                  setReklamForm({ ...reklamForm, link_url: e.target.value })
                }
              />

              <input
                type="file"
                onChange={(e) =>
                  setReklamFile(e.target.files?.[0] || null)
                }
              />

              {/* 🔥 PREVIEW FIX */}
              {reklamFile && (
                <img
                  src={URL.createObjectURL(reklamFile)}
                  className="h-32 mt-2 rounded"
                />
              )}

              <button
                onClick={handleReklamEkle}
                className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
              >
                Ekle
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {reklamlar.map((r) => (
                <div key={r.id} className="bg-white p-3 rounded-xl shadow">
                  {r.resim_url && (
                    <img
                      src={r.resim_url}
                      className="h-32 w-full object-cover rounded"
                    />
                  )}
                  <p className="mt-2">{r.baslik}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DUYURULAR */}
        {activeMenu === 'duyurular' && (
          <div>
            <div className="bg-white p-4 rounded-xl shadow mb-4">
              <h3 className="font-bold mb-2">Duyuru Ekle</h3>

              <input
                placeholder="Başlık"
                className="border p-2 w-full mb-2"
                onChange={(e) =>
                  setDuyuruForm({ ...duyuruForm, baslik: e.target.value })
                }
              />

              <input
                placeholder="Mesaj"
                className="border p-2 w-full mb-2"
                onChange={(e) =>
                  setDuyuruForm({ ...duyuruForm, mesaj: e.target.value })
                }
              />

              <input
                type="file"
                onChange={(e) =>
                  setDuyuruFile(e.target.files?.[0] || null)
                }
              />

              {duyuruFile && (
                <img
                  src={URL.createObjectURL(duyuruFile)}
                  className="h-32 mt-2 rounded"
                />
              )}

              <button
                onClick={handleDuyuruEkle}
                className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
              >
                Ekle
              </button>
            </div>

            {duyurular.map((d) => (
              <div key={d.id} className="bg-white p-3 rounded-xl shadow mb-2">
                <p>{d.baslik}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
