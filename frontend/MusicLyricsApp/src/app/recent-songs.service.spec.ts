import { TestBed } from '@angular/core/testing';

import { RecentSongsService } from './recent-songs.service';

describe('RecentSongsService', () => {
  let service: RecentSongsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentSongsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
