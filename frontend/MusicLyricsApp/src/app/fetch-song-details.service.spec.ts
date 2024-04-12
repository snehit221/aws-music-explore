import { TestBed } from '@angular/core/testing';

import { FetchSongDetailsService } from './fetch-song-details.service';

describe('FetchSongDetailsService', () => {
  let service: FetchSongDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchSongDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
