import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface NotificationMessage {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationMessage>();

  constructor() { }

  getNotificationObservable(): Observable<NotificationMessage> {
    return this.notificationSubject.asObservable();
  }

  showSuccess(message: string, duration: number = 3000) {
    this.notificationSubject.next({ type: 'success', message, duration });
  }

  showError(message: string, duration: number = 5000) {
    this.notificationSubject.next({ type: 'error', message, duration });
  }

  showInfo(message: string, duration: number = 3000) {
    this.notificationSubject.next({ type: 'info', message, duration });
  }
}
