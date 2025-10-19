import { Routes } from '@angular/router';
import { Containers } from './modules/containers/containers';
import { ContainerDetails } from './modules/containers/container-details/container-details';
import { Lots } from './modules/lots/lots';
import { LotList } from './modules/lots/components/lot-list/lot-list';
import { LotForm } from './modules/lots/components/lot-form/lot-form';

export const routes: Routes = [
	{ path: 'containers', component: Containers },
	{ path: 'containers/:name', component: ContainerDetails },
	{
		path: 'lots',
		component: Lots,
		children: [
			{ path: '', component: LotList },
			{ path: 'create', component: LotForm },
			{ path: ':name/edit', component: LotForm }
		]
	}
];
