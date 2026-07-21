import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InstructorService } from '../../services/instructor.service';
import { Instructor } from '../../models/instructor.model';
import { CourseFormComponent } from '../course-form/course-form.component';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Yeni kurs oluşturma ekranı (/kurslar/yeni).
 *
 * Kurs oluşturma günlük kullanımda course-list içindeki Dialog+CourseForm
 * akışıyla yapılır (hızlı, sayfa değişmeden); bu route ise doğrudan
 * bağlantı/deep-link ile kurs oluşturma sayfasına ulaşılabilmesi için
 * mevcuttur. Aynı CourseFormComponent iki yerde de (dialog ve bu sayfada)
 * tekrar kullanılır — validasyon ve create akışı tek bir yerde tanımlıdır.
 */
@Component({
  selector: 'app-course-create',
  standalone: true,
  imports: [CourseFormComponent],
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.scss',
})
export class CourseCreateComponent implements OnInit, HasUnsavedChanges {
  @ViewChild('courseForm') courseForm?: CourseFormComponent;

  instructors: Instructor[] = [];

  // Kaydet/İptal ile bilinçli çıkışta guard'ın uyarı vermemesi için kullanılır.
  private leavingIntentionally = false;

  constructor(
    private instructorService: InstructorService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.instructorService.getAll().subscribe({
      next: (instructors) => (this.instructors = instructors),
    });
  }

  hasUnsavedChanges(): boolean {
    if (this.leavingIntentionally) {
      return false;
    }
    return this.courseForm?.form.dirty ?? false;
  }

  onSaved(): void {
    this.leavingIntentionally = true;
    this.notificationService.success('Kurs oluşturuldu.');
    this.router.navigate(['/kurslar']);
  }

  onCancelled(): void {
    this.leavingIntentionally = true;
    this.router.navigate(['/kurslar']);
  }
}