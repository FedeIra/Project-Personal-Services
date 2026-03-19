import { SES } from 'aws-sdk';
import {
  IEmailService,
  EmailParams,
} from '../../application/interfaces/IEmailService';

export class SESEmailService implements IEmailService {
  private readonly ses: SES;

  constructor() {
    this.ses = new SES();
  }

  async sendEmail(params: EmailParams): Promise<void> {
    const fromEmail = process.env.PORTFOLIO_FROM_EMAIL || '';
    const toEmail = process.env.PORTFOLIO_TO_EMAIL || '';

    await this.ses
      .sendEmail({
        Source: fromEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: `Portfolio contact from ${params.from_name}`,
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: `Name: ${params.from_name}\nReply-to: ${params.reply_to}\n\nMessage:\n${params.message}`,
              Charset: 'UTF-8',
            },
          },
        },
        ReplyToAddresses: [params.reply_to],
      })
      .promise();
  }
}
