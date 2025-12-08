import { Directive, Input, OnChanges, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appDocumentLength]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => MaxLengthDinamyc), multi: true }
  ]
})
export class MaxLengthDinamyc implements Validator, OnChanges {

  @Input() appDocumentLength: 'D' | 'CE' | null | undefined = 'D';

  private min = 8;
  private max = 8;
  private onChange?: () => void;

  ngOnChanges(): void {
    if (this.appDocumentLength === 'D') this.min = this.max = 8;
    else this.min = this.max = 9;
    this.onChange?.(); // fuerza revalidación
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString();
    if (!value) return null;
    return (value.length !== this.min) ? { appDocumentLength: { required: this.min, actual: value.length } } : null;
  }

  registerOnValidatorChange(fn: () => void) { this.onChange = fn; }
}
