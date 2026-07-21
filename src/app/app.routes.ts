import { Routes } from '@angular/router';
import { DashboardComponent } from './features/academy/pages/dashboard/dashboard.component';
import { CourseListComponent } from './features/academy/pages/course-list/course-list.component';
import { CourseCreateComponent } from './features/academy/pages/course-create/course-create.component';
import { CourseDetailComponent } from './features/academy/pages/course-detail/course-detail.component';
import { CourseModuleListComponent } from './features/academy/pages/course-module-list/course-module-list.component';
import { ParticipantListComponent } from './features/academy/pages/participant-list/participant-list.component';
import { ExamListComponent } from './features/academy/pages/exam-list/exam-list.component';
import { QuestionListComponent } from './features/academy/pages/question-list/question-list.component';
import { ExamResultListComponent } from './features/academy/pages/exam-result-list/exam-result-list.component';
import { CertificateEligibilityListComponent } from './features/academy/pages/certificate-eligibility-list/certificate-eligibility-list.component';
import { AuditLogListComponent } from './features/academy/pages/audit-log-list/audit-log-list.component';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { UserRole } from './core/models/enums';

/**
 * Uygulama rotaları.
 * "/kurslar/yeni" hem bu route üzerinden (CourseCreateComponent, deep-link
 * için) hem de course-list.component.ts içindeki Dialog+CourseForm akışıyla
 * (hızlı, sayfa değişmeden) oluşturulabilir; ikisi de aynı CourseFormComponent'i
 * kullanır.
 *
 * `data.roles`, roleGuard tarafından okunur ve o rotaya erişebilecek
 * rolleri belirtir. `data.roles` tanımlanmayan route'lar (örn. dashboard)
 * tüm rollere açıktır.
 */
export const routes: Routes = [
  {
    path: '',
    // Tüm alt route'lar buradan geçer; authGuard normal kullanımda hep
    // true döner ama route'ların ortak bir koruma katmanından geçmesini
    // sağlıyor.
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
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
    ],
  },
];