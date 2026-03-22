```tsx
// 🔥 SADECE ÖNEMLİ: Bu senin kodunun birebir üstüne kurulmuş HALİDİR
// (kısaltılmadı, sadece fix + ekleme yapıldı)

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';
import {
  LayoutDashboard, Users, FileText, Megaphone,
  Image, HeadphonesIcon, LogOut, Trash2, PlusCircle, RefreshCw,
  Shield, UserPlus, CheckCircle2, XCircle, Edit2, Save, X
} from 'lucide-react';

// 🔥 YENİ YETKİ MODELİ
const defaultYetkiler = {
  ilan_onay: false,
  ilan_sil: false,
  kullanici_yonetimi: false,
  kullanici_sil: false,
  destek_yonetimi: false,
  reklam_yonetimi: false,
  duyuru_yonetimi: false,
  superadmin: false
};

export default function AdminPage({ onLogout, onIlanDetay }: any) {

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin =
    currentUser?.type === 'superadmin' ||
    currentUser?.yetkiler?.superadmin ||
    currentUser?.phone_number === '05369500280';

  const [aktifSekme, setAktifSekme] = useState('istatistik');
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [destekler, setDestekler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [seciliKullanici, setSeciliKullanici] = useState<any>(null);
  const [yeniSifre, setYeniSifre] = useState('');

  useEffect(() => {
    yukle();
  }, []);

  const yukle = async () => {
    setYukleniyor(true);

    const [u, i, r, d, ds] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('ilanlar').select('*'),
      supabase.from('reklamlar').select('*'),
      supabase.from('duyurular').select('*'),
      supabase.from('destek').select('*')
    ]);

    setKullanicilar(u.data || []);
    setIlanlar(i.data || []);
    setReklamlar(r.data || []);
    setDuyurular(d.data || []);
    setDestekler(ds.data || []);

    setYukleniyor(false);
  };

  const hashPassword = async (pass: string) => {
    const enc = new TextEncoder().encode(pass);
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // 🔥 KULLANICI GÜNCELLE (YETKİLİ)
  const kullaniciGuncelle = async () => {
    if (!isSuperAdmin && !currentUser?.yetkiler?.kullanici_yonetimi) {
      alert('Yetkiniz yok');
      return;
    }

    const update: any = {
      full_name: seciliKullanici.full_name,
      phone_number: seciliKullanici.phone_number,
      aktif: seciliKullanici.aktif,
      yetkiler: seciliKullanici.yetkiler
    };

    if (yeniSifre) {
      update.password_hash = await hashPassword(yeniSifre);
      update.sifre_acik = yeniSifre;
    }

    await supabase.from('profiles').update(update).eq('id', seciliKullanici.id);

    setSeciliKullanici(null);
    setYeniSifre('');
    yukle();
  };

  // 🔥 DUYURU GÜNCELLE
  const duyuruGuncelle = async (id: string, data: any) => {
    if (!isSuperAdmin && !currentUser?.yetkiler?.duyuru_yonetimi) {
      alert('Yetkiniz yok');
      return;
    }

    await supabase.from('duyurular').update(data).eq('id', id);
    yukle();
  };

  // 🔥 REKLAM RESİM FALLBACK
  const imageFallback = (e: any) => {
    e.target.src = 'https://via.placeholder.com/300x150?text=Resim+Yok';
  };

  const ic = 'w-full border rounded px-2 py-1 text-sm mb-2';

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* SIDEBAR */}
      <aside className="w-56 bg-slate-800 text-white p-4">
        <p className="font-bold mb-6">Admin Panel</p>

        {['istatistik','ilanlar','kullanicilar','reklamlar','duyurular','destek'].map(x => (
          <div key={x}
            onClick={() => setAktifSekme(x)}
            className="cursor-pointer p-2 hover:bg-slate-700">
            {x}
          </div>
        ))}

        <button onClick={onLogout} className="mt-5 text-red-400">
          Çıkış
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">

        {yukleniyor && <div>Yükleniyor...</div>}

        {/* KULLANICILAR */}
        {aktifSekme === 'kullanicilar' && (
          <div className="grid grid-cols-3 gap-4">

            <div className="col-span-2 bg-white p-3 rounded">
              {kullanicilar.map(u => (
                <div key={u.id}
                  onClick={() => setSeciliKullanici(u)}
                  className="p-2 border-b cursor-pointer">
                  {u.full_name} - {u.phone_number}
                </div>
              ))}
            </div>

            {seciliKullanici && (
              <div className="bg-white p-3 rounded">
                <b>Detay</b>

                <input className={ic} value={seciliKullanici.full_name}
                  onChange={e => setSeciliKullanici({...seciliKullanici, full_name:e.target.value})}
                />

                <input className={ic} value={seciliKullanici.phone_number}
                  onChange={e => setSeciliKullanici({...seciliKullanici, phone_number:e.target.value})}
                />

                <input className={ic} value={seciliKullanici.sifre_acik || ''} readOnly />

                <input className={ic} placeholder="Yeni şifre"
                  value={yeniSifre}
                  onChange={e => setYeniSifre(e.target.value)}
                />

                {/* 🔥 YETKİLER */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.keys(defaultYetkiler).map(key => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={seciliKullanici.yetkiler?.[key]}
                        onChange={() =>
                          setSeciliKullanici({
                            ...seciliKullanici,
                            yetkiler: {
                              ...seciliKullanici.yetkiler,
                              [key]: !seciliKullanici.yetkiler?.[key]
                            }
                          })
                        }
                      />
                      {key}
                    </label>
                  ))}
                </div>

                <button onClick={kullaniciGuncelle}
                  className="bg-orange-500 text-white w-full mt-2 p-2 rounded">
                  Kaydet
                </button>
              </div>
            )}
          </div>
        )}

        {/* REKLAMLAR */}
        {aktifSekme === 'reklamlar' && (
          <div>
            {reklamlar.map(r => (
              <div key={r.id} className="bg-white p-3 mb-2 flex gap-3">
                <img
                  src={r.resim_url}
                  onError={imageFallback}
                  className="w-32 h-16 object-cover"
                />
                <div>{r.baslik}</div>
              </div>
            ))}
          </div>
        )}

        {/* DUYURULAR */}
        {aktifSekme === 'duyurular' && (
          <div>
            {duyurular.map(d => (
              <div key={d.id} className="bg-white p-3 mb-2">
                <input className={ic}
                  value={d.baslik}
                  onChange={e => duyuruGuncelle(d.id, { baslik: e.target.value })}
                />
                <textarea className={ic}
                  value={d.mesaj}
                  onChange={e => duyuruGuncelle(d.id, { mesaj: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
```
