import React from 'react';
import { ArrowLeft, UserPlus, FileText, Phone } from 'lucide-react';
import type { SiteIcerigi } from '../lib/platformAyarlar';

type NasilIsliyorPageProps = {
  onGoBack: () => void;
  icerik?: SiteIcerigi['nasil_isliyor'];
};

const varsayilan = {
  baslik: 'Nasil Isliyor',
  aciklama: 'Kolay bir sekilde telefon numaranizla kaydolarak hemen ucretsiz ilan vermeye baslayabilirsiniz.',
  adim_1_baslik: '1. Uye Ol',
  adim_1_aciklama: 'Telefon numaraniz ve sifrenizle saniyeler icinde ucretsiz kayit olun.',
  adim_2_baslik: '2. Ilan Ver',
  adim_2_aciklama: 'Arac, sofor veya hostes ilaninizi ucretsiz olarak yayinlayin.',
  adim_3_baslik: '3. Iletisime Gec',
  adim_3_aciklama: 'Ilgilendiginiz ilanin sahibiyle dogrudan iletisime gecin.',
};

export default function NasilIsliyorPage({ onGoBack, icerik }: NasilIsliyorPageProps) {
  const metin = {
    baslik: icerik?.baslik || varsayilan.baslik,
    aciklama: icerik?.aciklama || varsayilan.aciklama,
    adim_1_baslik: icerik?.adim_1_baslik || varsayilan.adim_1_baslik,
    adim_1_aciklama: icerik?.adim_1_aciklama || varsayilan.adim_1_aciklama,
    adim_2_baslik: icerik?.adim_2_baslik || varsayilan.adim_2_baslik,
    adim_2_aciklama: icerik?.adim_2_aciklama || varsayilan.adim_2_aciklama,
    adim_3_baslik: icerik?.adim_3_baslik || varsayilan.adim_3_baslik,
    adim_3_aciklama: icerik?.adim_3_aciklama || varsayilan.adim_3_aciklama,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">{metin.baslik}</h1>
        <p className="text-gray-700 leading-relaxed mb-8">{metin.aciklama}</p>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-[#1a3c6e] rounded-full flex items-center justify-center flex-shrink-0">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{metin.adim_1_baslik}</h3>
              <p className="text-sm text-gray-600">{metin.adim_1_aciklama}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
            <div className="w-10 h-10 bg-[#f97316] rounded-full flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{metin.adim_2_baslik}</h3>
              <p className="text-sm text-gray-600">{metin.adim_2_aciklama}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{metin.adim_3_baslik}</h3>
              <p className="text-sm text-gray-600">{metin.adim_3_aciklama}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
