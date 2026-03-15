import { inject, Injectable } from '@angular/core';
import { HttpService } from '@app/core/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private httpService = inject(HttpService);

  private apiUrl = 'overview/';
  getInformation = () => this.httpService.get(this.apiUrl);
}
