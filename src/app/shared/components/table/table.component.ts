import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

export interface DynamicEntity {
    name: string;
    properties: { name: string; value: string }[];
}

@Component({
    selector: 'app-table',
    imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, ButtonComponent],
    templateUrl: './table.component.html',
})
export class TableComponent {

    entities = input<DynamicEntity[]>([]);
    editEntity = output<DynamicEntity>();
    removeEntity = output<DynamicEntity>();
    viewDetails = output<DynamicEntity>();

    private router = inject(Router);

    // Computed signal to get all unique property names across all entities
    displayedColumns = computed(() => {
        const entities = this.entities();
        const propertyNames = new Set<string>();

        // Collect all unique property names
        entities.forEach(entity => {
            entity.properties.forEach(prop => {
                propertyNames.add(prop.name);
            });
        });

        // Return column names: name, all properties, actions
        return ['name', ...Array.from(propertyNames).sort(), 'actions'];
    });

    // Get property columns only (excluding name and actions)
    propertyColumns = computed(() => {
        return this.displayedColumns().filter(col => col !== 'name' && col !== 'actions');
    });

    getPropertyValue(entity: DynamicEntity, propertyName: string): string {
        return entity.properties.find(p => p.name === propertyName)?.value || '';
    }

    trackByColumn(index: number, column: string): string {
        return column;
    }

    onEdit(entity: DynamicEntity) {
        this.editEntity.emit(entity);
    }

    onRemove(entity: DynamicEntity) {
        this.removeEntity.emit(entity);
    }

    onViewDetails(entity: DynamicEntity) {
        this.viewDetails.emit(entity);
    }
}
