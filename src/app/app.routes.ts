import { Routes } from '@angular/router';
import { Home } from '@features/cursos/pages/home/home';
import {MainLayout} from './shared/layouts/main-layout/main-layout';
import {DetailCourse} from './features/cursos/pages/detail-course/detail-course';
import { userGuardGuard } from './core/guards/user-guard-guard';
import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import { Dashboard } from './features/admin/pages/dashboard';
import { Unauthorized } from './features/public/pages/unauthorized/unauthorized';
import { Contact } from '@features/public/pages/contact/contact';
import { Perfil } from './features/auth/pages/perfil/perfil';
import { AUTH_ROUTES } from '@features/auth/auth.routes';

export const routes: Routes = [
  // Rutas para navegar en la pagina del estudiante (ya logeado xd)
  {
    path: 'home',
    component: MainLayout,
    children: [
      { path: '', component: Home, canActivate: [userGuardGuard] },
      {path: 'me', component: Perfil, canActivate: [userGuardGuard] },
      { path: 'detail/course', component: DetailCourse,canActivate: [userGuardGuard] },
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
      {path: 'dashboard', component:Dashboard,canActivate: [userGuardGuard], data: {roles : ['ADMIN']} }
    ]
  },

  //Rutas genericas
  {path: 'unauthorized', component: Unauthorized},
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
