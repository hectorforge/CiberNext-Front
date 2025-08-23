import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '@features/cursos/services/course-service';
import { Course } from '@features/cursos/models/Course';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-list-page.html'
})
export class CourseListPage implements OnInit {
  courses: Course[] = [];
  loading = true;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getAll().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar cursos', err);
        this.loading = false;
      }
    });
  }

  deleteCourse(id: number) {
    if (confirm('¿Seguro que quieres eliminar este curso?')) {
      this.courseService.delete(id).subscribe(() => this.loadCourses());
    }
  }
}
