import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import type { SiteIcerigi, SiteSSSMaddesi } from '../lib/platformAyarlar';

type SSSPageProps = {
  onGoBack: () => void;
  icerik?: SiteIcerigi['sss'];
};

const varsayilanSorular: SiteSSSMaddesi[] = [
  {
    soru: 'Nasil Uye Olunur?',
    cevap: 'Ana sayfanin sag ust kismindaki Uye Ol alanindan kayit formunu doldurarak kolayca uye olabilirsiniz.',
  },
  {
    soru: 'Uye Olmadan Ilan Verebilir Miyim?',
    cevap: 'Uye olmadan ilan veremezsiniz.',
  },
  {
    soru: 'Ilan vermek ucretli mi?',
    cevap: 'Tamamen ucretsizdir.',
  },
  {
    soru: 'Ilanlarim kac gun yayinda kalir?',
    cevap: 'Ilanlar varsayilan sure boyunca yayinda kalir. Sure bitince ilaniniz pasif olur ve panelden tekrar aktif edebilirsiniz.',
  },
  {
    soru: 'Uyelik iptali nasil yapilir?',
    cevap: 'Profilim sayfanizdan hesabinizi ve ilanlarinizi kalici olarak silebilirsiniz.',
  },
];

export default function SSSPage({ onGoBack, icerik }: SSSPageProps) {
  const [acik, setAcik] = useState<number | null>(null);

  const sorular = useMemo(() => {
    const liste = Array.isArray(icerik?.sorular)
      ? icerik!.sorular.filter((item) => String(item?.soru || '').trim() && String(item?.cevap || '').trim())
      : [];
    return liste.length > 0 ? liste : varsayilanSorular;
  }, [icerik]);

  const baslik = icerik?.baslik || 'Sikca Sorulan Sorular';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3c6e] mb-6 transition">
        <ArrowLeft size={16} />
        Geri Don
      </button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1a3c6e] mb-6">{baslik}</h1>
        <div className="flex flex-col gap-3">
          {sorular.map((item, index) => (
            <div key={`${item.soru}-${index}`} className="border border-gray-200 rounded-xl overflow-hidden">
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
