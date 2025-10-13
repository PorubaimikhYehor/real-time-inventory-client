import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GetAllContainersRequest, GetAllContainersResponse, Pagination, Container } from '../../../models/container';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private apiUrl = '/api/containers/'; // POST endpoint
  constructor(private http: HttpClient) { }
  getContainers(request?: GetAllContainersRequest): Observable<GetAllContainersResponse> {
    console.log('Sending request:', request);
    return this.http.post<GetAllContainersResponse>(this.apiUrl + 'GetAll', request || new GetAllContainersRequest())
      .pipe(
        map(response => new GetAllContainersResponse(response))
      );
  }

  createContainer(container: { name: string; properties: { name: string; value: string }[] }): Observable<Container> {
    return this.http.post<Container>(this.apiUrl, container);
  }

  deleteContainer(name: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${encodeURIComponent(name)}`);
  }

  getContainer(name: string): Observable<Container> {
    return this.http.get<Container>(`${this.apiUrl}${encodeURIComponent(name)}`);
  }

  updateContainer(name: string, container: { name: string; properties: { name: string; value: string }[] }): Observable<Container> {
    return this.http.put<Container>(`${this.apiUrl}${encodeURIComponent(name)}`, container);
  }
}
