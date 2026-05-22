import { TestBed } from '@angular/core/testing';

import { AudioProcessingService } from './audio-processing.service';

describe('AudioProcessingService', () => {
  let service: AudioProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
