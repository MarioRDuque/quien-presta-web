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

  private externalWin: Window | null = null;
  private externalWinName = `extWindow-${Math.random().toString(36).slice(2, 9)}`;

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
      const resultadosOrdenadorPorPrioridad: Oferta[] = (this.resultados?.data?.resultados ?? [])
        .filter(o => o.resultado)
        .sort((a, b) => b.prioridad - a.prioridad);
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
      this.openPendingWindow();
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

  openPendingWindow() {
    this.externalWin = window.open('about:blank', this.externalWinName);
    if (!this.externalWin) {
      alert('Por favor habilita ventanas emergentes (popups) para continuar.');
    }
  }

  postToExternal() {
    const win = this.externalWin;
    const name = this.externalWinName;
    const url = this.selected()?.url || '';
    const datos = this.selected()?.informacion || '';
    const procesoid = this.formDataSrv.processId() || '';
    const entidadid = this.selected()?.id || '';
    
    if (!win) {
      alert('No se pudo abrir la ventana de destino. Habilita popups e inténtalo de nuevo.');
      return;
    }
    const html = `
    <html>
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${this.escapeHtml(url)}">
          <input type="hidden" name="datos" value="${this.escapeHtml(datos)}" />
          <input type="hidden" name="procesoid" value="${this.escapeHtml(procesoid)}" />
          <input type="hidden" name="entidadid" value="${this.escapeHtml(entidadid)}" />
        </form>
      </body>
    </html>
  `;
    // --- INTENTO A: escribir directamente en la ventana (funciona en muchos casos) ---
    try {
      // algunos navegadores permiten esto; si falla, cae al catch
      win.document.open();
      win.document.write(html);
      win.document.close();
      this.externalWin = null;
      return;
    } catch (err) {
      console.warn('write to new window failed, will try submit-target fallback', err);
    }
    // --- INTENTO B: crear form en la ventana padre con target = nombre de la ventana abierta ---
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.target = name; // <- el truco: target al nombre de la ventana que abrimos en el click
      const addField = (n: string, v: string) => {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = n;
        i.value = v;
        form.appendChild(i);
      };
      addField('datos', datos);
      addField('procesoid', procesoid);
      addField('entidadid', entidadid);
      document.body.appendChild(form);

      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.style.display = 'none';
      form.appendChild(btn);
      btn.click();
      setTimeout(() => {
        form.remove();
      }, 1000);

      this.externalWin = null;
      return;
    } catch (err) {
      console.warn('fallback submit-to-named-window failed', err);
    }

    // --- INTENTO C: fallback final: abrir en la misma ventana (si aceptable) ---
    try {
      const tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = url;

      const add = (n: string, v: string) => {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = n;
        i.value = v;
        tempForm.appendChild(i);
      };
      add('datos', datos); add('procesoid', procesoid); add('entidadid', entidadid);

      document.body.appendChild(tempForm);
      tempForm.submit();
    } catch (err) {
      console.error('all attempts failed', err);
      alert('No fue posible abrir la página de la entidad. Revisa tu navegador y habilita ventanas emergentes.');
    }
  }

  escapeHtml(s: string) {
    return (s || '').replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
