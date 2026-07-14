export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: '📊' },
  { label: 'Kurslar', route: '/kurslar', icon: '📚' },
  { label: 'Modüller', route: '/moduller', icon: '🧩' },
  { label: 'Katılımcılar', route: '/katilimcilar', icon: '👥' },
  { label: 'Sınavlar', route: '/sinavlar', icon: '📝' },
  { label: 'Sonuçlar', route: '/sonuclar', icon: '✅' },
  { label: 'Sertifikalar', route: '/sertifikalar', icon: '🎓' },
  { label: 'Audit Log', route: '/audit-log', icon: '🗂️' },
];