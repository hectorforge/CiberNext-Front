import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseService } from '@features/cursos/services/course-service';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';
import { DynamicField } from '@shared/models/dynamic-field';
import { Course } from '@features/cursos/models/Course';

@Component({
  selector: 'app-course-create',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './course-create-page.html'
})
export class CourseCreatePage {
  fields: DynamicField[] = [
    { id: 1, name: 'codigo', label: 'Código', type: 'text', placeholder: 'Ej: CS101', validators: [] },
    { id: 2, name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre del curso', validators: [] },
    { id: 3, name: 'descripción', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del curso', validators: [] }
  ];

  constructor(private courseService: CourseService, private router: Router) {}

  onSubmit(data: Course) {
    this.courseService.create(data).subscribe(() => this.router.navigate(['/courses']));
  }
}