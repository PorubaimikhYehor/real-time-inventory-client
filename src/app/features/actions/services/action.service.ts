import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '@app/core/services/http.service';

export interface MoveMaterialsRequest {
  sourceContainerName: string;
  destinationContainerName: string;
  quantity: number;
  startedAt?: string;
  finishedAt?: string;
}

export interface UpdateLotQuantityRequest {
  lotName: string;
  containerName: string;
  quantity: number;
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
  private http = inject(HttpService);

  moveMaterials(request: MoveMaterialsRequest): Observable<TransferLotResponse> {
    return this.http.post<TransferLotResponse>('/api/actions/MoveMaterials', request);
  }

  updateLotQuantity(request: UpdateLotQuantityRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/actions/UpdateLotQuantity', request, 'Quantity updated successfully!');
  }
}