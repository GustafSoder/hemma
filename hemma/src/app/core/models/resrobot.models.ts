export interface ResRobotStopLocation {
  id: string;
  extId: string;
  name: string;
  lon: number;
  lat: number;
  weight?: number;
  products?: number;
}

export interface ResRobotLocationResponse {
  stopLocationOrCoordLocation?: Array<{ StopLocation?: ResRobotStopLocation }>;
}

export interface ResRobotProduct {
  name: string;
  num: string;
  line?: string;
  catOut: string;
  catCode: string;
  operator?: string;
}

export interface ResRobotDeparture {
  Product: ResRobotProduct;
  name: string;
  type: string;
  stop: string;
  stopid: string;
  time: string;
  date: string;
  direction: string;
  rtTime?: string;
  rtDate?: string;
  cancelled?: boolean;
}

export interface ResRobotDepartureResponse {
  Departure?: ResRobotDeparture[];
}
