// ─────────────────────────────────────────────
// SL Transport API — Interfaces
// ─────────────────────────────────────────────

export type StopState = "NOTEXPECTED" | "EXPECTED" | "CANCELLED";
export type PredictionState = "NORMAL" | "UNRELIABLE" | "UNKNOWN";
export type PassengerLevel =
  | "EMPTY"
  | "SEATS_AVAILABLE"
  | "STANDING_ROOM"
  | "FULL";
export type TransportMode = "BUS" | "METRO" | "TRAIN" | "TRAM" | "SHIP";
export type StopAreaType =
  | "BUSTERM"
  | "METROSTN"
  | "TRAINSTN"
  | "TRAMSTN"
  | "SHIPBER";
export type DeviationConsequence = "INFORMATION" | "WARNING" | "ERROR";

export interface Journey {
  id: number;
  state: StopState;
  prediction_state: PredictionState;
  passenger_level: PassengerLevel;
}

export interface StopArea {
  id: number;
  name: string;
  sname: string;
  type: StopAreaType;
}

export interface StopPoint {
  id: number;
  name: string;
  designation: string;
}

export interface Line {
  id: number;
  designation: string;
  transport_mode: TransportMode;
  group_of_lines: string;
}

export interface Departure {
  direction: string;
  direction_code: number;
  via: string;
  destination: string;
  state: StopState;
  scheduled: string;
  expected: string;
  display: string;
  journey: Journey;
  stop_area: StopArea;
  stop_point: StopPoint;
  line: Line;
  deviations: string;
}

export interface StopDeviation {
  importance: number;
  consequence: DeviationConsequence;
  message: string;
}

export interface DeparturesResponse {
  departures: Departure[];
  stop_deviations: StopDeviation[];
}
