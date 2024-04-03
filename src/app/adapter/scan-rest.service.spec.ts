import { TestBed } from '@angular/core/testing';

import { ScanRestService } from './scan-rest.service';

describe('ScanRestService', () => {
  let service: ScanRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScanRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
