import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { CourseModuleService } from '../../services/course-module.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { ParticipantService } from '../../services/participant.service';
import { ExamService } from '../../services/exam.service';
import { ExamResultService } from '../../services/exam-result.service';
import { Course } from '../../models/course.model';
import { CourseModule } from '../../models/course-module.model';
import { Enrollment } from '../../models/enrollment.model';
import { ExamResult } from '../../models/exam-result.model';

type DetailTab = 'modules' | 'participants' | 'results';

interface EnrollmentRow extends Enrollment {
  participantName: string;
}

interface ExamResultRow extends ExamResult {
  participantName: string;
  examTitle: string;
}

/**
 * Kurs detay ekranı (/kurslar/:id).
 * Modüller, katılımcılar (enrollment) ve sonuçlar (exam results) sekmeli
 * yapıda gösterilir (bkz. dokümanın 11. bölümü, kabul kriterleri).
 */
@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  modules: CourseModule[] = [];
  enrollmentRows: EnrollmentRow[] = [];
  examResultRows: ExamResultRow[] = [];

  loading = true;
  errorMessage: string | null = null;
  activeTab: DetailTab = 'modules';

  private courseId!: string;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private courseModuleService: CourseModuleService,
    private enrollmentService: EnrollmentService,
    private participantService: ParticipantService,
    private examService: ExamService,
    private examResultService: ExamResultService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  setTab(tab: DetailTab): void {
    this.activeTab = tab;
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      course: this.courseService.getById(this.courseId),
      modules: this.courseModuleService.getByCourseId(this.courseId),
      enrollments: this.enrollmentService.getAll(),
      participants: this.participantService.getAll(),
      exams: this.examService.getByCourseId(this.courseId),
      examResults: this.examResultService.getAll(),
    }).subscribe({
      next: ({ course, modules, enrollments, participants, exams, examResults }) => {
        if (!course) {
          this.errorMessage = 'Kurs bulunamadı.';
          this.loading = false;
          return;
        }

        const participantNameById = new Map(participants.map((p) => [p.id, p.fullName]));
        const examTitleById = new Map(exams.map((e) => [e.id, e.title]));
        const courseExamIds = new Set(exams.map((e) => e.id));

        this.course = course;
        this.modules = modules;

        this.enrollmentRows = enrollments
          .filter((e) => e.courseId === this.courseId)
          .map((e) => ({ ...e, participantName: participantNameById.get(e.participantId) ?? e.participantId }));

        this.examResultRows = examResults
          .filter((r) => courseExamIds.has(r.examId))
          .map((r) => ({
            ...r,
            participantName: participantNameById.get(r.participantId) ?? r.participantId,
            examTitle: examTitleById.get(r.examId) ?? r.examId,
          }));

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.message ?? 'Kurs detayı yüklenirken bir hata oluştu.';
        this.loading = false;
      },
    });
  }
}