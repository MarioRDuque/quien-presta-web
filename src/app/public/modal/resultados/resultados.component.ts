import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormDataService } from '../../../services/form-data.service';
import { ResultadosEntity } from '../../../entity/ResultadosEntity';
import { Router, RouterLink } from '@angular/router';
import { Oferta } from '../../../entity/Oferta';
import { HttpService } from '../../../services/http.service';
import { ToastService } from '../../../services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Respuesta } from '../../../entity/Respuesta';

@Component({
  selector: 'app-resultados',
  imports: [CommonModule, RouterLink],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.scss',
})
export class Resultados implements OnInit, OnDestroy {

  private formDataSrv = inject(FormDataService);
  public resultados: ResultadosEntity | null = new ResultadosEntity();
  private router = inject(Router);
  private http = inject(HttpService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  public TOP3: Oferta[] = [];
  public MAS_RESULTS: Oferta[] = [];
  public SIMILAR: Oferta[] = [];

  // --- UI state (signals) ---
  moreExpanded = signal(false);
  cargando = false;
  selected = signal<Oferta | null>(null);

  // responsive detection
  private mq!: MediaQueryList;
  isMobile = signal(false);
  resizeHandler = () => this.isMobile.set(this.matchMobile());

  topOffers = computed(() => {
    const resultado = this.TOP3.find(o => o.resultado);
    const nonFeatured = this.TOP3.filter(o => !o.resultado);
    if (this.isMobile()) {
      return resultado ? [resultado, ...nonFeatured] : [...this.TOP3];
    } else {
      // on desktop, try to place resultado in center if exists and there are >=3
      if (resultado && nonFeatured.length >= 2) {
        return [nonFeatured[0], resultado, nonFeatured[1]];
      }
      return [...this.TOP3];
    }
  });

  colsClass = computed(() => {
    return this.isMobile() ? 'cols-1' : `cols-${this.topOffers().length}`;
  });

  ngOnInit(): void {
    this.mq = window.matchMedia('(max-width: 900px)');
    this.isMobile.set(this.matchMobile());
    this.mq.addEventListener('change', this.resizeHandler);
    this.resultados = this.formDataSrv.resultados();
    if (this.resultados && this.resultados.data) {
      const resultadosOrdenadorPorPrioridad: Oferta[] = this.resultados?.data?.resultados.sort((a, b) => a.prioridad - b.prioridad);
      if (resultadosOrdenadorPorPrioridad) {
        if (resultadosOrdenadorPorPrioridad.length > 3) {
          this.TOP3 = resultadosOrdenadorPorPrioridad.slice(0, 3);
          this.establecerMasRecomendada(this.TOP3);
          this.MAS_RESULTS = resultadosOrdenadorPorPrioridad.slice(3);
        } else {
          this.TOP3 = resultadosOrdenadorPorPrioridad;
        }
      }
    } else {
      this.router.navigate(['/encontrar/sinresultados']);
    }
  }

  establecerMasRecomendada(top3: Oferta[]) {
    let yaHayResultadoTrue = false;
    top3.forEach(element => {
      if (yaHayResultadoTrue && element.resultado) {
        element.resultado = false;
      } else {
        yaHayResultadoTrue = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.mq.removeEventListener('change', this.resizeHandler);
  }

  matchMobile() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  formatPEN(n: number) {
    return `S/. ${Number(n).toLocaleString('es-PE')}`;
  }

  toggleMore() {
    this.moreExpanded.update(v => !v);
  }

  chooseOffer(offer: Oferta) {
    const pasosPorOrden = offer?.pasos?.sort((a, b) => a.orden - b.orden);
    offer.pasos = pasosPorOrden;
    this.selected.set(offer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volverAResultados() {
    this.selected.set(null);
  }

  confAmount = computed(() => this.selected() ? this.selected()!.monto : 'S/ --');
  confTerm = computed(() => this.selected() ? this.selected()!.plazo : '--');
  confRate = computed(() => this.selected() ? this.selected()!.tasa : '--');

  get moreOffers() {
    return this.MAS_RESULTS;
  }

  get similarOffers() {
    return this.SIMILAR;
  }

  notificar() {
    this.cargando = true;
    if (this.selected()) {
      this.http.get(`resultados/notificar/${this.formDataSrv.processId()}/` + this.selected()?.id)
        .subscribe({
          next: (resp) => this.despuesDeNotificar(resp),
          error: (err) => this.atraparErrores(err)
        });
    } else {
      this.mostarMensajeToast('No existe informacion del cliente');
      this.router.navigate(['/encontrar']);
    }
  }

  despuesDeNotificar(data: object) {
    const respuesta: Respuesta = new Respuesta(data);
    this.cargando = false;
    this.cdr.detectChanges();
    if (respuesta && respuesta.succeeded && respuesta.data) {
      this.toast.succes(respuesta.message || 'Notificado correctamente');
      this.router.navigate(['/encontrar']);
      this.postToExternal();
    } else {
      this.toast.warn(respuesta.message || 'Error al notificar');
    }
  }

  postToExternal() {
    const url = this.selected()?.url || "";
    const newWindow = window.open(url, "_blank");

    if (!newWindow) {
      alert("Habilita las ventanas emergentes.");
      return;
    }

    // Ahora sí creas y envías el formulario dentro de la nueva ventana
    const form = newWindow.document.createElement('form');
    form.method = "POST";
    form.action = url;

    const addField = (name: string, value: string) => {
      const input = newWindow.document.createElement('input');
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addField("datos", this.selected()?.informacion || "");
    addField("procesoid", this.formDataSrv.processId() || "");
    addField("entidadid", this.selected()?.id || "");

    newWindow.document.body.appendChild(form);
    form.submit();
  }

  atraparErrores(err: HttpErrorResponse) {
    this.mostarMensajeToast(err?.error?.message || err.message);
  }

  mostarMensajeToast(err: string) {
    this.cargando = false;
    this.toast.warn(err);
    this.cdr.detectChanges();
  }

}
