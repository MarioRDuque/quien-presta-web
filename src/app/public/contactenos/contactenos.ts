import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NavModal } from '../../components/nav-modal/nav-modal';
import { Errors } from '../../directives/errors';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG } from '../../../config';
import { ToastService } from '../../services/toast.service';
import { Respuesta } from '../../entity/Respuesta';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contactenos',
  standalone: true,
  imports: [NavModal, ReactiveFormsModule, Errors],
  templateUrl: './contactenos.html',
  styleUrl: './contactenos.scss',
})
export class Contactenos {

  private fb = inject(FormBuilder);
  private httpBackend = inject(HttpBackend);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private httpSinInterceptors = new HttpClient(this.httpBackend);
  form = this.fb.group({
    nombresapellidos: ['', [Validators.required]],
    correoelectronico: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    mensaje: ['', [Validators.required]]
  });

  public cargando = false;

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${APP_CONFIG.tokensite}`);
    this.httpSinInterceptors.post(`${APP_CONFIG.apiSite}/site/contacto`, this.form.value, { headers })
      .subscribe({
        next: (resp) => this.despuesDeContacto(resp),
        error: (err) => this.atraparErrores(err)
      });
  }

  despuesDeContacto(data: object) {
    const respuesta: Respuesta = new Respuesta(data);
    if (respuesta.succeeded && respuesta.message) {
      this.toast.succes("Mensaje enviado correctamente");
      this.router.navigate(['/']);
    } else {
      this.mostarMensajeToast(respuesta.message || 'Ocurrió un error al enviar mensaje.')
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
