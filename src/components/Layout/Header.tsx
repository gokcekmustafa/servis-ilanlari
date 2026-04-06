import React, { useEffect, useRef, useState } from 'react';
import { Truck, LogOut, LayoutDashboard, Bell, Menu, X } from 'lucide-react';
import { kullaniciSayisi } from '../../lib/auth';
import { okunmamisMesajSayisi, okunmamisDestekSayisi } from '../../lib/ilanlar';
import { mevcutKullanici } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type HeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onGoNotifications: () => void;
  onLogout: () => void;
  onIlanEkle: () => void;
  onGoPanel: () => void;
  onNavigate: (page: any) => void;
};

type HeaderBildirim = {
  id: string;
  tip: 'mesaj' | 'destek';
  baslik: string;
  aciklama: string;
  createdAt: string;
  conversationId?: string;
  destekId?: string;
};

export default function Header({
  isLoggedIn, isAdmin, onGoLogin, onGoRegister, onGoNotifications, onLogout, onIlanEkle, onGoPanel, onNavigate,
}: HeaderProps) {
  const [sayi, setSayi] = useState<number | null>(null);
  const [okunmamis, setOkunmamis] = useState(0);
  const [bekleyenDestek, setBekleyenDestek] = useState(0);
  const [bildirimAcik, setBildirimAcik] = useState(false);
  const [bildirimYukleniyor, setBildirimYukleniyor] = useState(false);
  const [bildirimler, setBildirimler] = useState<HeaderBildirim[]>([]);
  const [menuAcik, setMenuAcik] = useState(false);
  const [headerReklam, setHeaderReklam] = useState<any>(null);
  const [platformLogo, setPlatformLogo] = useState<string>('');
  const bildirimPanelRef = useRef<HTMLDivElement>(null);

  const bildirimleriYukle = () => {
    if (!isLoggedIn) return;
    const user = mevcutKullanici();
    if (!user) return;

    if (isAdmin) {
      setOkunmamis(0);
      okunmamisDestekSayisi().then(({ count }) => { setBekleyenDestek(count ?? 0); });
      return;
    }

    setBekleyenDestek(0);
    okunmamisMesajSayisi(user.id).then(({ count }) => { setOkunmamis(count ?? 0); });
  };

  useEffect(() => {
  kullaniciSayisi().then(({ count }) => { if (count !== null) setSayi(count); });
  headerReklamYukle();
  platformLogoYukle();
}, []);

  useEffect(() => {
    bildirimleriYukle();
    const interval = setInterval(bildirimleriYukle, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    const handleBildirimDegisti = () => {
      bildirimleriYukle();
    };
    window.addEventListener('bildirimler:degisti', handleBildirimDegisti);
    return () => window.removeEventListener('bildirimler:degisti', handleBildirimDegisti);
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    document.body.style.overflow = menuAcik ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuAcik]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const hedef = event.target as HTMLElement | null;
      if (hedef?.closest('[data-bildirim-toggle="true"]')) return;
      if (bildirimPanelRef.current && !bildirimPanelRef.current.contains(event.target as Node)) {
        setBildirimAcik(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerReklamYukle = async () => {
    const { data } = await supabase.from('reklamlar').select('*').eq('aktif', true).eq('konum', 'header').limit(1).single();
    if (data) setHeaderReklam(data);
  };

  const platformLogoYukle = async () => {
  const { data } = await supabase.from('ayarlar').select('deger').eq('anahtar', 'platform_logo').single();
  if (data?.deger) setPlatformLogo(data.deger);
};

  const bildirimleriDetayliYukle = async () => {
    if (!isLoggedIn) return;
    const user = mevcutKullanici();
    if (!user) return;

    setBildirimYukleniyor(true);

    if (isAdmin) {
      const { data } = await supabase
        .from('destek')
        .select('id, konu, mesaj, created_at, profiles(full_name, phone_number)')
        .eq('durum', 'bekliyor')
        .order('created_at', { ascending: false })
        .limit(8);

      const adminBildirimleri: HeaderBildirim[] = (data || []).map((d: any) => ({
        id: `destek-${d.id}`,
        tip: 'destek',
        baslik: d.konu || 'Destek talebi',
        aciklama: d.profiles?.full_name || d.profiles?.phone_number || (d.mesaj || '').slice(0, 90),
        createdAt: d.created_at,
        destekId: d.id,
      }));
      setBildirimler(adminBildirimleri);
      setBildirimYukleniyor(false);
      return;
    }

    const { data } = await supabase
      .from('mesajlar')
      .select(`
        id,
        mesaj,
        created_at,
        conversation_id,
        gonderen_id,
        alan_id,
        ilanlar(aciklama),
        gonderen:profiles!gonderen_id(full_name, phone_number)
      `)
      .eq('alan_id', user.id)
      .eq('okundu', false)
      .order('created_at', { ascending: false })
      .limit(8);

    const kullaniciBildirimleri: HeaderBildirim[] = (data || []).map((m: any) => ({
      id: `mesaj-${m.id}`,
      tip: 'mesaj',
      baslik: m.ilanlar?.aciklama ? `Mesaj: ${m.ilanlar.aciklama}` : 'Yeni mesaj',
      aciklama: `${m.gonderen?.full_name || m.gonderen?.phone_number || 'Kullanıcı'}: ${(m.mesaj || '').slice(0, 90)}`,
      createdAt: m.created_at,
      conversationId: m.conversation_id || [m.gonderen_id, m.alan_id].sort().join('_'),
    }));
    setBildirimler(kullaniciBildirimleri);
    setBildirimYukleniyor(false);
  };

  const bildirimeGit = (bildirim: HeaderBildirim) => {
    if (bildirim.tip === 'mesaj') {
      sessionStorage.setItem('panel_aktif_sekme', 'mesajlar');
      if (bildirim.conversationId) {
        sessionStorage.setItem('panel_secili_konusma', bildirim.conversationId);
      }
    } else if (bildirim.tip === 'destek') {
      sessionStorage.setItem('admin_aktif_sekme', 'destek');
      if (bildirim.destekId) {
        sessionStorage.setItem('admin_secili_destek', bildirim.destekId);
      }
    }

    setBildirimAcik(false);
    onGoNotifications();
  };

  const handleZilTikla = () => {
    const yeniDurum = !bildirimAcik;
    setBildirimAcik(yeniDurum);
    if (yeniDurum) {
      bildirimleriDetayliYukle();
    }
  };

  const toplamBildirim = isAdmin ? bekleyenDestek : okunmamis;
  const bildirimPaneliBaslik = isAdmin ? 'Yeni Destek Talepleri' : 'Yeni Mesajlar';
  const bildirimPaneliYonlendirmeMetni = isAdmin ? 'Destek Taleplerine Git' : 'Mesajlara Git';

  const navLinks = [
    { label: 'Anasayfa', page: 'home' },
    { label: 'Hakkımızda', page: 'hakkimizda' },
    { label: 'Nasıl İşliyor', page: 'nasil-isliyor' },
    { label: 'S.S.S', page: 'sss' },
    { label: 'İletişim', page: 'iletisim' },
  ];

  return (
    <header className="bg-slate-100 pt-3 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto relative">

        {/* 1. ÜST ŞERİT */}
        <div className="bg-slate-600 rounded-t-lg px-3 sm:px-4 py-1.5 flex items-center gap-2">
          <span className="text-slate-300 text-xs truncate flex-shrink-0">
            Kayıtlı Kişi:{' '}
            <span className="text-white font-bold">
              {sayi !== null ? sayi.toLocaleString('tr-TR') : '...'}
            </span>
          </span>

          <div className="flex-1 flex justify-end pr-2">
            <button
              onClick={onIlanEkle}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded transition whitespace-nowrap"
            >
              Ücretsiz İlan Ver
            </button>
          </div>

          {/* Masaüstü: kullanıcı butonları */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <button
  data-bildirim-toggle="true"
  onClick={(e) => { e.stopPropagation(); handleZilTikla(); }}
  className="relative p-1.5 text-slate-300 hover:text-white transition"
  type="button"
>
                  <Bell size={17} />
                  {toplamBildirim > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {toplamBildirim}
                    </span>
                  )}
                </button>
                <button
                  onClick={onGoPanel}
                  className="flex items-center gap-1 text-slate-200 hover:text-white border border-slate-400 hover:border-slate-200 text-xs font-medium px-2.5 py-1 rounded transition"
                >
                  <LayoutDashboard size={13} />
                  {isAdmin ? 'Admin' : 'Panelim'}
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-slate-300 hover:text-red-400 text-xs px-2.5 py-1 rounded transition hover:bg-slate-700"
                >
                  <LogOut size={13} /> Çıkış
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onGoLogin}
                  className="text-slate-200 hover:text-white border border-slate-400 hover:border-slate-200 text-xs font-medium px-2.5 py-1 rounded transition"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={onGoRegister}
                  className="text-slate-200 hover:text-white border border-slate-400 hover:border-slate-200 text-xs font-medium px-2.5 py-1 rounded transition"
                >
                  Kayıt Ol
                </button>
              </>
            )}
          </div>

          {/* Mobil: hamburger */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            {isLoggedIn && (
              <button data-bildirim-toggle="true" onClick={(e) => { e.stopPropagation(); handleZilTikla(); }} className="relative p-1.5 text-slate-300 hover:text-white transition" type="button">
                <Bell size={18} />
                {toplamBildirim > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {toplamBildirim}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMenuAcik(!menuAcik)}
              className="p-1.5 text-slate-300 hover:text-white transition"
              aria-label="Menü"
            >
              {menuAcik ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* BILDIRIM PANELI */}
        {isLoggedIn && bildirimAcik && (
          <div
            ref={bildirimPanelRef}
            className="absolute right-0 top-12 z-50 w-[min(92vw,380px)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-semibold text-slate-800">{bildirimPaneliBaslik}</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {bildirimYukleniyor ? (
                <div className="p-4 text-sm text-slate-400">Yukleniyor...</div>
              ) : bildirimler.length === 0 ? (
                <div className="p-4 text-sm text-slate-400">Yeni bildirim yok.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bildirimler.map((bildirim) => (
                    <button
                      key={bildirim.id}
                      onClick={() => bildirimeGit(bildirim)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition"
                    >
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">{bildirim.baslik}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{bildirim.aciklama}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 bg-white">
              <button
                onClick={() => { setBildirimAcik(false); onGoNotifications(); }}
                className="w-full text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                {bildirimPaneliYonlendirmeMetni}
              </button>
            </div>
          </div>
        )}

        {/* 2. LOGO + REKLAM */}
        <div className="bg-white border-x border-slate-200 px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start"
              onClick={() => onNavigate('home')}
            >
              <div className="rounded-lg overflow-hidden flex-shrink-0">
  {platformLogo ? (
    <img src={platformLogo} alt="Logo" className="h-8 w-auto object-contain" />
  ) : (
    <div className="bg-orange-500 rounded-lg p-1 sm:p-1.5">
      <Truck className="text-white" size={16} />
    </div>
  )}
</div>
              <div className="leading-tight">
                <div className="text-slate-800 font-bold text-base sm:text-xl tracking-tight">
                  salonum<span className="text-orange-500">.site</span>
                </div>
                <div className="text-slate-400 text-[10px] sm:text-xs hidden sm:block">
                  Servis İlanları Platformu
                </div>
              </div>
            </div>

            <div className="w-full sm:flex-1 h-32 sm:h-48">
              {headerReklam ? (
                <div
                  onClick={() => headerReklam.link_url && window.open(headerReklam.link_url, '_blank')}
                  className="cursor-pointer w-full h-full rounded-lg overflow-hidden relative"
                >
                  <img
                    src={headerReklam.resim_url}
                    alt={headerReklam.baslik || 'Reklam'}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <span className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Reklam
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                  <span className="text-slate-300 text-xs">Reklam Alanı</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. NAV — masaüstü */}
        <nav className="bg-slate-500 rounded-b-lg hidden md:flex items-center px-2">
          {navLinks.map((item) => (
            <button key={item.page} onClick={() => onNavigate(item.page)}
              className="text-slate-200 hover:text-white hover:bg-slate-400 text-sm font-medium px-4 py-2.5 rounded transition">
              {item.label}
            </button>
          ))}
        </nav>

        {/* MOBİL MENÜ */}
        {menuAcik && (
          <div className="md:hidden fixed inset-0 top-0 z-50 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg overflow-hidden flex-shrink-0">
  {platformLogo ? (
    <img src={platformLogo} alt="Logo" className="h-8 w-auto object-contain" />
  ) : (
    <div className="bg-orange-500 rounded-lg p-1.5">
      <Truck className="text-white" size={18} />
    </div>
  )}
</div>
                <span className="text-white font-bold text-base">salonum<span className="text-orange-400">.site</span></span>
              </div>
              <button onClick={() => setMenuAcik(false)} className="p-2 text-slate-300 hover:text-white">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Sayfalar</p>
                <div className="flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <button key={item.page}
                      onClick={() => { onNavigate(item.page); setMenuAcik(false); }}
                      className="w-full text-left text-slate-700 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition text-sm">
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Hesap</p>
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { onIlanEkle(); setMenuAcik(false); }}
                      className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm active:bg-orange-600 transition">
                      + Ücretsiz İlan Ver
                    </button>
                    <button onClick={() => { onGoPanel(); setMenuAcik(false); }}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-3.5 rounded-xl text-sm font-medium active:bg-slate-50 transition">
                      <LayoutDashboard size={15} />
                      {isAdmin ? 'Admin Panel' : 'Panelim'}
                    </button>
                    <button onClick={() => { onLogout(); setMenuAcik(false); }}
                      className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-100 bg-red-50 py-3.5 rounded-xl text-sm font-medium active:bg-red-100 transition">
                      <LogOut size={15} /> Çıkış Yap
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { onGoLogin(); setMenuAcik(false); }}
                      className="w-full border border-slate-200 text-slate-600 py-3.5 rounded-xl font-medium text-sm active:bg-slate-50 transition">
                      Giriş Yap
                    </button>
                    <button onClick={() => { onGoRegister(); setMenuAcik(false); }}
                      className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm active:bg-orange-600 transition">
                      Ücretsiz İlan Ver / Kayıt Ol
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
