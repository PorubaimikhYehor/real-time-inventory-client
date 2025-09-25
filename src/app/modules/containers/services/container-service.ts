import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GetAllContainersRequest, GetAllContainersResponse, Pagination } from '../../../models/container';

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
}
