import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';

export interface PropertyDefinition {
  name: string;
  description?: string;
  type: PropertyType;
}

export enum PropertyType {
  String,
  Double,
  Integer,
  Boolean,
  DateTime,
  Array
}

export interface PropertyDefinitionRequest {
  name: string;
  description?: string;
  type: PropertyType;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyDefinitionService {
  private httpService = inject(HttpService);
  private apiUrl = '/api/property-definitions';

  getAll(): Observable<PropertyDefinition[]> {
    return this.httpService.get<PropertyDefinition[]>(this.apiUrl);
  }

  getOne(name: string): Observable<PropertyDefinition> {
    return this.httpService.get<PropertyDefinition>(`${this.apiUrl}/${name}`);
  }

  create(propertyDefinition: PropertyDefinitionRequest): Observable<PropertyDefinition> {
    return this.httpService.post<PropertyDefinition>(this.apiUrl, propertyDefinition, 'Property definition created successfully');
  }

  update(name: string, propertyDefinition: PropertyDefinitionRequest): Observable<PropertyDefinition> {
    return this.httpService.put<PropertyDefinition>(`${this.apiUrl}/${name}`, propertyDefinition, 'Property definition updated successfully');
  }

  delete(name: string): Observable<void> {
    return this.httpService.delete<void>(`${this.apiUrl}/${name}`, 'Property definition deleted successfully');
  }
}