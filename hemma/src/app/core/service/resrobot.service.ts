import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/enironment';
import { ResRobotDepartureResponse, ResRobotLocationResponse } from '../models/resrobot.models';

@Injectable({ providedIn: 'root' })
export class ResrobotService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'https://api.resrobot.se/v2.1';
  private readonly API_KEY = environment.resrobotApiKey;

  getDepartures(stopId: string, maxJourneys = 20, directionId = ''): Observable<ResRobotDepartureResponse> {
    let params = new HttpParams()
      .set('id', stopId)
      .set('maxJourneys', maxJourneys)
      .set('format', 'json')
      .set('accessId', this.API_KEY);
    if (directionId) params = params.set('direction', directionId);

    return this.http.get<ResRobotDepartureResponse>(
      `${this.BASE_URL}/departureBoard`,
      { params },
    );
  }

  findStop(query: string): Observable<ResRobotLocationResponse> {
    const params = new HttpParams()
      .set('input', query)
      .set('format', 'json')
      .set('lang', 'sv')
      .set('accessId', this.API_KEY);

    return this.http.get<ResRobotLocationResponse>(
      `${this.BASE_URL}/location.name`,
      { params },
    );
  }
}
