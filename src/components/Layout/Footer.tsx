import React from 'react';
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolon 1 */}
          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">
              Araç Durumuna Göre
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  İşime Araç Arıyorum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Aracıma İş Arıyorum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Şöför Arıyorum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Şöförüm İş Arıyorum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Hostesim İş Arıyorum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Hostes Arıyorum
                </a>
              </li>
            </ul>
          </div>

          {/* Kolon 2 */}
          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">
              Hizmetlerimiz
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  Servis Aracına İş Arayanlar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Şoför Arayanlar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Otobüs Arayan Firmalar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Servis Hostesi Arayanlar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Öğrenci Servisi Araçları
                </a>
              </li>
            </ul>
          </div>

          {/* Kolon 3 */}
          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">
              Gizlilik ve Kullanım
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  Sözleşmeler ve Kurallar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Üyelik Sözleşmeleri
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Kullanım Koşulları
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Kişisel Verilerin Korunması
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Yardım
                </a>
              </li>
            </ul>
          </div>

          {/* Kolon 4 */}
          <div>
            <h3 className="font-bold text-orange-400 mb-4 uppercase text-sm">
              Kurumsal
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Nasıl İşliyor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Sıkça Sorulan Sorular
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  İletişim
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Künye
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Bar */}
        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
          © 2024 Taşımacı İlanları — Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
