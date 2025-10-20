import { Routes } from '@angular/router';
import { Containers } from './modules/containers/containers';
import { ContainerForm } from './modules/containers/components/container-form/container-form';
import { Lots } from './modules/lots/lots';
import { LotList } from './modules/lots/components/lot-list/lot-list';
import { LotForm } from './modules/lots/components/lot-form/lot-form';

export const routes: Routes = [
	{
		path: 'containers',
		children: [
			{ path: '', component: Containers },
			{ path: 'create', component: ContainerForm, data: { mode: 'create' } },
			{ path: ':name/edit', component: ContainerForm, data: { mode: 'edit' } }
		]
	},
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
