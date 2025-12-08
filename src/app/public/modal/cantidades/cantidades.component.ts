import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RowInfo } from '../../../components/row-info/row-info';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormDataService } from '../../../services/form-data.service';
import { RegistrarCliente } from '../../../entity/RegistrarCliente';
import { Respuesta } from '../../../entity/Respuesta';
import { ToastService } from '../../../services/toast.service';
import { HttpService } from '../../../services/http.service';
import { HttpErrorResponse } from '@angular/common/http';

declare global {
  interface Window {
    initRangeSliders: () => void;
  }
}

declare global {
  interface Window {
    _touchHandler?: EventListenerOrEventListenerObject;
  }
}

@Component({
  selector: 'app-cantidades',
  imports: [RowInfo, RouterLink, ReactiveFormsModule],
  templateUrl: './cantidades.component.html',
  styleUrl: './cantidades.component.scss',
})
export class CantidadesComponent implements OnInit, AfterViewInit {

  private fb = inject(FormBuilder);
  private formDataSrv = inject(FormDataService);
  private router = inject(Router);
  private http = inject(HttpService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    precio: ['5000', [Validators.required]],
    tiempo: ['18', [Validators.required]]
  });

  private registrarCliente: RegistrarCliente | null = null;
  public cargando = false;

  ngOnInit() {
    this.iniciarRange();
    if (!this.formDataSrv.registrarClienteData()) {
      this.router.navigate(['/encontrar']);
    }
  }

  ngAfterViewInit() {
    this.iniciarRange();
  }

  iniciarRange() {
    window.initRangeSliders();

    setTimeout(() => {
      const sliders = document.querySelectorAll<HTMLElement>('.range-slider');
      sliders.forEach(slider => {
        if (!window._touchHandler) return; // Previene undefined
        slider.removeEventListener('touchmove', window._touchHandler);
        slider.addEventListener('touchmove', window._touchHandler, { passive: true });
      });
    }, 0);

    document.addEventListener('precioChanged', (e: Event) => {
      const event = e as CustomEvent<number>;
      this.form.get('precio')?.setValue(event.detail + "");
    }, { passive: true });

    document.addEventListener('tiempoChanged', (e: Event) => {
      const event = e as CustomEvent<number>;
      this.form.get('tiempo')?.setValue(event.detail + "");
    }, { passive: true });
  }

  registrar() {
    this.cargando = true;
    this.registrarCliente = this.formDataSrv.registrarClienteData();
    if (this.registrarCliente) {
      this.registrarCliente.montominimo = 100;
      // this.registrarCliente.montomaximo = Number(this.form.value.precio);
      this.registrarCliente.montomaximo = 500;
      this.registrarCliente.plazominimo = 30;
      // this.registrarCliente.plazomaximo = Number(this.form.value.tiempo) * 30;
      this.registrarCliente.plazomaximo = 120;
      this.http.post("registro/registrar", this.registrarCliente)
        .subscribe({
          next: (resp) => this.despuesDeRegistrarCliente(resp),
          error: (err) => this.atraparErrores(err)
        });
    } else {
      this.mostarMensajeToast('No existe informacion del cliente');
      this.router.navigate(['/encontrar']);
    }
  }

  despuesDeRegistrarCliente(data: object) {
    const respuesta: Respuesta = new Respuesta(data);
    if (respuesta && respuesta.data && respuesta.data.procesoid) {
      const id = respuesta.data.procesoid;
      this.formDataSrv.setProcesoId(respuesta.data.procesoid);
      this.formDataSrv.setEntidades(respuesta);
      this.resgistrarProceso(id);
    } else {
      this.formDataSrv.setProcesoId(null);
      this.formDataSrv.setEntidades(null);
      this.router.navigate(['/encontrar/sinresultados']);
    }
  }

  resgistrarProceso(id: string) {
    this.http.get(`registro/procesar/${id}`)
      .subscribe({
        next: (resp) => this.despuesDeRegistrarProceso(resp),
        error: (err) => this.atraparErrores(err)
      });
  }

  despuesDeRegistrarProceso(data: object) {
    const respuesta: Respuesta = new Respuesta(data);
    if (respuesta && respuesta.succeeded && respuesta.data) {
      this.cargando = false;
      this.router.navigate(['/encontrar/contacto']);
    } else {
      this.router.navigate(['/encontrar/sinresultados']);
    }
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
