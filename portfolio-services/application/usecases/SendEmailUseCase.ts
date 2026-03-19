import { IEmailService, EmailParams } from '../interfaces/IEmailService';

export class SendEmailUseCase {
  constructor(private readonly emailService: IEmailService) {}

  async execute(params: EmailParams): Promise<void> {
    return this.emailService.sendEmail(params);
  }
}
