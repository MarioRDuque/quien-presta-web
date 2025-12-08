import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

declare global {
  interface Window {
    cerrarModal: () => void;
  }
}

@Component({
  selector: 'app-nav-modal',
  imports: [],
  templateUrl: './nav-modal.html',
  styleUrl: './nav-modal.scss',
})
export class NavModal {

  private router = inject(Router);

  public cerrarModal() {
    this.router.navigate(['/']);
    window.cerrarModal();
  }
}
