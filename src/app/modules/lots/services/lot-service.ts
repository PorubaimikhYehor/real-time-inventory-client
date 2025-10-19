import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Lot, CreateLotRequest, UpdateLotRequest } from '../../../models/lot';
import { HttpService } from '../../../shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class LotService {
  private apiUrl = '/api/lots/';

  constructor(private httpService: HttpService) { }

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

  updateLot(name: string, lot: UpdateLotRequest): Observable<Lot> {
    return this.httpService.put<Lot>(`${this.apiUrl}${encodeURIComponent(name)}`, lot, 'Lot updated successfully!');
  }
}