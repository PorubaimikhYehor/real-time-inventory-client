import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ 
		path: 'login', 
		loadComponent: () => import('./features/auth/pages/login.component').then(m => m.LoginComponent)
	},
	{ 
		path: 'profile', 
		loadComponent: () => import('./features/auth/pages/profile.component').then(m => m.ProfileComponent),
		canActivate: [authGuard] 
	},
	{
		path: 'users',
		loadComponent: () => import('./features/users/pages/users-list.component').then(m => m.UsersListComponent),
		canActivate: [adminGuard]
	},
	{
		path: 'containers',
		canActivate: [authGuard],
		children: [
			{ 
				path: '', 
				loadComponent: () => import('./features/containers/pages/containers.component').then(m => m.ContainersComponent)
			},
			{ 
				path: 'create', 
				loadComponent: () => import('./features/containers/pages/container-form/container-form.component').then(m => m.ContainerFormComponent),
				canActivate: [authGuard], 
				data: { mode: 'create', roles: ['Admin', 'Manager'] } 
			},
			{ 
				path: ':name/details', 
				loadComponent: () => import('./features/containers/pages/container-details/container-details.component').then(m => m.ContainerDetailsComponent)
			},
			{ 
				path: ':name/edit', 
				loadComponent: () => import('./features/containers/pages/container-form/container-form.component').then(m => m.ContainerFormComponent),
				canActivate: [authGuard], 
				data: { mode: 'edit', roles: ['Admin', 'Manager'] } 
			}
		]
	},
	{
		path: 'lots',
		loadComponent: () => import('./features/lots/pages/lots.component').then(m => m.LotsComponent),
		canActivate: [authGuard],
		children: [
			{ 
				path: '', 
				loadComponent: () => import('./features/lots/components/lot-list/lot-list.component').then(m => m.LotListComponent)
			},
			{ 
				path: 'create', 
				loadComponent: () => import('./features/lots/pages/lot-form/lot-form.component').then(m => m.LotFormComponent),
				canActivate: [authGuard], 
				data: { roles: ['Admin', 'Manager', 'Operator'] } 
			},
			{ 
				path: ':name/details', 
				loadComponent: () => import('./features/lots/pages/lot-details/lot-details.component').then(m => m.LotDetailsComponent)
			},
			{ 
				path: ':name/edit', 
				loadComponent: () => import('./features/lots/pages/lot-form/lot-form.component').then(m => m.LotFormComponent),
				canActivate: [authGuard], 
				data: { roles: ['Admin', 'Manager', 'Operator'] } 
			}
		]
	},
	{
		path: 'actions',
		loadComponent: () => import('./features/actions/pages/actions.component').then(m => m.ActionsComponent),
		canActivate: [authGuard]
	},
	{
		path: 'property-definitions',
		loadComponent: () => import('./features/property-definitions/pages/property-definitions.component').then(m => m.PropertyDefinitionsComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{ path: '', redirectTo: '/containers', pathMatch: 'full' }
];

