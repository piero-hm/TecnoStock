import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria, CategoriaCreate } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly url = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  crear(data: CategoriaCreate): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, data);
  }
}
