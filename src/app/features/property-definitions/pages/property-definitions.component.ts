import { Component } from '@angular/core';

import { PropertyDefinitionTableComponent } from '@app/features/property-definitions/components/property-definition-table/property-definition-table.component';

@Component({
  selector: 'app-property-definitions',
  standalone: true,
  imports: [PropertyDefinitionTableComponent],
  template: `
    <app-property-definition-table></app-property-definition-table>
  `
})
export class PropertyDefinitionsComponent {}