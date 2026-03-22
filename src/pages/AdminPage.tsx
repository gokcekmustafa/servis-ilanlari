import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ilan } from '../types';

type AdminPageProps = {
  onLogout: () => void;
  onIlanDetay: (ilan: Ilan) => void;
};

export default function AdminPage({ onLogout, onIlanDetay }: AdminPageProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [reklamlar, setReklamlar] = useState<any[]>([]);
  const [duyurular, setDuyurular] = useState<any[]>([]);
  const [newUser, setNewUser] = useState<any>({});
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: u } = await supabase.from('profiles').select('*');
    const { data: i } = await supabase.from('ilanlar').select('*');
    const { data: r } = await supabase.from('reklamlar').select('*');
    const { data: d } = await supabase.from('duyurular').select('*');

    setUsers(u || []);
    setIlanlar(i || []);
    setReklamlar(r || []);
    setDuyurular(d || []);
  };

  const hashPassword = async (pass: string) => {
    const enc = new TextEncoder().encode(pass + 'servis-ilanlari-salt');
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const updateUser = async () => {
    let update: any = { ...selectedUser };
    if (password) {
      update.password_hash = await hashPassword(password);
      update.sifre_acik = password;
    }
    await supabase.from('profiles').update(update).eq('id', selectedUser.id);
    setPassword('');
    loadAll();
  };

  const createUser = async () => {
    const hash = await hashPassword(newUser.password);
    await supabase.from('profiles').insert([{
      phone_number: newUser.phone,
      full_name: newUser.name,
      type: newUser.type || 'staff',
      sifre_acik: newUser.password,
      password_hash: hash,
      yetkiler: {
        ilan_sil: true,
        kullanici_sil: false,
      }
    }]);
    setNewUser({});
    loadAll();
  };

  const deleteDuyuru = async (id: string) => {
    await supabase.from('duyurular').delete().eq('id', id);
    loadAll();
  };

  const toggleDuyuru = async (d: any) => {
    await supabase.from('duyurular')
      .update({ aktif: !d.aktif })
      .eq('id', d.id);
    loadAll();
  };

  return (
    <div className="p-6 grid grid-cols-3 gap-6">

      <div>
        <h2 className="font-bold mb-2">Kullanicilar</h2>
        {users.map(u => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className="p-2 border mb-2 cursor-pointer"
          >
            {u.full_name} - {u.phone_number}
          </div>
        ))}
      </div>

      <div>
        {selectedUser && (
          <div className="border p-4">
            <h3 className="font-bold">{selectedUser.full_name}</h3>
            <p>Telefon: {selectedUser.phone_number}</p>
            <p>Sifre: {selectedUser.sifre_acik}</p>
            <input
              placeholder="Yeni sifre"
              onChange={e => setPassword(e.target.value)}
              className="border p-2 w-full mt-2"
            />
            <button onClick={updateUser} className="bg-blue-500 text-white p-2 mt-2">
              Kaydet
            </button>
          </div>
        )}
      </div>

      <div>
        <h2>Personel Ekle</h2>
        <input placeholder="Ad" onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
        <input placeholder="Telefon" onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
        <input placeholder="Sifre" onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
        <select onChange={e => setNewUser({ ...newUser, type: e.target.value })}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={createUser} className="bg-green-500 text-white p-2 mt-2">
          Olustur
        </button>
      </div>

      <div className="col-span-3 mt-6">
        <h2 className="font-bold mb-2">Duyurular</h2>
        {duyurular.map(d => (
          <div key={d.id} className="border p-2 mb-2 flex justify-between">
            <div>{d.baslik}</div>
            <div className="flex gap-2">
              <button onClick={() => toggleDuyuru(d)}>
                {d.aktif ? 'Pasif' : 'Aktif'}
              </button>
              <button onClick={() => deleteDuyuru(d.id)} className="text-red-500">
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="col-span-3 mt-4">
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cikis Yap
        </button>
      </div>

    </div>
  );
}
