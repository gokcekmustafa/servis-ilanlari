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
    <div className="w-full max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-100 relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Şehir */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Şehir Seçin</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Tüm Türkiye</option>
            {locations.map(l => <option key={l.city} value={l.city}>{l.city}</option>)}
          </select>
        </div>

        {/* Bölge / Yaka */}
        <div className={`flex flex-col gap-2 ${!selectedCity && 'opacity-40'}`}>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bölge / Yaka</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={!selectedCity}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">Seçiniz</option>
            {availableRegions.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </div>

        {/* İlçe */}
        <div className={`flex flex-col gap-2 ${!selectedRegion && 'opacity-40'}`}>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">İlçe</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={!selectedRegion}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">Tüm İlçeler</option>
            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Buton */}
        <button className="bg-[#1a3c6e] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          İlanları Ara
        </button>
      </div>
    </div>
  );
}
