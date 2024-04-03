import { TestBed } from '@angular/core/testing';

import { BackupRestService } from './backup-rest.service';

describe('BackupRestService', () => {
  let service: BackupRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackupRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
