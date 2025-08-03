import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./layout/footer/footer";
import { Header } from "./layout/header/header";
import { Notificationt } from "./shered/notification/notification";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Notificationt,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('employee-management-system');
}
