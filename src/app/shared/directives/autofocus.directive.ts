import { AfterViewInit, Directive, ElementRef, Input, booleanAttribute } from '@angular/core';

/**
 * Form açıldığında bağlı olduğu alana otomatik focus verir.
 * İlk alana uygulanarak kullanıcının forma girer girmez
 * yazmaya başlamasını sağlar.
 *
 * setTimeout(0) kullanılmasının nedeni: modal içinde *ngIf ile geç
 * render edilen formlarda ngAfterViewInit tetiklendiği anda element
 * DOM'a henüz tam yerleşmemiş olabiliyor. Bir sonraki tick'e
 * ertelemek bu sorunu ortadan kaldırıyor.
 *
 * Kullanımı:
 * <input type="text" formControlName="title" appAutofocus />
 * <input type="text" formControlName="title" [appAutofocus]="course === null" />
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit {
  /** false verildiğinde odaklanma uygulanmaz (örn. düzenleme modunda farklı bir alana odaklanmak gerektiğinde). */
  @Input({ transform: booleanAttribute }) appAutofocus = true;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (!this.appAutofocus) {
      return;
    }

    setTimeout(() => this.elementRef.nativeElement.focus(), 0);
  }
}