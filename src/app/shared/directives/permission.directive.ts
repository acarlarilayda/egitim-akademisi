import { Directive, Input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { SessionService } from '../../core/services/session.service';
import { UserRole } from '../../core/models/enums';

/**
 * `*appPermission` — yapısal directive (`*ngIf` ile aynı mantık).
 *
 * Aktif kullanıcının rolü verilen rol listesinde değilse, içerik DOM'a hiç
 * eklenmez (gizlenmez, tamamen kaldırılır).
 *
 * Kullanım:
 * ```html
 * <button *appPermission="[UserRole.EgitimYoneticisi]">+ Yeni Kurs</button>
 * ```
 */
@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class PermissionDirective {
  private allowedRoles: UserRole[] = [];
  private hasView = false;

  @Input()
  set appPermission(roles: UserRole[]) {
    this.allowedRoles = roles ?? [];
    this.updateView();
  }

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly sessionService: SessionService
  ) {
    // Rol demo değiştiriciyle anlık değiştiğinde görünürlük yeniden hesaplanır.
    effect(() => {
      this.sessionService.currentRole();
      this.updateView();
    });
  }

  private updateView(): void {
    const isAllowed = this.sessionService.hasRole(this.allowedRoles);

    if (isAllowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAllowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}