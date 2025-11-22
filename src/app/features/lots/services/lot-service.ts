import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Lot, CreateLotRequest, UpdateLotRequest } from '../../../shared/models/lot';
import { HttpService } from '../../../core/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class LotService {
  private httpService = inject(HttpService);
  private apiUrl = '/api/lots/';

  getLots(): Observable<Lot[]> {
    return this.httpService.get<Lot[]>(this.apiUrl)
      .pipe(map(response => response.map(lot => new Lot(lot))));
  }

  createLot(lot: CreateLotRequest): Observable<Lot> {
    return this.httpService.post<Lot>(this.apiUrl, lot, 'Lot created successfully!');
  }

  deleteLot(name: string): Observable<void> {
    return this.httpService.delete<void>(`${this.apiUrl}${encodeURIComponent(name)}`, 'Lot deleted successfully!');
  }

  getLot(name: string): Observable<Lot> {
    return this.httpService
      .get<Lot>(`${this.apiUrl}${encodeURIComponent(name)}`)
      .pipe(map(response => new Lot(response)));
  }

  getLotDetails(name: string): Observable<any> {
    return this.httpService.get<any>(`${this.apiUrl}${encodeURIComponent(name)}/details`);
  }

  updateLot(name: string, lot: UpdateLotRequest): Observable<Lot> {
    return this.httpService.put<Lot>(`${this.apiUrl}${encodeURIComponent(name)}`, lot, 'Lot updated successfully!');
  }
}