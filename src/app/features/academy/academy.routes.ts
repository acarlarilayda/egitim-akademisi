import { Routes } from '@angular/router';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { CourseCreateComponent } from './pages/course-create/course-create.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { CourseModuleListComponent } from './pages/course-module-list/course-module-list.component';
import { ParticipantListComponent } from './pages/participant-list/participant-list.component';
import { ExamListComponent } from './pages/exam-list/exam-list.component';
import { QuestionListComponent } from './pages/question-list/question-list.component';
import { ExamResultListComponent } from './pages/exam-result-list/exam-result-list.component';
import { CertificateEligibilityListComponent } from './pages/certificate-eligibility-list/certificate-eligibility-list.component';
import { AuditLogListComponent } from './pages/audit-log-list/audit-log-list.component';
import { roleGuard } from '../../core/guards/role.guard';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';
import { UserRole } from '../../core/models/enums';

/**
 * Academy feature route tanımları.
 *
 * app.routes.ts içinden loadChildren ile lazy-load edilir. Dashboard
 * dışındaki tüm ekranlar (kurslar, sınavlar, sonuçlar, sertifikalar vb.)
 * burada toplu; bu sayfaların kodu ayrı bir chunk'a düşer ve sadece
 * gerektiğinde indirilir.
 *
 * URL'ler değişmedi (/kurslar, /sonuclar vb. aynı) — loadChildren'daki
 * path: '' bunu sağlıyor.
 */

export const ACADEMY_ROUTES: Routes = [
  {
    path: 'kurslar',
    component: CourseListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen, UserRole.Katilimci] },
  },
  {
    path: 'kurslar/yeni',
    component: CourseCreateComponent,
    canActivate: [roleGuard],
    canDeactivate: [unsavedChangesGuard],
    data: { roles: [UserRole.EgitimYoneticisi] },
  },
  {
    path: 'kurslar/:id',
    component: CourseDetailComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen, UserRole.Katilimci] },
  },
  {
    path: 'moduller',
    component: CourseModuleListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen] },
  },
  {
    path: 'katilimcilar',
    component: ParticipantListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi] },
  },
  {
    path: 'sinavlar',
    component: ExamListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen] },
  },
  {
    path: 'sinavlar/:examId/sorular',
    component: QuestionListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen] },
  },
  {
    path: 'sonuclar',
    component: ExamResultListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Egitmen, UserRole.Katilimci] },
  },
  {
    path: 'sertifikalar',
    component: CertificateEligibilityListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi, UserRole.Katilimci] },
  },
  {
    path: 'audit-log',
    component: AuditLogListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.EgitimYoneticisi] },
  },
];