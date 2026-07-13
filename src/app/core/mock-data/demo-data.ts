import { Instructor } from '../../features/academy/models/instructor.model';
import { Course } from '../../features/academy/models/course.model';
import { Participant } from '../../features/academy/models/participant.model';
import { Enrollment } from '../../features/academy/models/enrollment.model';
import { CourseStatus, EnrollmentStatus, QuestionStatus, CertificateEligibilityStatus } from '../models/enums';
import { Exam } from '../../features/academy/models/exam.model';
import { Question } from '../../features/academy/models/question.model';
import { ExamResult } from '../../features/academy/models/exam-result.model';
import { AttendanceRecord } from '../../features/academy/models/attendance-record.model';
import { CourseModule, Lesson } from '../../features/academy/models/course-module.model';
import { CertificateEligibility } from '../../features/academy/models/certificate-eligibility.model';
import { AuditLogEntry } from '../models/audit-log-entry.model';

export const demoInstructors: Instructor[] = [
  {
    id: 'inst-1',
    fullName: 'Elif Yıldız',
    email: 'elif.yildiz@egitimakademisi.com',
    expertise: 'Yazılım Geliştirme',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'inst-2',
    fullName: 'Mert Kaya',
    email: 'mert.kaya@egitimakademisi.com',
    expertise: 'Proje Yönetimi',
    isActive: true,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'inst-3',
    fullName: 'Zeynep Arslan',
    email: 'zeynep.arslan@egitimakademisi.com',
    expertise: 'Veri Analizi',
    isActive: false,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
  },
];

export const demoCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Angular ile Modern Web Geliştirme',
    description: 'Standalone component, signals ve reactive forms ile uçtan uca Angular eğitimi.',
    status: CourseStatus.Published,
    capacity: 25,
    instructorId: 'inst-1',
    passingScore: 70,
    startDate: '2026-03-01T09:00:00.000Z',
    endDate: '2026-04-15T17:00:00.000Z',
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'course-2',
    title: 'Çevik Proje Yönetimi',
    description: 'Scrum ve Kanban metodolojileriyle proje yönetimi pratikleri.',
    status: CourseStatus.Published,
    capacity: 20,
    instructorId: 'inst-2',
    passingScore: 60,
    startDate: '2026-03-10T09:00:00.000Z',
    endDate: '2026-04-05T17:00:00.000Z',
    createdAt: '2026-02-05T09:00:00.000Z',
    updatedAt: '2026-02-12T09:00:00.000Z',
  },
  {
    id: 'course-3',
    title: 'Veri Analizine Giriş',
    description: 'Excel ve temel istatistik yöntemleriyle veri analizi temelleri.',
    status: CourseStatus.Draft,
    capacity: 15,
    instructorId: 'inst-3',
    passingScore: 65,
    startDate: '2026-05-01T09:00:00.000Z',
    endDate: '2026-06-01T17:00:00.000Z',
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
  },
  {
    id: 'course-4',
    title: 'İleri Seviye TypeScript',
    description: 'Generic tipler, utility type\'lar ve gelişmiş TypeScript pratikleri.',
    status: CourseStatus.Completed,
    capacity: 18,
    instructorId: 'inst-1',
    passingScore: 75,
    startDate: '2025-11-01T09:00:00.000Z',
    endDate: '2025-12-15T17:00:00.000Z',
    createdAt: '2025-10-01T09:00:00.000Z',
    updatedAt: '2025-12-16T09:00:00.000Z',
  },
];

export const demoParticipants: Participant[] = [
  {
    id: 'part-1',
    fullName: 'Ahmet Demir',
    email: 'ahmet.demir@example.com',
    phone: '0532 111 22 33',
    isActive: true,
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z',
  },
  {
    id: 'part-2',
    fullName: 'Elif Şahin',
    email: 'elif.sahin@example.com',
    phone: '0533 222 33 44',
    isActive: true,
    createdAt: '2026-02-16T10:00:00.000Z',
    updatedAt: '2026-02-16T10:00:00.000Z',
  },
  {
    id: 'part-3',
    fullName: 'Burak Yılmaz',
    email: 'burak.yilmaz@example.com',
    phone: '0534 333 44 55',
    isActive: true,
    createdAt: '2026-02-17T10:00:00.000Z',
    updatedAt: '2026-02-17T10:00:00.000Z',
  },
  {
    id: 'part-4',
    fullName: 'Selin Koç',
    email: 'selin.koc@example.com',
    phone: '0535 444 55 66',
    isActive: true,
    createdAt: '2026-02-18T10:00:00.000Z',
    updatedAt: '2026-02-18T10:00:00.000Z',
  },
  {
    id: 'part-5',
    fullName: 'Emre Aydın',
    email: 'emre.aydin@example.com',
    phone: '0536 555 66 77',
    isActive: false,
    createdAt: '2026-02-19T10:00:00.000Z',
    updatedAt: '2026-02-19T10:00:00.000Z',
  },
  {
    id: 'part-6',
    fullName: 'Gizem Öztürk',
    email: 'gizem.ozturk@example.com',
    phone: '0537 666 77 88',
    isActive: true,
    createdAt: '2026-02-20T10:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z',
  },
];

export const demoEnrollments: Enrollment[] = [
  {
    id: 'enr-1',
    courseId: 'course-1',
    participantId: 'part-1',
    status: EnrollmentStatus.Active,
    enrolledAt: '2026-02-20T09:00:00.000Z',
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
  },
  {
    id: 'enr-2',
    courseId: 'course-1',
    participantId: 'part-2',
    status: EnrollmentStatus.Active,
    enrolledAt: '2026-02-21T09:00:00.000Z',
    createdAt: '2026-02-21T09:00:00.000Z',
    updatedAt: '2026-02-21T09:00:00.000Z',
  },
  {
    id: 'enr-3',
    courseId: 'course-2',
    participantId: 'part-3',
    status: EnrollmentStatus.Pending,
    enrolledAt: '2026-02-22T09:00:00.000Z',
    createdAt: '2026-02-22T09:00:00.000Z',
    updatedAt: '2026-02-22T09:00:00.000Z',
  },
  {
    id: 'enr-4',
    courseId: 'course-2',
    participantId: 'part-4',
    status: EnrollmentStatus.Approved,
    enrolledAt: '2026-02-23T09:00:00.000Z',
    createdAt: '2026-02-23T09:00:00.000Z',
    updatedAt: '2026-02-23T09:00:00.000Z',
  },
  {
    id: 'enr-5',
    courseId: 'course-4',
    participantId: 'part-5',
    status: EnrollmentStatus.Completed,
    enrolledAt: '2025-11-01T09:00:00.000Z',
    createdAt: '2025-11-01T09:00:00.000Z',
    updatedAt: '2025-12-16T09:00:00.000Z',
  },
  {
    id: 'enr-6',
    courseId: 'course-1',
    participantId: 'part-6',
    status: EnrollmentStatus.Cancelled,
    enrolledAt: '2026-02-24T09:00:00.000Z',
    createdAt: '2026-02-24T09:00:00.000Z',
    updatedAt: '2026-02-25T09:00:00.000Z',
  },
];

export const demoExams: Exam[] = [
  {
    id: 'exam-1',
    courseId: 'course-1',
    title: 'Angular Temelleri Değerlendirme Sınavı',
    durationMinutes: 45,
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'exam-2',
    courseId: 'course-2',
    title: 'Çevik Yöntemler Final Sınavı',
    durationMinutes: 30,
    createdAt: '2026-02-12T09:00:00.000Z',
    updatedAt: '2026-02-12T09:00:00.000Z',
  },
];

export const demoQuestions: Question[] = [
  {
    id: 'q-1',
    examId: 'exam-1',
    text: 'Angular\'da standalone component nedir?',
    options: [
      'NgModule gerektirmeyen component',
      'Sadece test için kullanılan component',
      'Route tanımlamayan component',
      'Stil içermeyen component',
    ],
    correctOptionIndex: 0,
    status: QuestionStatus.Active,
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'q-2',
    examId: 'exam-1',
    text: 'Signals ne için kullanılır?',
    options: [
      'HTTP isteği yapmak için',
      'Reaktif durum yönetimi için',
      'CSS stillendirme için',
      'Route yönlendirmesi için',
    ],
    correctOptionIndex: 1,
    status: QuestionStatus.Active,
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'q-3',
    examId: 'exam-2',
    text: 'Scrum\'da "sprint" ne anlama gelir?',
    options: [
      'Proje bütçesi',
      'Sabit süreli çalışma döngüsü',
      'Ekip toplantısı',
      'Müşteri geri bildirimi',
    ],
    correctOptionIndex: 1,
    status: QuestionStatus.Active,
    createdAt: '2026-02-12T09:00:00.000Z',
    updatedAt: '2026-02-12T09:00:00.000Z',
  },
];

export const demoExamResults: ExamResult[] = [
  {
    id: 'result-1',
    examId: 'exam-1',
    participantId: 'part-1',
    correctCount: 2,
    wrongCount: 0,
    score: 100,
    isPassed: true,
    createdAt: '2026-03-05T14:00:00.000Z',
    updatedAt: '2026-03-05T14:00:00.000Z',
  },
  {
    id: 'result-2',
    examId: 'exam-1',
    participantId: 'part-2',
    correctCount: 1,
    wrongCount: 1,
    score: 50,
    isPassed: false,
    createdAt: '2026-03-05T14:30:00.000Z',
    updatedAt: '2026-03-05T14:30:00.000Z',
  },
];

export const demoAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    courseId: 'course-1',
    participantId: 'part-1',
    lessonId: 'lesson-1',
    attended: true,
    date: '2026-03-02T09:00:00.000Z',
    createdAt: '2026-03-02T09:00:00.000Z',
    updatedAt: '2026-03-02T09:00:00.000Z',
  },
  {
    id: 'att-2',
    courseId: 'course-1',
    participantId: 'part-1',
    lessonId: 'lesson-2',
    attended: true,
    date: '2026-03-05T09:00:00.000Z',
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  },
  {
    id: 'att-3',
    courseId: 'course-1',
    participantId: 'part-2',
    lessonId: 'lesson-1',
    attended: false,
    date: '2026-03-02T09:00:00.000Z',
    createdAt: '2026-03-02T09:00:00.000Z',
    updatedAt: '2026-03-02T09:00:00.000Z',
  },
];

export const demoCourseModules: CourseModule[] = [
  {
    id: 'module-1',
    courseId: 'course-1',
    title: 'Componentler ve Templateler',
    order: 1,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'module-2',
    courseId: 'course-1',
    title: 'Servisler ve Dependency Injection',
    order: 2,
    createdAt: '2026-02-02T09:00:00.000Z',
    updatedAt: '2026-02-02T09:00:00.000Z',
  },
];

export const demoLessons: Lesson[] = [
  {
    id: 'lesson-1',
    moduleId: 'module-1',
    title: 'Standalone Component Yapısı',
    content: 'Standalone component\'ler NgModule gerektirmeden bağımsız çalışabilen component\'lerdir.',
    order: 1,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'lesson-2',
    moduleId: 'module-1',
    title: 'Template Syntax ve Yeni Control Flow',
    content: '@if ve @for gibi yeni kontrol akışı söz dizimleri ile template yazımı.',
    order: 2,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  },
];

export const demoCertificateEligibilities: CertificateEligibility[] = [
  {
    id: 'cert-1',
    courseId: 'course-1',
    participantId: 'part-1',
    attendanceRate: 100,
    examPassed: true,
    status: CertificateEligibilityStatus.Eligible,
    issuedAt: null,
    createdAt: '2026-03-06T09:00:00.000Z',
    updatedAt: '2026-03-06T09:00:00.000Z',
  },
  {
    id: 'cert-2',
    courseId: 'course-1',
    participantId: 'part-2',
    attendanceRate: 50,
    examPassed: false,
    status: CertificateEligibilityStatus.Pending,
    issuedAt: null,
    createdAt: '2026-03-06T09:00:00.000Z',
    updatedAt: '2026-03-06T09:00:00.000Z',
  },
  {
    id: 'cert-3',
    courseId: 'course-4',
    participantId: 'part-5',
    attendanceRate: 95,
    examPassed: true,
    status: CertificateEligibilityStatus.Issued,
    issuedAt: '2025-12-20T09:00:00.000Z',
    createdAt: '2025-12-17T09:00:00.000Z',
    updatedAt: '2025-12-20T09:00:00.000Z',
  },
];

export const demoAuditLogEntries: AuditLogEntry[] = [
  {
    id: 'audit-1',
    entityType: 'Course',
    entityId: 'course-1',
    action: 'status_changed',
    performedByUserId: 'inst-1',
    performedByRole: 'egitim_yoneticisi',
    description: 'Kurs durumu taslaktan yayına alındı.',
    oldValue: 'draft',
    newValue: 'published',
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'audit-2',
    entityType: 'CertificateEligibility',
    entityId: 'cert-3',
    action: 'certificate_issued',
    performedByUserId: 'inst-1',
    performedByRole: 'egitim_yoneticisi',
    description: 'Katılımcıya sertifika verildi.',
    oldValue: 'eligible',
    newValue: 'issued',
    createdAt: '2025-12-20T09:00:00.000Z',
    updatedAt: '2025-12-20T09:00:00.000Z',
  },
];