import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InstructorService } from '../../services/instructor.service';
import { Instructor } from '../../models/instructor.model';
import { CourseFormComponent } from '../course-form/course-form.component';

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
export class CourseCreateComponent implements OnInit {
  instructors: Instructor[] = [];

  constructor(
    private instructorService: InstructorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.instructorService.getAll().subscribe({
      next: (instructors) => (this.instructors = instructors),
    });
  }

  onSaved(): void {
    this.router.navigate(['/kurslar']);
  }

  onCancelled(): void {
    this.router.navigate(['/kurslar']);
  }
}