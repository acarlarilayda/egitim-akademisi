import { Component } from '@angular/core';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'egitim-akademisi';
}