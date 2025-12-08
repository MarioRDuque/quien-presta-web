import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Sponsors } from '../../components/sponsors/sponsors';
import { Slot } from '../../components/slot/slot';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { Indicadores } from '../../entity/Indicadores';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { APP_CONFIG } from '../../../config';
import { Publicidad } from '../../entity/Publicidad';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    Sponsors,
    Slot,
    Footer,
    Header,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private httpBackend = inject(HttpBackend);

  // HttpClient SIN interceptores
  private httpSinInterceptors = new HttpClient(this.httpBackend);

  public indicadores: Indicadores = new Indicadores();
  public publicidad: Publicidad = new Publicidad();

  @ViewChild('comofunciona') comofuncionaSection!: ElementRef;
  @ViewChild('comparaentidades') comparaEntidadesSection!: ElementRef;
  @ViewChild('comparayelegie') comparayelegieSection!: ElementRef;

  ngOnInit(): void {
    this.listarIndicadores();
    this.listarPublicidad();
  }

  irAComoFunciona() {
    this.comofuncionaSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  irAcomparaEntidades() {
    this.comparaEntidadesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  irAcomparaYElige() {
    this.comparayelegieSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  listarIndicadores() {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${APP_CONFIG.tokensite}`);
    this.httpSinInterceptors.get(`${APP_CONFIG.apiSite}/site/indicadores`, { headers })
      .subscribe({
        next: resp => this.despuesDeListarIndicadores(resp),
        error: err => this.atraparErrores(err)
      });
  }

  listarPublicidad() {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${APP_CONFIG.tokensite}`);
    this.httpSinInterceptors.get(`${APP_CONFIG.apiSite}/site/publicidad`, { headers })
      .subscribe({
        next: resp => this.despuesDeListarPublicidad(resp),
        error: err => this.atraparErrores(err)
      });
  }

  despuesDeListarIndicadores(data: object) {
    this.indicadores = new Indicadores(data);
    this.cdr.detectChanges();
  }

  despuesDeListarPublicidad(data: object) {
    this.publicidad = new Publicidad(data);
    this.cdr.detectChanges();
  }

  atraparErrores(err: HttpErrorResponse) {
    this.mostarMensajeToast(err?.error?.message || err.message);
  }

  mostarMensajeToast(err: string) {
    this.toast.warn(err);
    this.cdr.detectChanges();
  }

}
