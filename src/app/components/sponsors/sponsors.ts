import { HttpHeaders, HttpErrorResponse, HttpBackend, HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../../config';
import { ToastService } from '../../services/toast.service';
import { Logo } from '../../entity/Logo';

interface WebflowModule {
  init?: () => void;
  destroy?: () => void;
}

declare global {
  interface Window {
    Webflow: {
      push(fn: () => void): void;
      destroy(): void;
      ready(): () => void;
      require(moduleName: string): WebflowModule | undefined;
    };
  }
}

@Component({
  selector: 'app-sponsors',
  imports: [RouterLink],
  templateUrl: './sponsors.html',
  styleUrl: './sponsors.scss',
})
export class Sponsors implements OnInit, AfterViewInit {

  private router = inject(Router);
  private ngZone = inject(NgZone);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private httpBackend = inject(HttpBackend);

  // HttpClient SIN interceptores
  private httpSinInterceptors = new HttpClient(this.httpBackend);
  public logos: Logo = new Logo();

  ngOnInit(): void {
    this.listarLogos();
    this.reiniciarWebflow();
  }

  ngAfterViewInit() {
    const observer = new MutationObserver(() => {
      this.reiniciarWebflow();
    });
    const target = document.querySelector('.logo_component-slider');
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    }
    this.reiniciarWebflow();
  }

  private reiniciarWebflow() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (!window.Webflow) return;

        window.Webflow.destroy();
        window.Webflow.ready();

        const ix2 = window.Webflow.require('ix2');
        ix2?.init?.();
      }, 50); // 50ms para asegurar DOM final
    });
  }

  listarLogos() {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${APP_CONFIG.tokensite}`);

    this.httpSinInterceptors.get(`${APP_CONFIG.apiSite}/site/logos`, { headers })
      .subscribe({
        next: resp => this.despuesDeListarLogos(resp),
        error: err => this.atraparErrores(err)
      });
  }

  despuesDeListarLogos(data: object) {
    this.logos = new Logo(data);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.reiniciarWebflow();
      this.scrollSuaveSutil(1);
    }, 300);
  }

  atraparErrores(err: HttpErrorResponse) {
    this.mostarMensajeToast(err?.error?.message || err.message);
  }

  mostarMensajeToast(err: string) {
    this.toast.warn(err);
    this.cdr.detectChanges();
  }

  scrollSuaveSutil(target: number, duracion = 500) {
    const inicio = window.scrollY;
    const distancia = target - inicio;
    const startTime = performance.now();
    const animar = (tiempoActual: number) => {
      const progreso = Math.min((tiempoActual - startTime) / duracion, 1);
      // Movimiento más suave con easing
      const ease = 1 - Math.pow(1 - progreso, 3);
      window.scrollTo(0, inicio + distancia * ease);
      if (progreso < 1) {
        requestAnimationFrame(animar);
      }
    };
    requestAnimationFrame(animar);
  }

}
