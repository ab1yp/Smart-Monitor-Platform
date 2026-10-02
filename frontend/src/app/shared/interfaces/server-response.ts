export interface ServerResponse {
  success: Boolean;
  responseData?: Object
  message?: string;
  error?: Error;
}