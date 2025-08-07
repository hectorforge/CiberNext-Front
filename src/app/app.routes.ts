import { Routes } from '@angular/router';
import {Home} from './pages/home/home';
import {Login} from './pages/login/login';
import {Register} from './pages/register/register';
import {MainLayout} from './layouts/main-layout/main-layout';
import {AuthLayout} from './layouts/ayuth-layout/auth-layout.component';
import {DetailCourse} from './pages/detail-course/detail-course';

export const routes: Routes = [
  {
    path: 'home',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'detail/course', component: DetailCourse },
    ]
  },

  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ]
  },

  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
