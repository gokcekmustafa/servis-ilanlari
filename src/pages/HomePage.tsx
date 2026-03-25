import React from 'react';
import MainFilter from '../components/MainFilter';
import { Ilan } from '../types';

interface HomePageProps {
  onGoLogin: () => void;
  onIlanDetay: (ilan: Ilan) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGoLogin, onIlanDetay }) => {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-[#1a3c6e] pt-20 pb-40 px-4 text-center relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-600/30 text-blue-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/20">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Türkiye'nin En Büyük Taşımacılık Platformu
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Servis ve Taşımacılık <br />
            <span className="text-yellow-400">İlan Merkezi</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto opacity-80 leading-relaxed">
            Araç sahipleri ve firmalar burada buluşuyor. Güvenli, hızlı ve profesyonel çözüm ortağınız.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="px-4 -mt-12 md:-mt-16">
        <MainFilter />
      </div>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto mt-16 px-4 w-full text-center">
        <div className="py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
          <h3 className="text-xl font-bold text-gray-700 mb-2">Aramaya Başlayın</h3>
          <p className="text-gray-500">Yukarıdaki filtreleri kullanarak size en uygun ilanları listeleyebilirsiniz.</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
