import { Injectable, signal } from '@angular/core';

/** Sidebar'ın masaüstünde daraltma, mobilde ise overlay/drawer davranışına
 * geçtiği eşik değer. `_tokens.scss` içindeki media query ile birebir
 * senkron tutulmalıdır. */
export const MOBILE_BREAKPOINT_PX = 768;

/**
 * Ekran genişliğini izleyip mobil/masaüstü durumunu signal olarak sunan
 * servis. Sidebar ve Topbar bileşenleri, mobilde farklı bir navigasyon
 * davranışı (overlay + hamburger buton) sergileyebilmek için bu servisi
 * kullanır.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly mobile = signal<boolean>(this.getIsMobile());

  readonly isMobile = this.mobile.asReadonly();

  constructor() {
    window.addEventListener('resize', () => {
      this.mobile.set(this.getIsMobile());
    });
  }

  private getIsMobile(): boolean {
    return window.innerWidth <= MOBILE_BREAKPOINT_PX;
  }
}