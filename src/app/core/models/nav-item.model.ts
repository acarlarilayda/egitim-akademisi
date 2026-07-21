import { UserRole } from './enums';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  /** Bu menü öğesini görebilecek roller. Boş/undefined ise tüm roller görür. */
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: '📊' },
  {
    label: 'Kurslar',
    route: '/kurslar',
    icon: '📚',
    roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen, UserRole.Katilimci],
  },
  {
    label: 'Modüller',
    route: '/moduller',
    icon: '🧩',
    roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen],
  },
  {
    label: 'Katılımcılar',
    route: '/katilimcilar',
    icon: '👥',
    roles: [UserRole.EgitimYoneticisi],
  },
  {
    label: 'Sınavlar',
    route: '/sinavlar',
    icon: '📝',
    roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen],
  },
  {
    label: 'Sonuçlar',
    route: '/sonuclar',
    icon: '✅',
    roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen, UserRole.Katilimci],
  },
  {
    label: 'Sertifikalar',
    route: '/sertifikalar',
    icon: '🎓',
    roles: [UserRole.EgitimYoneticisi, UserRole.Katilimci],
  },
  {
    label: 'Audit Log',
    route: '/audit-log',
    icon: '🗂️',
    roles: [UserRole.EgitimYoneticisi],
  },
];