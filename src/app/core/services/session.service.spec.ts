import { SessionService } from './session.service';
import { UserRole } from '../models/enums';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    service = new SessionService();
  });

  it('varsayilan olarak ilk demo kullanicidan (Egitim Yoneticisi) baslar', () => {
    expect(service.currentRole()).toBe(UserRole.EgitimYoneticisi);
  });

  it('setRole ile aktif rolu degistirir', () => {
    service.setRole(UserRole.Egitmen);
    expect(service.currentRole()).toBe(UserRole.Egitmen);
  });

  it('hasRole: izin listesi tanimsizsa kisitlama yoktur, her zaman true doner', () => {
    expect(service.hasRole(undefined)).toBeTrue();
    expect(service.hasRole([])).toBeTrue();
  });

  it('hasRole: aktif rol izin listesinde varsa true doner', () => {
    service.setRole(UserRole.Egitmen);
    expect(service.hasRole([UserRole.EgitimYoneticisi, UserRole.Egitmen])).toBeTrue();
  });

  it('hasRole: aktif rol izin listesinde yoksa false doner', () => {
    service.setRole(UserRole.Katilimci);
    expect(service.hasRole([UserRole.EgitimYoneticisi])).toBeFalse();
  });

  it('setRole sonrasi secilen rol localStorage uzerinden kalici hale gelir', () => {
    service.setRole(UserRole.Katilimci);
    const newInstance = new SessionService();
    expect(newInstance.currentRole()).toBe(UserRole.Katilimci);
  });
});