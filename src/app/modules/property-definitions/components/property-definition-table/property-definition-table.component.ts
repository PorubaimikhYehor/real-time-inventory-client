import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyDefinitionService, PropertyDefinition, PropertyType } from '../../property-definition.service';
import { PropertyDefinitionDialogComponent } from '../property-definition-dialog/property-definition-dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-property-definition-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ButtonComponent
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Property Definitions</h1>
        <app-button [variant]="'primary'" [text]="'Add Property Definition'" [icon]="'add'" (buttonClick)="openCreateDialog()"></app-button>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <mat-table [dataSource]="propertyDefinitions()" class="w-full">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let element">{{ element.name }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="description">
            <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
            <mat-cell *matCellDef="let element">{{ element.description }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="type">
            <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
            <mat-cell *matCellDef="let element">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {{ getPropertyTypeDisplayName(element.type) }}
              </span>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef class="w-32">Actions</mat-header-cell>
            <mat-cell *matCellDef="let element" class="w-32">
              <app-button [variant]="'icon-primary'" [icon]="'edit'" (buttonClick)="openEditDialog(element)"></app-button>
              <app-button [variant]="'icon-destructive'" [icon]="'delete'" (buttonClick)="deletePropertyDefinition(element.name)"></app-button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>

        <div *ngIf="propertyDefinitions().length === 0 && !loading()" class="p-8 text-center text-gray-500">
          No property definitions found. Click "Add Property Definition" to create your first one.
        </div>

        <div *ngIf="loading()" class="p-8 text-center">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="mt-2 text-gray-600">Loading property definitions...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-table {
      width: 100%;
    }

    .mat-mdc-header-cell, .mat-mdc-cell {
      padding: 16px;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      background-color: #f5f5f5;
    }
  `]
})
export class PropertyDefinitionTableComponent implements OnInit {
  private propertyDefinitionService = inject(PropertyDefinitionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  propertyDefinitions = signal<PropertyDefinition[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'description', 'type', 'actions'];

  ngOnInit() {
    this.loadPropertyDefinitions();
  }

  loadPropertyDefinitions() {
    this.loading.set(true);
    this.propertyDefinitionService.getAll().subscribe({
      next: (definitions: PropertyDefinition[]) => {
        this.propertyDefinitions.set(definitions);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading property definitions:', error);
        this.snackBar.open('Error loading property definitions', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(PropertyDefinitionDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPropertyDefinition(result);
      }
    });
  }

  openEditDialog(propertyDefinition: PropertyDefinition) {
    const dialogRef = this.dialog.open(PropertyDefinitionDialogComponent, {
      width: '500px',
      data: { mode: 'edit', propertyDefinition }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePropertyDefinition(propertyDefinition.name, result);
      }
    });
  }

  createPropertyDefinition(propertyDefinition: PropertyDefinition) {
    this.propertyDefinitionService.create(propertyDefinition).subscribe({
      next: (created: PropertyDefinition) => {
        this.propertyDefinitions.update(definitions => [...definitions, created]);
        this.snackBar.open('Property definition created successfully', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error creating property definition:', error);
        this.snackBar.open('Error creating property definition', 'Close', { duration: 3000 });
      }
    });
  }

  updatePropertyDefinition(name: string, propertyDefinition: PropertyDefinition) {
    this.propertyDefinitionService.update(name, propertyDefinition).subscribe({
      next: (updated: PropertyDefinition) => {
        this.propertyDefinitions.update(definitions =>
          definitions.map(def => def.name === name ? updated : def)
        );
        this.snackBar.open('Property definition updated successfully', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error updating property definition:', error);
        this.snackBar.open('Error updating property definition', 'Close', { duration: 3000 });
      }
    });
  }

  deletePropertyDefinition(name: string) {
    if (confirm('Are you sure you want to delete this property definition?')) {
      this.propertyDefinitionService.delete(name).subscribe({
        next: () => {
          this.propertyDefinitions.update(definitions =>
            definitions.filter(def => def.name !== name)
          );
          this.snackBar.open('Property definition deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Error deleting property definition:', error);
          this.snackBar.open('Error deleting property definition', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getPropertyTypeDisplayName(type: string | number): string {
    if (typeof type === 'number') {
      // Map numeric values to enum names
      switch (type) {
        case 0: return 'String';
        case 1: return 'Double';
        case 2: return 'Integer';
        case 3: return 'Boolean';
        case 4: return 'DateTime';
        case 5: return 'Array';
        default: return type.toString();
      }
    }
    // If it's already a string, return it
    return type;
  }
}