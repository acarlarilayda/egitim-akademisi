import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Bir data-table sütununa özel hücre içeriği tanımlamak için kullanılır.
 * Kullanım: <ng-template dtCell="status" let-value let-row="row">...</ng-template>
 * `value` = row[columnKey], `row` = satırın tamamı.
 */
@Directive({
  selector: 'ng-template[dtCell]',
  standalone: true,
})
export class DataTableCellDirective {
  @Input('dtCell') columnKey!: string;

  constructor(public templateRef: TemplateRef<{ $implicit: unknown; row: unknown }>) {}
}