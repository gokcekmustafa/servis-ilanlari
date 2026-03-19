import React from 'react';
import { ArrowLeft, UserPlus, FileText, Phone } from 'lucide-react';

export default function NasilIsliyorPage({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">Nasil İsliyor</h1>
        <p className="text-gray-700 leading-relaxed mb-8">
          Kolay bir sekilde telefon numaranizla kaydolarak hemen ucretsiz ilan vermeye baslayabilirsiniz.
        </p>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-[#1a3c6e] rounded-full flex items-center justify-center flex-shrink-0">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">1. Uye Ol</h3>
              <p className="text-sm text-gray-600">Telefon numaraniz ve sifrenizle saniyeler icinde ucretsiz kayit olun.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
            <div className="w-10 h-10 bg-[#f97316] rounded-full flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">2. İlan Ver</h3>
              <p className="text-sm text-gray-600">Arac, sofor veya hostes ilaninizi ucretsiz olarak yayinlayin.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">3. İletisime Gec</h3>
              <p className="text-sm text-gray-600">İlgilendiginiz ilanin sahibiyle dogrudan iletisime gecin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
