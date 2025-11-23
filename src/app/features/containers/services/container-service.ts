import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GetAllContainersRequest, GetAllContainersResponse, Pagination, Container } from '@app/shared/models/container';
import { HttpService } from '@app/core/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private httpService = inject(HttpService);
  private apiUrl = '/api/containers/'; // POST endpoint

  getContainers(request?: GetAllContainersRequest): Observable<GetAllContainersResponse> {
    console.log('Sending request:', request);
    return this.httpService.post<GetAllContainersResponse>(this.apiUrl + 'GetAll', request || new GetAllContainersRequest())
      .pipe(
        map(response => new GetAllContainersResponse(response))
      );
  }

  createContainer(container: { name: string; properties: { name: string; value: string }[] }): Observable<Container> {
    return this.httpService.post<Container>(this.apiUrl, container, 'Container created successfully!');
  }

  deleteContainer(name: string): Observable<void> {
    return this.httpService.delete<void>(`${this.apiUrl}${encodeURIComponent(name)}`, 'Container deleted successfully!');
  }

  getContainer(name: string): Observable<Container> {
    return this.httpService.get<Container>(`${this.apiUrl}${encodeURIComponent(name)}`);
  }

  getContainerWithLots(name: string): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}${encodeURIComponent(name)}/lots`);
  }

  updateContainer(name: string, container: { name: string; properties: { name: string; value: string }[] }): Observable<Container> {
    return this.httpService.put<Container>(`${this.apiUrl}${encodeURIComponent(name)}`, container, 'Container updated successfully!');
  }
}
