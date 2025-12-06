import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechJourney } from './tech-journey';

describe('TechJourney', () => {
  let component: TechJourney;
  let fixture: ComponentFixture<TechJourney>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechJourney]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechJourney);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
