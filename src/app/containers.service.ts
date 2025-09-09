import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Container {
  name: string;
  properties: { name: string; value: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class ContainersService {
  private apiUrl = '/api/containers/GetAll'; // POST endpoint

  constructor(private http: HttpClient) {}

  getContainers(): Observable<Container[]> {
    // Adjust the request body as needed for your API
    return this.http.post<{ items: Container[] }>(this.apiUrl, {}).pipe(
      map(response => response.items)
    );
  }
}
