import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HakkimizdaPage({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">Hakkimizda</h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          Servis İlanları, 2025 yılından beri öğrenci ve personel taşımacılığı yapan turizm şirketleri
          ile bireysel taşımacıları, şoförleri ve hostesleri buluşturan bu platform sektörün iş gücü
          ve araç tedariğini sağlamada önemli bir rol üstlendi.
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          Servis sektörüne ücretsiz olarak sunulan bu hizmete ilgi büyüdükçe platforma yapılan
          yazılım geliştirmelerle beraber Servis İlanları 2026 yılında tüm Türkiye'de hizmet
          vermeye başladı.
        </p>
        <p className="text-gray-700 font-medium">Saygılarımızla,</p>
        <p className="text-[#1a3c6e] font-bold mt-1">Servis İlanları Ekibi</p>
      </div>
    </div>
  );
}
