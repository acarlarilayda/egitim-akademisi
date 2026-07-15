import { Routes } from '@angular/router';
import { DashboardComponent } from './features/academy/pages/dashboard/dashboard.component';
import { CourseListComponent } from './features/academy/pages/course-list/course-list.component';
import { CourseDetailComponent } from './features/academy/pages/course-detail/course-detail.component';
import { CourseModuleListComponent } from './features/academy/pages/course-module-list/course-module-list.component';
import { ParticipantListComponent } from './features/academy/pages/participant-list/participant-list.component';
import { ExamListComponent } from './features/academy/pages/exam-list/exam-list.component';
import { ExamResultListComponent } from './features/academy/pages/exam-result-list/exam-result-list.component';
import { CertificateEligibilityListComponent } from './features/academy/pages/certificate-eligibility-list/certificate-eligibility-list.component';
import { AuditLogListComponent } from './features/academy/pages/audit-log-list/audit-log-list.component';

/**
 * Uygulama rotaları. Doküman 6. bölümdeki (Sayfalar ve Rotalar) route
 * listesiyle birebir örtüşür; ekran-listesi.md ile referans doğrulanmıştır.
 * "/kurslar/yeni" 4. günde (formlar) eklenecektir.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'kurslar', component: CourseListComponent },
  { path: 'kurslar/:id', component: CourseDetailComponent },
  { path: 'moduller', component: CourseModuleListComponent },
  { path: 'katilimcilar', component: ParticipantListComponent },
  { path: 'sinavlar', component: ExamListComponent },
  { path: 'sonuclar', component: ExamResultListComponent },
  { path: 'sertifikalar', component: CertificateEligibilityListComponent },
  { path: 'audit-log', component: AuditLogListComponent },
];