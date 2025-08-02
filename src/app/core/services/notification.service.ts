import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../models/notification.models';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private defaultDuration = 5000; // 5 ثواني

  /**
   * عرض إشعار نجاح
   */
  showSuccess(title: string, message?: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }


  showError(title: string, message?: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }


  showWarning(title: string, message?: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }


  showInfo(title: string, message?: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration: duration || this.defaultDuration
    });
  }


  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }


  clearAll(): void {
    this.notificationsSubject.next([]);
  }


  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [...currentNotifications, notification];
    this.notificationsSubject.next(updatedNotifications);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }


  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
