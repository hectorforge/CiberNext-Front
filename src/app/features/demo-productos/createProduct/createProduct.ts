// src/app/features/productos/pages/create-product/create-product.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';
import { DynamicField } from '@shared/models/dynamic-field';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  template: `
    <div class="max-w-lg mx-auto mt-10">
      <h2 class="text-2xl font-bold mb-6 text-center">Crear nuevo producto</h2>

      <app-dynamic-form
        [fields]="fields"
        submitLabel="Crear Producto"
        (formSubmit)="handleSubmit($event)">
      </app-dynamic-form>
    </div>
  `
})
export class CreateProductComponent {

  fields: DynamicField[] = [
    /*
    {
      id: 1,
      name: 'name',
      type: 'text',
      label: 'Nombre del producto',
      placeholder: 'Ej. Laptop',
      validators: [Validators.required]
    },
    {
      id: 2,
      name: 'price',
      type: 'number',
      label: 'Precio',
      placeholder: 'Ej. 1500',
      validators: [Validators.required]
    },
    {
      id: 3,
      name: 'category',
      type: 'select',
      label: 'Categoría',
      options: [
        { value: 'electronics', label: 'Electrónica' },
        { value: 'clothes', label: 'Ropa' },
        { value: 'home', label: 'Hogar' }
      ],
      validators: [Validators.required]
    },
    {
      id: 4,
      name: 'description',
      type: 'textarea',
      label: 'Descripción',
      placeholder: 'Agrega detalles...',
      validators: [Validators.required]
    }*/
  ];

  handleSubmit(values: any) {
    console.log('Formulario enviado:', values);
  }
}