import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
    private baseUrl: string = environment.baseUrl;
   // private baseUrl: string = environment.local_baseUrl;
  
  
  constructor(private http: HttpClient) {
    console.log('Base URL:', this.baseUrl);
  }
 
  post(endpoint: string, data: any): Observable<any> { 
    return this.http.post<any>(this.baseUrl + endpoint, data)
      .pipe(catchError(this.handleError));
  }

  get(endpoint: string,): Observable<any> { 
    return this.http.get<any>(this.baseUrl + endpoint)
      .pipe(catchError(this.handleError));

  }

  delete(endpoint: string,): Observable<any> { 
    return this.http.delete<any>(this.baseUrl + endpoint,)
      .pipe(catchError(this.handleError));

  }
  put(endpoint: string, data: any): Observable<any> { 
    return this.http.put<any>(this.baseUrl + endpoint,data )
      .pipe(catchError(this.handleError));
  }
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code: ${error.status}, message: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
