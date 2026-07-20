import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { ParticipantService } from '../../services/participant.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { CertificateEligibilityService } from '../../services/certificate-eligibility.service';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AuditLogEntry } from '../../../../core/models/audit-log-entry.model';
import { CourseStatus, CertificateEligibilityStatus } from '../../../../core/models/enums';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

interface KpiCard {
  label: string;
  value: number;
  icon: string;
}

/** Kurs durum dağılımında bir çubuğu temsil eder. */
interface StatusDistributionBar {
  status: CourseStatus;
  count: number;
  percentage: number;
}

const RECENT_ACTIVITY_LIMIT = 5;

/**
 * Dashboard ekranı (/dashboard).
 * Durum dağılımı, KPI kartları, basit bir çubuk grafik ve "Son
 * Aktiviteler" özet tablosuyla operasyonel görünürlük sağlar (bkz.
 * dokümanın "Raporlama ve audit log" bölümü). Ayrıca gösterilen rapor
 * özetini JSON olarak dışa aktarma imkânı sunar.
 * Tüm veri kaynakları mock API üzerinden asenkron çekilir; forkJoin ile
 * hepsi tamamlandığında tek seferde kartlar/tablolar oluşturulur.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusLabelPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;
  cards: KpiCard[] = [];
  statusDistribution: StatusDistributionBar[] = [];
  recentActivity: AuditLogEntry[] = [];

  /** roleGuard tarafından ?yetkisiz=1 ile yönlendirildiyse true olur. */
  showUnauthorizedWarning = false;

  constructor(
    private courseService: CourseService,
    private participantService: ParticipantService,
    private enrollmentService: EnrollmentService,
    private certificateEligibilityService: CertificateEligibilityService,
    private auditLogService: AuditLogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.showUnauthorizedWarning = this.route.snapshot.queryParamMap.get('yetkisiz') === '1';
    if (this.showUnauthorizedWarning) {
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      courses: this.courseService.getAll(),
      participants: this.participantService.getAll(),
      enrollments: this.enrollmentService.getAll(),
      eligibilities: this.certificateEligibilityService.getAll(),
      auditLog: this.auditLogService.getAll(),
    }).subscribe({
      next: ({ courses, participants, enrollments, eligibilities, auditLog }) => {
        const publishedCount = courses.filter((c) => c.status === CourseStatus.Published).length;
        const issuedCount = eligibilities.filter(
          (e) => e.status === CertificateEligibilityStatus.Issued
        ).length;

        this.cards = [
          { label: 'Toplam Kurs', value: courses.length, icon: '📚' },
          { label: 'Yayındaki Kurs', value: publishedCount, icon: '✅' },
          { label: 'Toplam Katılımcı', value: participants.length, icon: '👥' },
          { label: 'Toplam Kayıt', value: enrollments.length, icon: '📝' },
          { label: 'Verilen Sertifika', value: issuedCount, icon: '🎓' },
        ];

        const totalCourses = courses.length || 1;
        this.statusDistribution = Object.values(CourseStatus).map((status) => {
          const count = courses.filter((c) => c.status === status).length;
          return { status, count, percentage: Math.round((count / totalCourses) * 100) };
        });

        this.recentActivity = [...auditLog]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, RECENT_ACTIVITY_LIMIT);

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message ?? 'Dashboard verileri yüklenirken bir hata oluştu.';
        this.loading = false;
      },
    });
  }

  dismissUnauthorizedWarning(): void {
    this.showUnauthorizedWarning = false;
  }

  /**
   * Dashboard'da gösterilen rapor özetini (KPI kartları, durum dağılımı,
   * son aktiviteler) JSON dosyası olarak dışa aktarır. Gerçek bir
   * backend/dosya sistemi olmadığından tamamen tarayıcı içinde çalışan
   * bir Blob indirme simülasyonu kullanılır (bkz. katılımcı listesi
   * import/export akışıyla aynı desen).
   */
  exportReport(): void {
    const report = {
      generatedAt: new Date().toISOString(),
      kpis: this.cards.map(({ label, value }) => ({ label, value })),
      courseStatusDistribution: this.statusDistribution.map(({ status, count, percentage }) => ({
        status,
        count,
        percentage,
      })),
      recentActivity: this.recentActivity.map(({ createdAt, entityType, action, description }) => ({
        createdAt,
        entityType,
        action,
        description,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-raporu-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}