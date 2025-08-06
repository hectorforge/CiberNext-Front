import { Routes } from '@angular/router';
import {Home} from './pages/home/home';
import {Login} from './pages/login/login';
import {Register} from './pages/register/register';
import {MainLayout} from './layouts/main-layout/main-layout';
import {AuthLayout} from './layouts/ayuth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: 'home',
    component: MainLayout,
    children: [
      { path: '', component: Home }
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
