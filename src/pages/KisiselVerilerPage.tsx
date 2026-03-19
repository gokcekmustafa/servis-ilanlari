import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function KisiselVerilerPage({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-2">Kisisel Verilerin Korunmasi</h1>
        <p className="text-sm text-gray-400 mb-6">KVKK Aydinlatma Metni — Son guncelleme: Ocak 2026</p>

        <div className="flex flex-col gap-6 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="font-bold text-gray-800 mb-2">1. Veri Sorumlusu</h2>
            <p>Servis İlanları platformu, 6698 sayili Kisisel Verilerin Korunmasi Kanunu kapsaminda veri sorumlusu sifatiyla hareket etmektedir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">2. Toplanan Veriler</h2>
            <p>Uyelik sirasinda telefon numarasi, ad soyad ve il bilgileri toplanmaktadir. Bu bilgiler platform hizmetlerinin sunulmasi amaciyla kullanilmaktadir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">3. Verilerin Kullanimi</h2>
            <p>Toplanan kisisel veriler; hizmetin saglanmasi, kullanici dogrulamasi ve platform guvenliginin korunmasi amaci disinda kullanilmaz ve ucuncu kisilerle paylasilmaz.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">4. Veri Guvenligi</h2>
            <p>Kullanici sifreleri sifrelenerek saklanmaktadir. Platform, kisisel verilerin guvenligini saglamak icin gerekli teknik onlemleri almaktadir.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">5. Haklariniz</h2>
            <p>KVKK kapsaminda; verilerinize erisim, duzeltme, silme ve itiraz haklarina sahipsiniz. Bu haklarinizi kullanmak icin info@servisilanlari.com adresine basvurabilirsiniz.</p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">6. Hesap Silme</h2>
            <p>Profilim sayfanizdan hesabinizi ve tum kisisel verilerinizi kalici olarak silebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
