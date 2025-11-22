import { Routes } from '@angular/router';
import { ContainersComponent } from './features/containers/pages/containers.component';
import { ContainerFormComponent } from './features/containers/pages/container-form/container-form.component';
import { ContainerDetailsComponent } from './features/containers/pages/container-details/container-details.component';
import { LotsComponent } from './features/lots/pages/lots.component';
import { LotListComponent } from './features/lots/components/lot-list/lot-list.component';
import { LotFormComponent } from './features/lots/pages/lot-form/lot-form.component';
import { LotDetailsComponent } from './features/lots/pages/lot-details/lot-details.component';
import { PropertyDefinitionsComponent } from './features/property-definitions/pages/property-definitions.component';
import { ActionsComponent } from './features/actions/pages/actions.component';
import { LoginComponent } from './features/auth/pages/login.component';
import { ProfileComponent } from './features/auth/pages/profile.component';
import { UsersListComponent } from './features/users/pages/users-list.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
	{
		path: 'users',
		component: UsersListComponent,
		canActivate: [adminGuard]
	},
	{
		path: 'containers',
		canActivate: [authGuard],
		children: [
			{ path: '', component: ContainersComponent },
			{ path: 'create', component: ContainerFormComponent, canActivate: [authGuard], data: { mode: 'create', roles: ['Admin', 'Manager'] } },
			{ path: ':name/details', component: ContainerDetailsComponent },
			{ path: ':name/edit', component: ContainerFormComponent, canActivate: [authGuard], data: { mode: 'edit', roles: ['Admin', 'Manager'] } }
		]
	},
	{
		path: 'lots',
		component: LotsComponent,
		canActivate: [authGuard],
		children: [
			{ path: '', component: LotListComponent },
			{ path: 'create', component: LotFormComponent, canActivate: [authGuard], data: { roles: ['Admin', 'Manager', 'Operator'] } },
			{ path: ':name/details', component: LotDetailsComponent },
			{ path: ':name/edit', component: LotFormComponent, canActivate: [authGuard], data: { roles: ['Admin', 'Manager', 'Operator'] } }
		]
	},
	{
		path: 'actions',
		component: ActionsComponent,
		canActivate: [authGuard]
	},
	{
		path: 'property-definitions',
		component: PropertyDefinitionsComponent,
		canActivate: [authGuard],
		data: { roles: ['Admin'] }
	},
	{ path: '', redirectTo: '/containers', pathMatch: 'full' }
];
