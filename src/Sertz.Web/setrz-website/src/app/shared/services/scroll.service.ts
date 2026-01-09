import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private scrollToFormSubject = new Subject<void>();

  scrollToForm$ = this.scrollToFormSubject.asObservable();

  scrollToForm(): void {
    this.scrollToFormSubject.next();
  }
}
