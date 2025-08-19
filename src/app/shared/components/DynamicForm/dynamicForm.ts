import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicField } from '@shared/models/dynamic-field';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamicForm.html'
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: DynamicField[] = [];
  @Input() submitLabel: string = 'Guardar';
  @Output() formSubmit = new EventEmitter<any>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const group: any = {};
    this.fields.forEach(field => {
      group[field.name] = ['', field.validators || []];
    });
    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  getError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('email')) return 'Formato de email inválido';
    if (control?.hasError('minlength')) return 'El valor es demasiado corto';
    return '';
  }
}