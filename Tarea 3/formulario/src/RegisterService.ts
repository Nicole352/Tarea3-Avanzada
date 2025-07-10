import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // POST - Registrar usuario
  saveUser(data: any): Promise<any> {
    return this.http.post(`${this.baseUrl}/register`, data).toPromise();
  }

  // GET - Obtener todos los usuarios
  getUsers(): Promise<any> {
    return this.http.get(`${this.baseUrl}/users`).toPromise();
  }

  // GET - Obtener usuario por ID
  getUserById(id: number): Promise<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`).toPromise();
  }
}