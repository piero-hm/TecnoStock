import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Indicadores } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly url = `${environment.apiUrl}/dashboard/indicadores`;

  constructor(private http: HttpClient) {}

  indicadores(): Observable<Indicadores> {
    return this.http.get<Indicadores>(this.url);
  }
}
