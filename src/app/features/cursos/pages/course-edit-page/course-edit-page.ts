import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '@features/cursos/services/course-service';
import { DynamicFormComponent } from '@shared/components/DynamicForm/dynamicForm';
import { DynamicField } from '@shared/models/dynamic-field';
import { Course } from '@features/cursos/models/Course';

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './course-edit-page.html'
})
export class CourseEditPage implements OnInit {
  fields: DynamicField[] = [
    { id: 1, name: 'codigo', label: 'Código', type: 'text', placeholder: 'Ej: CS101' },
    { id: 2, name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre del curso' },
    { id: 3, name: 'descripción', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del curso' }
  ];

  initialData?: Course;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.getById(id).subscribe((data: Course) => this.initialData = data);
  }

  onSubmit(data: Course) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.update(id, data).subscribe(() => this.router.navigate(['/courses']));
  }
}