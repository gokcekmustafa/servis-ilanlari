'use client';

import React, { useState, useEffect } from 'react';
import { locations } from '../data/locations'; 

export default function MainFilter() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [availableRegions, setAvailableRegions] = useState<{name: string, districts: string[]}[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    const cityData = locations.find(l => l.city === selectedCity);
    setAvailableRegions(cityData ? cityData.regions : []);
    setSelectedRegion('');
    setSelectedDistrict('');
  }, [selectedCity]);

  useEffect(() => {
    const regionData = availableRegions.find(r => r.name === selectedRegion);
    setAvailableDistricts(regionData ? regionData.districts : []);
    setSelectedDistrict('');
  }, [selectedRegion]);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 -mt-16 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">Şehir</label>
          <select className="p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">Tüm Şehirler</option>
            {locations.map(l => <option key={l.city} value={l.city}>{l.city}</option>)}
          </select>
        </div>
        <div className={`flex flex-col gap-2 ${!selectedCity && 'opacity-40'}`}>
          <label className="text-sm font-semibold text-gray-600">Bölge / Yaka</label>
          <select className="p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" disabled={!selectedCity} value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
            <option value="">Seçiniz</option>
            {availableRegions.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div className={`flex flex-col gap-2 ${!selectedRegion && 'opacity-40'}`}>
          <label className="text-sm font-semibold text-gray-600">İlçe</label>
          <select className="p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" disabled={!selectedRegion} value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            <option value="">Tüm İlçeler</option>
            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95">
          İlanları Ara
        </button>
      </div>
    </div>
  );
}
