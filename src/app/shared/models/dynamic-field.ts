import { ValidatorFn } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface DynamicField {
  id: number;             // Id para cada uno lo utilizaremos para el editar y crear
  name: string;           // Nombre del control
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';  
  label: string;          // Label a mostrar
  placeholder?: string;   // Texto del placeholder
  options?: SelectOption[];     // Opciones si es select (clave : "valor")
  validators?: ValidatorFn[]; // Validaciones de Angular
}