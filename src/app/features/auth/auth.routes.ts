import { Routes } from '@angular/router';
import { Login } from '@features/auth/pages/login/login';
import { Register } from '@features/auth/pages/register/register';
import { Perfil } from '@features/auth/pages/perfil/perfil';
import { ChangePassword } from '@features/auth/pages/change-password/change-password';
import { UpdatePerfil } from '@features/auth/pages/update-perfil/update-perfil';
import { AuthLayout } from '@shared/layouts/auth-layout/auth-layout.component';
import { userGuardGuard } from '@core/guards/user-guard-guard';

export const AUTH_ROUTES: Routes = [
{
    path: '',
    component: AuthLayout,
    children: [
        { path: 'login', component: Login },
        { path: 'register', component: Register },
        { path: 'perfil', component: Perfil, canActivate: [userGuardGuard] },
        { path: 'change-password', component: ChangePassword, canActivate: [userGuardGuard] },
        { path: 'update-perfil', component: UpdatePerfil, canActivate: [userGuardGuard] }
    ]
}
];
