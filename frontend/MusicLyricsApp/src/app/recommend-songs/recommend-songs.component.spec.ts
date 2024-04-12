import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendSongsComponent } from './recommend-songs.component';

describe('RecommendSongsComponent', () => {
  let component: RecommendSongsComponent;
  let fixture: ComponentFixture<RecommendSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendSongsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecommendSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
