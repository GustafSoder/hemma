import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/enironment';
import { DeparturesResponse } from '../models/sl-transport.models';

@Injectable({ providedIn: 'root' })
export class SlTransportService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'https://transport.integration.sl.se/v1';
  private readonly API_KEY = environment.slApiKey; // from environment.ts

  /**
   * Get departures for a given site ID.
   * @param siteId  — SL site ID (e.g. 9192 for Karlaplan)
   * @param forecast — minutes ahead to fetch (default 60, max 60)
   */
  getDepartures(siteId: number, forecast = 60): Observable<DeparturesResponse> {
    const params = new HttpParams()
      .set('forecast', forecast)
      .set('key', this.API_KEY);

    return this.http.get<DeparturesResponse>(
      `${this.BASE_URL}/sites/${siteId}/departures`,
      { params },
    );
  }

  /**
   * Look up sites by name to find the siteId.
   * Open in browser: https://transport.integration.sl.se/v1/sites?q=Karlaplan&key=YOUR_KEY
   */
  findSite(query: string): Observable<any> {
    const params = new HttpParams().set('q', query).set('key', this.API_KEY);

    return this.http.get(`${this.BASE_URL}/sites`, { params });
  }
}
