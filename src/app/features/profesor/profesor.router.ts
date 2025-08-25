import { Routes } from '@angular/router';
import { ListarProfesoresComponent } from './pages/listar-profesores/listar-profesores';
//import { CrearProfesoresComponent } from './pages/crear-profesores/crear-profesores';
import { EditarProfesorComponent } from './pages/editar-profesores/editar-profesores';
import { VerProfesorComponent } from './pages/ver-profesores/ver-profesores';
import { DashboardTeacher } from './pages/dashboard/dashboard';

export const routesi: Routes = [
  
  { path: '', component: ListarProfesoresComponent },
  //{ path: 'nuevo', component: CrearProfesoresComponent },
  { path: 'editar/:id', component: EditarProfesorComponent },
  { path: 'ver/:id', component: VerProfesorComponent },
];