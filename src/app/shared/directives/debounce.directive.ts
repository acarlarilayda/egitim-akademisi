import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Bir input elemanına bağlanarak yazma bittikten belirli bir süre sonra
 * (varsayılan 300ms) tek bir olay yayar. Arama kutularında gereksiz API
 * çağrısını/filtrelemeyi önlemek için kullanılır (bkz. dokümanın 9. bölümü:
 * "Liste ekranlarında ... search debounce ... bulunmalıdır").
 *
 * Kullanım:
 * <input (debouncedInput)="onSearch($event)" [debounceMs]="300" />
 */
@Directive({
  selector: '[appDebounceInput]',
  standalone: true,
})
export class DebounceDirective implements OnInit, OnDestroy {
  /** Debounce süresi (ms). */
  @Input() debounceMs = 300;

  /** Debounce süresi dolduğunda ve değer gerçekten değiştiğinde tetiklenir. */
  @Output() debouncedInput = new EventEmitter<string>();

  private readonly inputSubject = new Subject<string>();
  private subscription: Subscription | null = null;

  ngOnInit(): void {
    this.subscription = this.inputSubject
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged())
      .subscribe((value) => this.debouncedInput.emit(value));
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.inputSubject.next(value);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}