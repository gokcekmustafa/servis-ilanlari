'use client';

import React, { useState, useEffect } from 'react';
import { locations, Side, NeighborhoodDistrict } from '../data/locations';

export default function MainFilter() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  const [availableSides, setAvailableSides] = useState<Side[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<NeighborhoodDistrict[]>([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);

  // Şehir seçildiğinde
  useEffect(() => {
    const cityData = locations.find(l => l.city === selectedCity);
    if (!cityData) return;

    if (selectedCity === "İstanbul") {
      setAvailableSides(cityData.sides || []);
      setAvailableDistricts([]);
      setAvailableNeighborhoods([]);
      setSelectedSide('');
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    } else {
      setAvailableDistricts(cityData.districts || []);
      setAvailableNeighborhoods([]);
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    }
  }, [selectedCity]);

  // İstanbul için yaka seçildiğinde
  useEffect(() => {
    if (selectedCity === "İstanbul") {
      const sideData = availableSides.find(s => s.name === selectedSide);
      setAvailableDistricts(sideData ? sideData.districts : []);
      setAvailableNeighborhoods([]);
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    }
  }, [selectedSide]);

  // İlçe seçildiğinde mahalleleri yükle
  useEffect(() => {
    const districtData = availableDistricts.find(d => d.name === selectedDistrict);
    setAvailableNeighborhoods(districtData ? districtData.neighborhoods : []);
    setSelectedNeighborhood('');
  }, [selectedDistrict]);

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

        {/* Yaka (sadece İstanbul için) */}
        {selectedCity === "İstanbul" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Yaka</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={selectedSide}
              onChange={(e) => setSelectedSide(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {availableSides.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* İlçe */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">İlçe</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={selectedCity === "İstanbul" && !selectedSide}
          >
            <option value="">Tüm İlçeler</option>
            {availableDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {/* Mahalle */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mahalle</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">Tüm Mahalleler</option>
            {availableNeighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
