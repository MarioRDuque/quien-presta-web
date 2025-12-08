import { Component, inject, OnInit } from '@angular/core';
import { RowInfo } from '../../../components/row-info/row-info';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Errors } from '../../../directives/errors';
import { FormDataService } from '../../../services/form-data.service';
import { CompletarInformacion } from '../../../entity/CompletarInformacion';

@Component({
  selector: 'app-datos-contacto',
  imports: [RowInfo, ReactiveFormsModule, Errors],
  templateUrl: './datos-contacto.component.html',
  styleUrl: './datos-contacto.component.scss',
})
export class DatosContactoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private formDataSrv = inject(FormDataService);

  form = this.fb.group({
    nombresapellidos: ['', [Validators.required]],
    correoelectronico: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (!this.formDataSrv.registrarClienteData()) {
      this.router.navigate(['/encontrar']);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data: CompletarInformacion = this.form.getRawValue() as CompletarInformacion;
    this.formDataSrv.setCompletarInformacion(data);
    this.router.navigate(['/encontrar/analizar']);
  }

}
