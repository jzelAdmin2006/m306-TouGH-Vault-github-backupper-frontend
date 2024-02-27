import { TestBed } from '@angular/core/testing';

import { RepoRestService } from './repo-rest.service';

describe('RepoRestService', () => {
  let service: RepoRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepoRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
