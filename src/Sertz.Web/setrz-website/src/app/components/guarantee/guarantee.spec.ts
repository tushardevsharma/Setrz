import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guarantee } from './guarantee';

describe('Guarantee', () => {
  let component: Guarantee;
  let fixture: ComponentFixture<Guarantee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guarantee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guarantee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
