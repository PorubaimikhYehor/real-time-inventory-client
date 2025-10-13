import { Routes } from '@angular/router';
import { Containers } from './modules/containers/containers';
import { ContainerDetails } from './modules/containers/container-details/container-details';

export const routes: Routes = [
	{ path: 'containers', component: Containers },
	{ path: 'containers/:name', component: ContainerDetails },
];
