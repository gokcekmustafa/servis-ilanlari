import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { SiteIcerigi } from '../lib/platformAyarlar';

type HakkimizdaPageProps = {
  onGoBack: () => void;
  icerik?: SiteIcerigi['hakkimizda'];
};

const varsayilan = {
  baslik: 'Hakkimizda',
  paragraf_1: 'Servis Ilanlari, 2025 yilindan beri ogrenci ve personel tasimaciligi yapan turizm sirketleri ile bireysel tasimacilari, soforleri ve hostesleri bulusturan bu platform sektorun is gucu ve arac tedarigini saglamada onemli bir rol ustlendi.',
  paragraf_2: 'Servis sektorune ucretsiz olarak sunulan bu hizmete ilgi buyudukce platforma yapilan yazilim gelistirmelerle beraber Servis Ilanlari 2026 yilinda tum Turkiye\'de hizmet vermeye basladi.',
  imza_ust: 'Saygilarimizla,',
  imza_alt: 'Servis Ilanlari Ekibi',
};

export default function HakkimizdaPage({ onGoBack, icerik }: HakkimizdaPageProps) {
  const metin = {
    baslik: icerik?.baslik || varsayilan.baslik,
    paragraf_1: icerik?.paragraf_1 || varsayilan.paragraf_1,
    paragraf_2: icerik?.paragraf_2 || varsayilan.paragraf_2,
    imza_ust: icerik?.imza_ust || varsayilan.imza_ust,
    imza_alt: icerik?.imza_alt || varsayilan.imza_alt,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">{metin.baslik}</h1>
        <p className="text-gray-700 leading-relaxed mb-4">{metin.paragraf_1}</p>
        <p className="text-gray-700 leading-relaxed mb-6">{metin.paragraf_2}</p>
        <p className="text-gray-700 font-medium">{metin.imza_ust}</p>
        <p className="text-[#1a3c6e] font-bold mt-1">{metin.imza_alt}</p>
      </div>
    </div>
  );
}
