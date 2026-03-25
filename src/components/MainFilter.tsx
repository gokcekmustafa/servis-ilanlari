'use client';

import React, { useState, useEffect } from 'react';
import { locations } from '../data/locations';

export default function MainFilter() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  const [availableSides, setAvailableSides] = useState<{name: string, districts: {name: string, neighborhoods: string[]}[]}[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<{name: string, neighborhoods: string[]}[]>([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);

  useEffect(() => {
    const cityData = locations.find(l => l.city === selectedCity);
    if (!cityData) return;

    if (selectedCity === "İstanbul") {
      setAvailableSides(cityData.sides || []);
      setSelectedSide('');
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    } else {
      setAvailableDistricts(cityData.districts || []);
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity === "İstanbul") {
      const sideData = availableSides.find(s => s.name === selectedSide);
      setAvailableDistricts(sideData ? sideData.districts : []);
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    }
  }, [selectedSide]);

  useEffect(() => {
    const districtData = availableDistricts.find(d => d.name === selectedDistrict);
    setAvailableNeighborhoods(districtData ? districtData.neighborhoods : []);
    setSelectedNeighborhood('');
  }, [selectedDistrict]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      {/* Şehir */}
      <div>
        <label>Şehir</label>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">Tüm Türkiye</option>
          {locations.map(l => <option key={l.city} value={l.city}>{l.city}</option>)}
        </select>
      </div>

      {/* Yaka (sadece İstanbul için) */}
      {selectedCity === "İstanbul" && (
        <div>
          <label>Yaka</label>
          <select value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
            <option value="">Seçiniz</option>
            {availableSides.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* İlçe */}
      <div>
        <label>İlçe</label>
        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
          <option value="">Tüm İlçeler</option>
          {availableDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {/* Mahalle */}
      <div>
        <label>Mahalle</label>
        <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)}>
          <option value="">Tüm Mahalleler</option>
          {availableNeighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
