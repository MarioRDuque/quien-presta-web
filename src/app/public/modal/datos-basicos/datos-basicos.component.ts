import { Component, inject } from '@angular/core';
import { RowInfo } from '../../../components/row-info/row-info';
import { Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Errors } from '../../../directives/errors';
import { MaxLengthDinamyc } from '../../../directives/max-length-dinamyc';
import { FormDataService } from '../../../services/form-data.service';
import { RegistrarCliente } from '../../../entity/RegistrarCliente';

@Component({
  selector: 'app-datos-basicos',
  imports: [RowInfo, ReactiveFormsModule, Errors, MaxLengthDinamyc],
  templateUrl: './datos-basicos.component.html',
  styleUrl: './datos-basicos.component.scss',
})
export class DatosBasicosComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private formDataSrv = inject(FormDataService);

  form = this.fb.group({
    tipodocumento: this.fb.control<'D' | 'CE'>('D', Validators.required),
    numerodocumento: ['', [Validators.required]]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data: RegistrarCliente = this.form.value as RegistrarCliente;
    this.formDataSrv.setRegistrarCliente(data);
    this.router.navigate(['/encontrar/cantidades']);
  }

  onTypeChange() {
    this.form.get('documentNumber')?.updateValueAndValidity();
  }

}
