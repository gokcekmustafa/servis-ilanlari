'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Phone } from 'lucide-react';

export default function PublicHeader() {
  const [menuAcik, setMenuAcik] = useState(false);

  return (
    <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/ana-sayfa-ve-lan-listesi" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <AppLogo size={36} />
            <div className="hidden sm:block">
              <span className="font-bold text-lg leading-none block">TaşımacıPlatform</span>
              <span className="text-blue-300 text-xs">Türkiye&apos;nin Taşımacılık İlan Platformu</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/ana-sayfa-ve-lan-listesi" className="hover:text-amber-400 transition-colors">
              İlanlar
            </Link>
            <Link href="/ana-sayfa-ve-lan-listesi" className="hover:text-amber-400 transition-colors">
              Araç Ara
            </Link>
            <Link href="/ana-sayfa-ve-lan-listesi" className="hover:text-amber-400 transition-colors">
              İş Ara
            </Link>
            <Link href="/ana-sayfa-ve-lan-listesi" className="hover:text-amber-400 transition-colors">
              Şoför İlanları
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="tel:08501234567"
              className="hidden lg:flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors"
            >
              <Phone size={15} />
              <span>0850 123 45 67</span>
            </a>
            <Link
              href="/kullan-c-kay-t-giri"
              className="hidden sm:block text-sm font-medium text-blue-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-all"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kullan-c-kay-t-giri"
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-all active:scale-95"
            >
              İlan Ver
            </Link>
            <button
              onClick={() => setMenuAcik(!menuAcik)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-800 transition-colors"
              aria-label="Menüyü aç/kapat"
            >
              {menuAcik ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuAcik && (
        <div className="md:hidden bg-blue-950 border-t border-blue-800 animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {[
              { href: '/ana-sayfa-ve-lan-listesi', label: 'Tüm İlanlar' },
              { href: '/ana-sayfa-ve-lan-listesi', label: 'Araç Ara' },
              { href: '/ana-sayfa-ve-lan-listesi', label: 'İş Ara' },
              { href: '/ana-sayfa-ve-lan-listesi', label: 'Şoför İlanları' },
              { href: '/kullan-c-kay-t-giri', label: 'Giriş Yap' },
              { href: '/admin-y-netim-paneli', label: 'Admin Paneli' },
            ]?.map(item => (
              <Link
                key={`mobile-nav-${item?.label}`}
                href={item?.href}
                onClick={() => setMenuAcik(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
              >
                {item?.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
