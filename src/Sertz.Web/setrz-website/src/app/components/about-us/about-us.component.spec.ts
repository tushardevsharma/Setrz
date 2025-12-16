import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutUsComponent } from './about-us.component';

describe('AboutUsComponent', () => {
  let component: AboutUsComponent;
  let fixture: ComponentFixture<AboutUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "About Us" title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('About Us');
  });

  it('should display two co-founder cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.cofounder-card').length).toBe(2);
  });

  it('should display co-founder names and titles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cofounderNames = compiled.querySelectorAll('.cofounder-card h2');
    const cofounderTitles = compiled.querySelectorAll('.cofounder-card h3');

    expect(cofounderNames[0].textContent).toContain('Co-founder One');
    expect(cofounderTitles[0].textContent).toContain('CEO');
    expect(cofounderNames[1].textContent).toContain('Co-founder Two');
    expect(cofounderTitles[1].textContent).toContain('CTO');
  });
});