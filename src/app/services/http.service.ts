import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../../config';

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  private http = inject(HttpClient);

  post(url: string, params: object | null) {
    return this.http.post(APP_CONFIG.apiUrl + url, params);
  }

  get(url: string) {
    return this.http.get(APP_CONFIG.apiUrl + url)
  }

}
