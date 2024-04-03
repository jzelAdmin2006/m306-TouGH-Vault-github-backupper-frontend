import { TestBed } from '@angular/core/testing';

import { HttpSecurityService } from './http-security.service';

describe('HttpSecurityService', () => {
  let service: HttpSecurityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpSecurityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
