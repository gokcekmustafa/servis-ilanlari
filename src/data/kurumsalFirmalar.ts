export type KurumsalFirma = {
  ad: string;
  web: string;
  logoUrl: string;
};

const faviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

export const ISTANBUL_OKUL_PERSONEL_FIRMALARI: KurumsalFirma[] = [
  { ad: 'Aykin Turizm', web: 'https://www.aykinturizm.com.tr', logoUrl: faviconUrl('aykinturizm.com.tr') },
  { ad: 'Paltur', web: 'https://www.paltur.com.tr', logoUrl: faviconUrl('paltur.com.tr') },
  { ad: 'Oksuz Turizm', web: 'https://oksuzturizm.com', logoUrl: faviconUrl('oksuzturizm.com') },
  { ad: 'Betur Turizm', web: 'https://www.beturturizm.com', logoUrl: faviconUrl('beturturizm.com') },
  { ad: 'Hira Turizm', web: 'https://hiraturizm.com', logoUrl: faviconUrl('hiraturizm.com') },
  { ad: 'Kaplan Turizm', web: 'https://kaplanturizm.com', logoUrl: faviconUrl('kaplanturizm.com') },
  { ad: 'Aycan Turizm', web: 'https://www.aycanturizm.com.tr', logoUrl: faviconUrl('aycanturizm.com.tr') },
  { ad: 'Zirve Turizm', web: 'https://zirveturizm.com', logoUrl: faviconUrl('zirveturizm.com') },
  { ad: 'Meva Turizm', web: 'https://www.mevaturizm.com.tr', logoUrl: faviconUrl('mevaturizm.com.tr') },
];
