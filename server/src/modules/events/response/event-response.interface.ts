export interface EventResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
  error?: any;
}
