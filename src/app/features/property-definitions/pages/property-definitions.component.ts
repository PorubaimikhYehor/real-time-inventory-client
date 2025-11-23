import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDefinitionTableComponent } from '../components/property-definition-table/property-definition-table.component';

@Component({
  selector: 'app-property-definitions',
  standalone: true,
  imports: [CommonModule, PropertyDefinitionTableComponent],
  template: `
    <app-property-definition-table></app-property-definition-table>
  `
})
export class PropertyDefinitionsComponent {}