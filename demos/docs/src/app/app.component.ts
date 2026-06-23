import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shell/navbar.component';

@Component({
  selector: 'cpa-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <cpa-navbar />
    <div class="app-content">
      <router-outlet />
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      .app-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class AppComponent {}
