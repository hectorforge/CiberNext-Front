import { Routes } from '@angular/router';
import { Home } from '@features/cursos/pages/home/home';
import {MainLayout} from './shared/layouts/main-layout/main-layout';
import {DetailCourse} from './features/cursos/pages/detail-course/detail-course';
import { userGuardGuard } from './core/guards/user-guard-guard';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import {DashboardAdmin } from '@features/admin/pages/dashboard';
import { Unauthorized } from './features/public/pages/unauthorized/unauthorized';
import { Contact } from '@features/public/pages/contact/contact';
import { Perfil } from '@features/auth/pages/perfil/perfil';
import { AUTH_ROUTES } from '@features/auth/auth.routes';
import { CreateProductComponent } from '@features/demo-productos/createProduct/createProduct';
import { DashboardTeacher } from '@features/profesor/pages/dashboard/dashboard';
import { Courses } from '@features/admin/pages/courses/courses';
import { Students } from '@features/admin/pages/students/students';
import { RegisterStudents } from '@features/admin/pages/register-students/register-students';
import { Teachers } from '@features/admin/pages/teachers/teachers';
import { AreaSpecialization } from '@features/admin/pages/area-specialization/area-specialization';
import { routesi } from '@features/profesor/profesor.router'; 
export const routes: Routes = [

  // Componentes para test
  {
    path:'test',
    component: CreateProductComponent
  },

  // Rutas para navegar en la pagina del estudiante (ya logeado xd)
  {
    path: 'home',
    component: MainLayout,
    children: [
      { path: '', component: Home, canActivate: [userGuardGuard],data: {roles : ['ALUMNO']}},
      {path: 'me', component: Perfil, canActivate: [userGuardGuard],data: {roles : ['ALUMNO']} },
      { path: 'detail/course', component: DetailCourse,canActivate: [userGuardGuard],data: {roles : ['ALUMNO']} },
    ]
  },

  //Rutas para navegar sin authenticacion (pagina publica)
  {
    path:'cibernext',
    component :MainLayout,
    children :[
      {path: 'contact', component:Contact}
    ]
  },

  // Rutas para navegar en la pagina de autenticacion 
  {
    path: 'auth',
    children:AUTH_ROUTES
  },

  // Rutas para navegar en la pagina de administrador
 {
    path:'admin',
    component: AdminLayout,
    children:[
        {path: 'dashboard', component:DashboardAdmin,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} },
        {path: 'students', component:Students,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} },
        {path: 'courses', component:Courses,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} },
        {path: 'teachers', component:Teachers,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} },
         {path: 'areaSpecialization', component:AreaSpecialization,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} },
        {path: 'registerStudents', component:RegisterStudents,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} }
  
    ],
    data: { roles: ['ADMIN'] }
  },

    // Rutas para navegar en la pagina de profesor
    {
      path:'teacher',
      component: AdminLayout,
      children:[
        {path: 'dashboard', component:DashboardTeacher,canActivate: [userGuardGuard], data: {roles : ['PROFESOR']} },
        {path: 'profesores', children: routesi, canActivate: [userGuardGuard], data: { roles: ['PROFESOR'] } }
      ]
    },

  //Rutas genericas
  {path: 'unauthorized', component: Unauthorized},
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];
