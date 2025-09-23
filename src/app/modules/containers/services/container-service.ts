import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetAllContainersResponse } from '../../../models/container';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private apiUrl = '/api/containers/'; // POST endpoint
  constructor(private http: HttpClient) { }
  getContainers(): Observable<GetAllContainersResponse> {
    return this.http.post<GetAllContainersResponse>(this.apiUrl + 'GetAll', {});
  }

}
