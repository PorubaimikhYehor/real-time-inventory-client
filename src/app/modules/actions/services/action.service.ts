import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../../shared/services/http.service';

export interface MoveMaterialsRequest {
  sourceContainerName: string;
  destinationContainerName: string;
  quantity: number;
  startDateTime?: string;
  endDateTime?: string;
}

export interface TransferLotResponse {
  sourceContainer: { name: string };
  destinationContainer: { name: string };
  lots: Array<{ name: string; quantity: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  constructor(private http: HttpService) { }

  moveMaterials(request: MoveMaterialsRequest): Observable<TransferLotResponse> {
    return this.http.post<TransferLotResponse>('/actions/MoveMaterials', request);
  }
}