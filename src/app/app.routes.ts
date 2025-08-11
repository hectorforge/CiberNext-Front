import { Routes } from '@angular/router';
import {Home} from './pages/home/home';
import {Login} from './pages/login/login';
import {Register} from './pages/register/register';
import {MainLayout} from './layouts/main-layout/main-layout';
import {AuthLayout} from './layouts/auth-layout/auth-layout.component';
import {DetailCourse} from './pages/detail-course/detail-course';
import { userGuardGuard } from './guards/user-guard-guard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { Contact } from './pages/contact/contact';
import { Perfil } from './pages/perfil/perfil';

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
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ]
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
