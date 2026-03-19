import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function KullanimKosullariPage({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-2">Kullanim Kosullari</h1>
        <p className="text-sm text-gray-400 mb-6">Son guncelleme: Ocak 2026</p>

        <div className="flex flex-col gap-6 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="font-bold text-gray-800 mb-2">1. Hizmetin Kullanimi</h2>
            <p>Servis İlanları platformunu kullanan tum kullanicilar bu kosullari kabul etmis sayilir. Platform yalnizca yasal amaclar dogrultusunda kullanilabilir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">2. Uyelik</h2>
            <p>Platforma uye olmak icin gecerli bir telefon numarasi gerekmektedir. Her telefon numarasi ile yalnizca bir hesap acilabilir. Yanlis veya baskasina ait bilgilerle kayit olmak yasaktir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">3. İlan Kurallari</h2>
            <p>Verilen ilanlar gercek ve guncel olmalidir. Yaniltici, aldatici veya hukuka aykiri ilanlar yayinlanamaz. Platform, uygunsuz ilanlari onceden haber vermeksizin kaldirma hakkini sakli tutar.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">4. Ucretsiz Hizmet</h2>
            <p>Platform temel ilan hizmetlerini ucretsiz sunmaktadir. Ozel reklamcilik ve banner hizmetleri ucrete tabi olabilir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">5. Sorumluluk Siniri</h2>
            <p>Servis İlanları, kullanicilar arasindaki anlasmazliklardan sorumlu degildir. İlan verenler ve arayanlar arasindaki tum gorusmeler taraflarin sorumlulugundadir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">6. Degisiklik Hakki</h2>
            <p>Platform, kullanim kosullarini onceden haber vermeksizin degistirme hakkini sakli tutar. Degisiklikler sitede yayinlandigi andan itibaren gecerli olur.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
