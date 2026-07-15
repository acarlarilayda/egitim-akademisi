import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { ParticipantService } from '../../services/participant.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { CertificateEligibilityService } from '../../services/certificate-eligibility.service';
import { CourseStatus, CertificateEligibilityStatus } from '../../../../core/models/enums';

interface KpiCard {
  label: string;
  value: number;
  icon: string;
}

/**
 * Dashboard ekranı (/dashboard).
 * Durum dağılımı ve KPI kartlarıyla operasyonel görünürlük sağlar
 * (bkz. dokümanın 5. bölümü: "Raporlama ve audit log").
 * Tüm veri kaynakları mock API üzerinden asenkron çekilir; forkJoin ile
 * hepsi tamamlandığında tek seferde kartlar oluşturulur.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;
  cards: KpiCard[] = [];

  constructor(
    private courseService: CourseService,
    private participantService: ParticipantService,
    private enrollmentService: EnrollmentService,
    private certificateEligibilityService: CertificateEligibilityService
  ) {}

  ngOnInit(): void {
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
    }).subscribe({
      next: ({ courses, participants, enrollments, eligibilities }) => {
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
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message ?? 'Dashboard verileri yüklenirken bir hata oluştu.';
        this.loading = false;
      },
    });
  }
}