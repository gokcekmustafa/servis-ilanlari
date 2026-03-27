import React, { useState, useEffect } from 'react';
import {
  getIller,
  getYakalar,
  getIlceler,
  getMahallelerByIlce,
} from '../data/locations';

export default function MainFilter() {
  const [selectedIl, setSelectedIl] = useState('');
  const [selectedYaka, setSelectedYaka] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [selectedMahalle, setSelectedMahalle] = useState('');

  const iller = getIller();
  const yakalar = selectedIl ? getYakalar(selectedIl) : [];
  const ilceler = selectedIl ? getIlceler(selectedIl, selectedYaka) : [];
  const mahalleler = selectedIlce
    ? getMahallelerByIlce(selectedIl, selectedIlce, selectedYaka)
    : [];

  const istanbulMu = selectedIl === 'İstanbul';

  // İl değişince alt seçimleri sıfırla
  useEffect(() => {
    setSelectedYaka('');
    setSelectedIlce('');
    setSelectedMahalle('');
  }, [selectedIl]);

  // Yaka değişince ilçe ve mahalleyi sıfırla
  useEffect(() => {
    setSelectedIlce('');
    setSelectedMahalle('');
  }, [selectedYaka]);

  // İlçe değişince mahalleyi sıfırla
  useEffect(() => {
    setSelectedMahalle('');
  }, [selectedIlce]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-100 relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

        {/* İl */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Şehir
          </label>
          <select
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={selectedIl}
            onChange={(e) => setSelectedIl(e.target.value)}
          >
            <option value="">Tüm Türkiye</option>
            {iller.map((il) => (
              <option key={il} value={il}>{il}</option>
            ))}
          </select>
        </div>

        {/* Yaka — sadece İstanbul */}
        {istanbulMu && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Yaka
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={selectedYaka}
              onChange={(e) => setSelectedYaka(e.target.value)}
            >
              <option value="">Tüm Yakalar</option>
              {yakalar.map((y) => (
                <option key={y.ad} value={y.ad}>{y.ad}</option>
              ))}
            </select>
          </div>
        )}

        {/* İlçe */}
        {selectedIl && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              İlçe
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={selectedIlce}
              onChange={(e) => setSelectedIlce(e.target.value)}
              disabled={istanbulMu && !selectedYaka}
            >
              <option value="">Tüm İlçeler</option>
              {ilceler.map((i) => (
                <option key={i.ad} value={i.ad}>{i.ad}</option>
              ))}
            </select>
          </div>
        )}

        {/* Mahalle — sadece ilçe seçilmişse ve mahalle varsa */}
        {selectedIlce && mahalleler.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Mahalle
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={selectedMahalle}
              onChange={(e) => setSelectedMahalle(e.target.value)}
            >
              <option value="">Tüm Mahalleler</option>
              {mahalleler.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
