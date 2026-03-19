import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const sorular = [
  {
    soru: 'Nasil Uye Olunur?',
    cevap: 'Ana sayfanin sag ust kismindaki "Uye Ol" ikonuna tikladiktan sonra gelen "UYE OL" formunu doldurarak kolayca uye olabilirsiniz.',
  },
  {
    soru: 'Uye Olmadan İlan Verebilir Miyim?',
    cevap: 'Uye olmadan ilan veremezsiniz.',
  },
  {
    soru: 'İlan vermek ucretli mi?',
    cevap: 'Tamamen ucretsizdir.',
  },
  {
    soru: 'İlanlarim kac gun yayinda kalir?',
    cevap: '7 gun yayinda kalir, ucretsiz olarak yayin suresini ilanlarim sayfasindan uzatabilirsiniz.',
  },
  {
    soru: 'Nasil banner verilir?',
    cevap: 'İletisim formundan veya info@servisilanlari.com adresine mail atarak fiyat listemizi size gondereceğiz.',
  },
  {
    soru: 'Uyelik iptali?',
    cevap: 'Profilim sayfanizdan "uyeligimi sil" butonu ile tum bilgileriniz ile verdiginiz tum ilanlari kalici olarak silebilirsiniz.',
  },
  {
    soru: 'Bireysel Tasimaci nedir?',
    cevap: 'Arac sahiplerini Bireysel Tasimaci olarak siniflandiriyoruz.',
  },
  {
    soru: 'Firma degisikligi yapabilir miyim?',
    cevap: 'Profilim sayfanizdan, Firma guncelleme adimlari ile firma degisikligi yapabilirsiniz. Onceki firmaniz adina verdiginiz tum ilanlar silinir.',
  },
];

export default function SSSPage({ onGoBack }: { onGoBack: () => void }) {
  const [acik, setAcik] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">Sikca Sorulan Sorular</h1>
        <div className="flex flex-col gap-3">
          {sorular.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setAcik(acik === index ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition"
              >
                {item.soru}
                {acik === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {acik === index && (
                <div className="px-5 py-4 text-sm text-gray-600 bg-gray-50 border-t border-gray-200">
                  {item.cevap}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
