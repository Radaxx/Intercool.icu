export interface Activity {
  id: string;
  name: string;
  type: string;
  start_date_local: string;
  moving_time: number | null;
  elapsed_time: number | null;
  distance: number | null;
  total_elevation_gain: number | null;
  average_heartrate: number | null;
  max_heartrate: number | null;
  icu_average_watts: number | null;
  icu_training_load: number | null;
  calories: number | null;
  average_speed: number | null;
  icu_pl_index?: number | null;
}
