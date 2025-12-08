import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { NgControl, FormGroupDirective } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[appErrors]',
})
export class Errors implements OnInit, OnDestroy {

  private ngControl = inject(NgControl, { optional: true });
  private host = inject(ElementRef);
  private renderer = inject(Renderer2);
  private formGroup = inject(FormGroupDirective, { optional: true, host: true });

  private subs: Subscription[] = [];
  private errorContainer!: HTMLElement;

  ngOnInit() {
    if (!this.ngControl) return;

    // Contenedor de errores
    this.errorContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.errorContainer, 'error-container');

    const parent = this.renderer.parentNode(this.host.nativeElement);
    this.renderer.insertBefore(parent, this.errorContainer, this.renderer.nextSibling(this.host.nativeElement));

    // Observa cambios del control
    if (this.ngControl.valueChanges) {
      this.subs.push(this.ngControl.valueChanges.subscribe(() => this.updateErrors()));
    }

    if (this.ngControl.statusChanges) {
      this.subs.push(this.ngControl.statusChanges.subscribe(() => this.updateErrors()));
    }

    // Captura blur (esto arregla el select nativo)
    this.subs.push(
      fromEvent(this.host.nativeElement, 'blur').subscribe(() => {
        this.ngControl?.control?.markAsTouched();
        this.updateErrors();
      })
    );

    // Submit del formulario
    if (this.formGroup) {
      this.subs.push(
        this.formGroup.ngSubmit.subscribe(() => {
          this.ngControl?.control?.markAsTouched();
          this.updateErrors();
        })
      );
    }
  }

  private updateErrors() {
    this.errorContainer.innerHTML = '';

    const errors = this.ngControl?.errors;
    const touched = this.ngControl?.touched;
    if (!errors || !touched) return;

    // Si hay nuestro error, mostrar solo ese
    if (errors['appDocumentLength']) {
      const info = errors['appDocumentLength'];
      this.addError(`Debe tener exactamente ${info.required} dígitos (actual: ${info.actual}).`);
      return;
    }

    // sino iterar otros
    for (const key of Object.keys(errors)) {
      const msg = this.getErrorMessage(key, errors[key]);
      if (msg) this.addError(msg);
    }
  }


  private addError(message: string) {
    const small = this.renderer.createElement('small');
    const text = this.renderer.createText(message);

    this.renderer.addClass(small, 'error-text');
    this.renderer.appendChild(small, text);
    this.renderer.appendChild(this.errorContainer, small);
  }

  private getErrorMessage(key: string, info: Record<string, unknown>): string | null {
    switch (key) {
      case 'required':
        return 'Este campo es obligatorio.';
      case 'minlength':
        return `Debe tener al menos ${info['requiredLength']} dígitos.`;
      case 'email':
        return `Este campo debe ser un email.`;
      case 'maxlength':
        return `No puede exceder ${info['requiredLength']} dígitos.`;
      case 'appDocumentLength':
        return `Debe tener exactamente ${info['requiredLength']} dígitos (actual: ${info['actualLength']}).`;
      default:
        return null;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
