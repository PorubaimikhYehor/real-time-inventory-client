import { Routes } from '@angular/router';
import { authGuard, adminGuard } from '@app/core/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('@app/features/home/pages/home.component').then(m => m.HomeComponent),
		canActivate: [adminGuard],
		title: 'Home'
	},
	{ 
		path: 'login', 
		loadComponent: () => import('@app/features/auth/pages/login.component').then(m => m.LoginComponent),
		title: 'Login'
	},
	{ 
		path: 'profile', 
		loadComponent: () => import('@app/features/auth/pages/profile.component').then(m => m.ProfileComponent),
		canActivate: [authGuard] ,
		title: 'Profile'
	},
	{
		path: 'users',
		loadComponent: () => import('@app/features/users/pages/users-list.component').then(m => m.UsersListComponent),
		canActivate: [adminGuard],
		title: 'User Management'
	},
	{
		path: 'containers',
		canActivate: [authGuard],
		title: 'Containers',
		children: [
			{ 
				path: '', 
				loadComponent: () => import('@app/features/containers/pages/containers.component').then(m => m.ContainersComponent)
			},
			{ 
				path: 'create', 
				loadComponent: () => import('@app/features/containers/pages/container-form/container-form.component').then(m => m.ContainerFormComponent),
				canActivate: [authGuard], 
				data: { mode: 'create', roles: ['Admin', 'Manager'] } 
			},
			{ 
				path: ':name/details', 
				loadComponent: () => import('@app/features/containers/pages/container-details/container-details.component').then(m => m.ContainerDetailsComponent)
			},
			{ 
				path: ':name/edit', 
				loadComponent: () => import('@app/features/containers/pages/container-form/container-form.component').then(m => m.ContainerFormComponent),
				canActivate: [authGuard], 
				data: { mode: 'edit', roles: ['Admin', 'Manager'] } 
			}
		]
	},
	{
		path: 'lots',
		loadComponent: () => import('@app/features/lots/pages/lots.component').then(m => m.LotsComponent),
		canActivate: [authGuard],
		title: 'Lots',
		children: [
			{ 
				path: '', 
				loadComponent: () => import('@app/features/lots/components/lot-list/lot-list.component').then(m => m.LotListComponent)
			},
			{ 
				path: 'create', 
				loadComponent: () => import('@app/features/lots/pages/lot-form/lot-form.component').then(m => m.LotFormComponent),
				canActivate: [authGuard], 
				data: { roles: ['Admin', 'Manager', 'Operator'] } 
			},
			{ 
				path: ':name/details', 
				loadComponent: () => import('@app/features/lots/pages/lot-details/lot-details.component').then(m => m.LotDetailsComponent)
			},
			{ 
				path: ':name/edit', 
				loadComponent: () => import('@app/features/lots/pages/lot-form/lot-form.component').then(m => m.LotFormComponent),
				canActivate: [authGuard], 
				data: { roles: ['Admin', 'Manager', 'Operator'] } 
			}
		]
	},
	{
		path: 'actions',
		loadComponent: () => import('@app/features/actions/pages/actions.component').then(m => m.ActionsComponent),
		canActivate: [authGuard],
		title: 'Actions'
	},
	{
		path: 'property-definitions',
		title: 'Property Definitions',
		loadComponent: () => import('@app/features/property-definitions/pages/property-definitions.component').then(m => m.PropertyDefinitionsComponent),
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{ path: '**', redirectTo: '/', pathMatch: 'full' },
];

