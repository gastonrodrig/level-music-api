import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { CreateTemporalCredentialMailDto, CreateMailDto, CreatePasswordResetLinkMailDto, CreateContactMailDto } from '../dto';

@Injectable()
export class MailService {
  private oauth2Client;
  private transporter;

  constructor(
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.setupTransporter();
  }

  private async setupTransporter() {
    const accessToken = await this.oauth2Client.getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to retrieve access token');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendTestEmail(dto: CreateMailDto) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendTemporalCredentials(dto: CreateTemporalCredentialMailDto) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: dto.to,
      subject: "Credenciales Level Music Corp",
      text: `Hola,

Tus credenciales de acceso son:
• Email: ${dto.email}
• Contraseña temporal: ${dto.password}

Entra en https://level-music-frontend.vercel.app/. La primera vez que ingreses, solo tendrás que cambiar tu contraseña (tu email permanecerá igual).

Renzo Rodríguez Osco (Gerente)
WhatsApp: +51 989160593
levelmusiccorp@gmail.com

¡Bienvenido!`,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendPasswordResetLink(dto: CreatePasswordResetLinkMailDto) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: dto.to,
      subject: 'Recuperación de contraseña - Level Music Corp',
      text: `Hola,

Hemos recibido una solicitud para restablecer tu contraseña.
Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:

${dto.link}

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Equipo Level Music Corp`,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
  async sendContactMail(dto: CreateContactMailDto) {
  const mailOptions = {
    from: dto.from,  // remitente → cliente
    to: dto.to,      // destinatario → empresa
    subject: `Nuevo mensaje de contacto - ${dto.name}`,
    text: `Has recibido un nuevo mensaje desde el formulario de contacto:

Nombre: ${dto.name}
Correo: ${dto.from}

Mensaje:
"${dto.message}"

⚡ Level Music Corp`,
  };

  try {
    const result = await this.transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw new Error(`Failed to send contact email: ${error.message}`);
  }
}


}

