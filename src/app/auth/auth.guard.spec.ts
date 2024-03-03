import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let oidcSecurityServiceSpy: jasmine.SpyObj<OidcSecurityService>;

  beforeEach(() => {
    oidcSecurityServiceSpy = jasmine.createSpyObj('OidcSecurityService', ['checkAuth', 'authorize']);
    TestBed.configureTestingModule({
      providers: [{ provide: OidcSecurityService, useValue: oidcSecurityServiceSpy }],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('canActivate is true for authenticated user', (done) => {
    oidcSecurityServiceSpy.checkAuth.and.returnValue(
        of({ isAuthenticated: true }) as Observable<LoginResponse>,
    );

    guard.canActivate().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('canActivate is false for unauthenticated user', (done) => {
    oidcSecurityServiceSpy.checkAuth.and.returnValue(
        of({ isAuthenticated: false }) as Observable<LoginResponse>,
    );

    guard.canActivate().subscribe((result) => {
      expect(result).toBeFalse();
      expect(oidcSecurityServiceSpy.authorize).toHaveBeenCalled();
      done();
    });
  });

  it('login calls authorization correctly', () => {
    guard.login();

    expect(oidcSecurityServiceSpy.authorize).toHaveBeenCalled();
  });
});
