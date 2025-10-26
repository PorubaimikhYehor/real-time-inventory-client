import { Routes } from '@angular/router';
import { Containers } from './modules/containers/containers';
import { ContainerForm } from './modules/containers/components/container-form/container-form';
import { ContainerDetails } from './modules/containers/components/container-details/container-details';
import { Lots } from './modules/lots/lots';
import { LotList } from './modules/lots/components/lot-list/lot-list';
import { LotForm } from './modules/lots/components/lot-form/lot-form';
import { LotDetails } from './modules/lots/components/lot-details/lot-details';
import { PropertyDefinitionsComponent } from './modules/property-definitions/property-definitions.component';
import { ActionsComponent } from './modules/actions/actions.component';

export const routes: Routes = [
	{
		path: 'containers',
		children: [
			{ path: '', component: Containers },
			{ path: 'create', component: ContainerForm, data: { mode: 'create' } },
			{ path: ':name/details', component: ContainerDetails },
			{ path: ':name/edit', component: ContainerForm, data: { mode: 'edit' } }
		]
	},
	{
		path: 'lots',
		component: Lots,
		children: [
			{ path: '', component: LotList },
			{ path: 'create', component: LotForm },
			{ path: ':name/details', component: LotDetails },
			{ path: ':name/edit', component: LotForm }
		]
	},
	{
		path: 'actions',
		component: ActionsComponent
	},
	{
		path: 'property-definitions',
		component: PropertyDefinitionsComponent
	}
];
