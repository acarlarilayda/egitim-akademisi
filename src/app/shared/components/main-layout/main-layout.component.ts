import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="layout__content">
        <app-topbar />
        <main class="layout__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .layout__content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .layout__main {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-lg);
      background-color: var(--color-bg);
    }
  `],
})
export class MainLayoutComponent {}