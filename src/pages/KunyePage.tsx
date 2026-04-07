import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { SiteIcerigi } from '../lib/platformAyarlar';

type KunyePageProps = {
  onGoBack: () => void;
  siteAdi?: string;
  icerik?: SiteIcerigi['iletisim'];
};

const varsayilan = {
  site_adi: 'ilanhemen.com',
  adres: 'Saadetdere Mah Esenyurt / Istanbul',
  iletisim_mail: 'info@servisilanlari.com',
};

export default function KunyePage({ onGoBack, siteAdi, icerik }: KunyePageProps) {
  const metin = {
    site_adi: siteAdi || varsayilan.site_adi,
    adres: icerik?.adres || varsayilan.adres,
    iletisim_mail: icerik?.iletisim_mail || varsayilan.iletisim_mail,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">Kunye</h1>
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">Site Adi</span>
            <span className="text-gray-800">{metin.site_adi}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">Web Adresi</span>
            <span className="text-gray-800">{metin.site_adi}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">Kurulus Yili</span>
            <span className="text-gray-800">2025</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">Adres</span>
            <span className="text-gray-800">{metin.adres}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">Iletisim</span>
            <span className="text-gray-800">{metin.iletisim_mail}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="font-medium text-gray-600">Versiyon</span>
            <span className="text-gray-800">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
