export interface SendEmailRequest {
  to: string;
  subject: string;
  body?: string;
  htmlBody?: string;
}
