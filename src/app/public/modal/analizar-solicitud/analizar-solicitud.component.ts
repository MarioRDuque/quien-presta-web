import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CompletarInformacion } from '../../../entity/CompletarInformacion';
import { HttpService } from '../../../services/http.service';
import { ToastService } from '../../../services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Respuesta } from '../../../entity/Respuesta';
import { ResultadosEntity } from '../../../entity/ResultadosEntity';

@Component({
  selector: 'app-analizar-solicitud',
  imports: [RouterLink],
  templateUrl: './analizar-solicitud.component.html',
  styleUrl: './analizar-solicitud.component.scss',
})
export class AnalizarSolicitud implements OnInit, AfterViewInit {

  private formDataSrv = inject(FormDataService);
  private router = inject(Router);
  private http = inject(HttpService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  public mostrarBoton = false;
  public respuesta: Respuesta | null = new Respuesta();
  private contacto: CompletarInformacion | null = null;

  @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>;
  @ViewChild('progressText') progressText!: ElementRef<HTMLParagraphElement>;
  @ViewChild('evaluationCard') evaluationCard!: ElementRef<HTMLDivElement>;
  @ViewChild('evaluationLogo') evaluationLogo!: ElementRef<HTMLImageElement>;
  @ViewChild('evaluationTitle') evaluationTitle!: ElementRef<HTMLHeadingElement>;
  @ViewChild('evaluationSubtext') evaluationSubtext!: ElementRef<HTMLParagraphElement>;

  elementos!: {
    barra: HTMLElement;
    textoProgreso: HTMLElement;
    tarjeta: HTMLElement;
    logo: HTMLImageElement;
    entidad: HTMLElement;
    condiciones: HTMLElement;
  };
  estados: { entidad: string; condiciones: string; logo: string }[] = [];

  progresoActual = 0;
  totalTareas = 0;
  tareasRealizadas = 0;

  ngOnInit(): void {
    this.respuesta = this.formDataSrv.entidades();
    this.totalTareas = this.respuesta?.data?.total || 0;
    this.totalTareas++;
  }

  ngAfterViewInit(): void {
    this.estados = this.respuesta?.data?.entidades || [];
    this.elementos = this.obtenerElementosDom();
    this.iniciarAnimacionEstados();
    this.completarInformacion();
  }

  aumentarProgreso() {
    this.progresoActual += Math.floor(100 / this.totalTareas);
    if (this.progresoActual > 100) this.progresoActual = 100;

    this.progressBar.nativeElement.style.width = `${this.progresoActual}%`;
    this.progressText.nativeElement.textContent = `${this.progresoActual}% completado`;

    if (this.progresoActual === 100) {
      this.mostrarBoton = true;
      this.cdr.detectChanges();
    }
  }

  completarInformacion() {
    this.contacto = this.formDataSrv.completarInformacionData();

    if (!this.contacto) {
      this.toast.warn('No existe informacion del cliente');
      this.router.navigate(['encontrar']);
      return
    }
    this.tareasRealizadas++;
    this.http.post("registro/completar/" + this.formDataSrv.processId(), this.contacto)
      .subscribe({
        next: () => {
          this.aumentarProgreso();          // +50% al completarse
          this.obtenerResultados();         // comienza espera con polling
        },
        error: (err) => this.atraparErrores(err)
      });
  }

  obtenerResultados() {
    this.tareasRealizadas++;
    this.http.get("resultados/obtener/" + this.formDataSrv.processId())
      .subscribe({
        next: (resp) => this.despuesDeObtenerResultados(resp),
        error: (err) => this.atraparErrores(err)
      });
  }

  despuesDeObtenerResultados(resp: object) {
    const resultados: ResultadosEntity = new ResultadosEntity(resp);
    if (resultados?.data?.finalizo) {
      this.formDataSrv.setResultados(resultados);
      if (this.totalTareas != this.tareasRealizadas) {
        let contador = this.tareasRealizadas;
        const interval = setInterval(() => {
          this.aumentarProgreso();
          contador++;
          if (contador > this.totalTareas) {
            clearInterval(interval); // detiene el intervalo
          }
        }, 1000);
      } else {
        this.aumentarProgreso();
      }
    } else {
      setTimeout(() => this.obtenerResultados(), 1200); // polling cada 1.2s
    }
  }

  iniciarAnimacionEstados() {
    let i = 0;
    const cambiarEstado = () => {
      if (i >= this.estados.length) return;
      const estado = this.estados[i];

      this.evaluationTitle.nativeElement.textContent = estado.entidad;
      this.evaluationSubtext.nativeElement.textContent = estado.condiciones;
      this.evaluationLogo.nativeElement.src = estado.logo;

      this.evaluationCard.nativeElement.classList.add('fade-in');
      setTimeout(() => this.evaluationCard.nativeElement.classList.remove('fade-in'), 600);
      i++;
      if (!this.mostrarBoton) setTimeout(cambiarEstado, 2500);
    };
    cambiarEstado();
  }

  atraparErrores(err: HttpErrorResponse) {
    this.toast.warn(err?.error?.message || err.message);
    this.router.navigate(['/encontrar/contacto']);
  }

  obtenerElementosDom() {
    return {
      barra: this.progressBar.nativeElement,
      textoProgreso: this.progressText.nativeElement,
      tarjeta: this.evaluationCard.nativeElement,
      logo: this.evaluationLogo.nativeElement,
      entidad: this.evaluationTitle.nativeElement,
      condiciones: this.evaluationSubtext.nativeElement,
    };
  }

}
