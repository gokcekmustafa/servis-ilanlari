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
        <p className="text-sm text-gray-400 mb-6">Son guncelleme: Nisan 2026</p>

        <div className="flex flex-col gap-6 text-gray-700 text-sm leading-relaxed">
          <div>
            <h2 className="font-bold text-gray-800 mb-2">1. Taraflar ve Kapsam</h2>
            <p>
              Bu kullanim kosullari, ilanhemen.com platformunu kullanan tum ziyaretci ve uyeler
              icin baglayicidir. Platforma erisen her kullanici, bu metni okudugunu, anladigini
              ve kosullari kabul ettigini beyan eder.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">2. Uyelik</h2>
            <p>
              Uyelik icin dogru, guncel ve kullaniciya ait bilgiler girilmelidir. Baskasina ait
              bilgi ile hesap acilmasi, sahte hesap olusturulmasi veya hesabin ucuncu kisilerle
              paylasilmasi yasaktir. Hesap guvenliginin korunmasi kullanicinin sorumlulugundadir.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">3. Ilan Icerigi ve Sorumluluk</h2>
            <p>
              Ilanlarda paylasilan her turlu bilgi, belge, fiyat, gorsel ve aciklamadan ilan
              sahibi sorumludur. Yaniltici, aldatci, hukuka aykiri, hakaret iceren veya ucuncu
              kisi haklarini ihlal eden icerik yayinlanamaz. Platform, uygun gormedigi icerikleri
              kaldirma veya sinirlama hakkini sakli tutar.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">4. Platformun Konumu</h2>
            <p>
              Platform, ilan verenler ile ilanlardan faydalanmak isteyen kullanicilar arasinda
              dijital bir bulusma alani saglar. Taraflar arasindaki sozlesmeler, odemeler,
              teslimatlar, tasima/servis operasyonlari ve dogabilecek ihtilaflarin dogrudan tarafi
              degildir.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">5. Yasakli Kullanimlar</h2>
            <p>
              Platformun hukuka aykiri amaclarla kullanilmasi, sistem guvenligini zedeleyecek
              islem yapilmasi, diger kullanicilarin verilerinin izinsiz toplanmasi, spam ve
              otomatik araclarla asiri istek gonderimi kesinlikle yasaktir.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">6. Fikri Mulkiyet</h2>
            <p>
              Platforma ait yazilim, tasarim, marka, logo ve diger tum iceriklerin fikri
              mulkiyet haklari platform isleticisine aittir. Yasal izin olmadan kopyalanamaz,
              cogaltilamaz, dagitilamaz veya ticari amacla kullanilamaz.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">7. Kisisel Veriler ve Gizlilik</h2>
            <p>
              Kullanicilara ait veriler, ilgili mevzuata uygun sekilde islenir ve korunur.
              Platform, teknik ve idari guvenlik onlemleri uygular; ancak internet ortamindaki
              iletimlerin tamamen risksiz oldugu garanti edilemez.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">8. Hesap Askiya Alma ve Sonlandirma</h2>
            <p>
              Kullanim kosullarina aykiri davranis tespit edilmesi halinde platform, onceden
              bildirim yapmaksizin ilgili hesabi gecici veya kalici olarak askiya alabilir, ilan
              yayinini durdurabilir veya hesabi sonlandirabilir.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">9. Sorumlulugun Sinirlandirilmasi</h2>
            <p>
              Platform, hizmetin kesintisiz veya hatasiz olacagini taahhut etmez. Teknik
              aksakliklar, ucuncu taraf hizmet kesintileri, veri kaybi veya dolayli zararlar dahil
              olmak uzere dogabilecek zararlardan, yasal olarak izin verilen olcude sorumlu
              tutulamaz.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 mb-2">10. Degisiklik ve Yururluk</h2>
            <p>
              Platform, bu kosullari zaman zaman guncelleyebilir. Guncel metin yayimlandigi andan
              itibaren yururluge girer. Kullanici, platformu kullanmaya devam ederek guncel kosullari
              kabul etmis sayilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
