import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateEligibilityService } from '../../services/certificate-eligibility.service';
import { CourseService } from '../../services/course.service';
import { ParticipantService } from '../../services/participant.service';
import { CertificateEligibility } from '../../models/certificate-eligibility.model';
import { Course } from '../../models/course.model';
import { Participant } from '../../models/participant.model';
import { CertificateEligibilityStatus } from '../../../../core/models/enums';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DataTableCellDirective } from '../../../../shared/components/data-table/data-table-cell.directive';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { CertificateEvaluateFormComponent } from '../certificate-evaluate-form/certificate-evaluate-form.component';
import { DebounceDirective } from '../../../../shared/directives/debounce.directive';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-certificate-eligibility-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    DataTableCellDirective,
    DialogComponent,
    CertificateEvaluateFormComponent,
    DebounceDirective,
    StatusLabelPipe,
    ConfirmDialogComponent,
  ],
  templateUrl: './certificate-eligibility-list.component.html',
  styleUrl: './certificate-eligibility-list.component.scss',
})
export class CertificateEligibilityListComponent implements OnInit {
  eligibilities: CertificateEligibility[] = [];
  courses: Course[] = [];
  participants: Participant[] = [];
  errorMessage: string | null = null;
  courseTitleById = new Map<string, string>();
  participantNameById = new Map<string, string>();

  searchTerm = '';
  statusFilter = '';
  readonly statusOptions = Object.values(CertificateEligibilityStatus);

  dialogOpen = false;

  /** Sertifika verme, geri döndürülemez kritik bir işlem olduğu için
   * ConfirmDialogComponent ile onay alınmadan uygulanmaz. */
  issueConfirmOpen = false;
  pendingIssueId: string | null = null;

  readonly loading = this.certificateEligibilityService.loading;
  readonly Status = CertificateEligibilityStatus;

  readonly columns: TableColumn[] = [
    { key: 'participantId', label: 'Katılımcı', sortable: false },
    { key: 'courseId', label: 'Kurs', sortable: false },
    { key: 'attendanceRate', label: 'Katılım %', sortable: true },
    { key: 'examPassed', label: 'Sınav', sortable: true },
    { key: 'status', label: 'Durum', sortable: true },
    { key: 'actions', label: '' },
  ];

  constructor(
    private certificateEligibilityService: CertificateEligibilityService,
    private courseService: CourseService,
    private participantService: ParticipantService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.errorMessage = null;

    this.courseService.getAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.courseTitleById = new Map(courses.map((c) => [c.id, c.title]));
      },
    });

    this.participantService.getAll().subscribe({
      next: (participants) => {
        this.participants = participants;
        this.participantNameById = new Map(participants.map((p) => [p.id, p.fullName]));
      },
    });

    this.certificateEligibilityService.getAll().subscribe({
      next: (eligibilities) => (this.eligibilities = eligibilities),
      error: (err) => (this.errorMessage = err?.message ?? 'Sertifika kayıtları yüklenirken bir hata oluştu.'),
    });
  }

  courseTitle(courseId: string): string {
    return this.courseTitleById.get(courseId) ?? courseId;
  }

  participantName(participantId: string): string {
    return this.participantNameById.get(participantId) ?? participantId;
  }

  get filteredEligibilities(): CertificateEligibility[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.eligibilities.filter((eligibility) => {
      const name = this.participantName(eligibility.participantId).toLowerCase();
      const matchesSearch = !term || name.includes(term);
      const matchesStatus = !this.statusFilter || eligibility.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  openEvaluateDialog(): void {
    this.dialogOpen = true;
  }

  onSaved(): void {
    this.dialogOpen = false;
    this.load();
  }

  onDialogClosed(): void {
    this.dialogOpen = false;
  }

  issueCertificate(id: string): void {
    this.pendingIssueId = id;
    this.issueConfirmOpen = true;
  }

  confirmIssueCertificate(): void {
    if (!this.pendingIssueId) {
      return;
    }

    this.errorMessage = null;
    this.certificateEligibilityService.issueCertificate(this.pendingIssueId).subscribe({
      next: () => {
        this.issueConfirmOpen = false;
        this.pendingIssueId = null;
        this.load();
      },
      error: (err) => {
        this.errorMessage = err?.message ?? 'Sertifika verilirken bir hata oluştu.';
        this.issueConfirmOpen = false;
        this.pendingIssueId = null;
      },
    });
  }

  cancelIssueCertificate(): void {
    this.issueConfirmOpen = false;
    this.pendingIssueId = null;
  }
}