import { Injectable } from '@angular/core';

/**
 * Generic (genel amaçlı) localStorage servisi.
 * Herhangi bir model tipi için veri okuma/yazma işlemlerini tek bir yerden
 * yönetir. Böylece her yeni model için localStorage kodu tekrar yazılmaz.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Belirtilen key'e karşılık gelen veriyi localStorage'dan okur.
   * Veri yoksa boş bir dizi döner.
   */
  getItem<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  /**
   * Verilen diziyi localStorage'a JSON olarak kaydeder.
   */
  setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Belirtilen key'de veri yoksa (localStorage boşsa), verilen başlangıç
   * verisini (seed data) yükler. Veri zaten varsa hiçbir şey yapmaz.
   */
  seedIfEmpty<T>(key: string, seedData: T[]): void {
    const existing = localStorage.getItem(key);
    if (!existing) {
      this.setItem(key, seedData);
    }
  }
}