export interface EmailParams {
  from_name: string;
  reply_to: string;
  message: string;
}

export interface IEmailService {
  sendEmail(params: EmailParams): Promise<void>;
}
