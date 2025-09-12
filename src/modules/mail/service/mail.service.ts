import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { 
  CreateTemporalCredentialMailDto, 
  CreatePasswordResetLinkMailDto, 
  CreateContactMailDto } 
from '../dto';

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

  async sendTemporalCredentials(dto: CreateTemporalCredentialMailDto) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: dto.to,
      subject: "Credenciales Level Music Corp",
      text: `Hola,\n\nTus credenciales de acceso son:\n• Email: ${dto.email}\n• Contraseña temporal: ${dto.password}\n\nEntra en https://level-music-frontend.vercel.app/. La primera vez que ingreses, solo tendrás que cambiar tu contraseña (tu email permanecerá igual).\n\nRenzo Rodríguez Osco (Gerente)\nWhatsApp: +51 989160593\nlevelmusiccorp@gmail.com\n\n¡Bienvenido!`,
      html: `
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0; padding:0; background:#DFE0E2; font-family: 'Mulish', Arial, sans-serif;">
          <div style="background:#E08438; padding:32px;">
            <div style="max-width:480px; margin:auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:32px; border:1px solid #C1BFC0;">
              <h2 style="color:#252020; font-family:'Mulish', Arial, sans-serif; font-weight:700;">Credenciales de acceso</h2>
              <p style="color:#252020; font-size:16px;">Hola,</p>
              <p style="color:#252020; font-size:16px;">Tus credenciales de acceso son:</p>
              <ul style="color:#252020; font-size:16px; list-style:none; padding:0;">
                <li><strong>Email:</strong> <a href="mailto:${dto.email}" style="color:#1a0dab;">${dto.email}</a></li>
                <li><strong>Contraseña temporal:</strong> <span style="color:#E08438;">${dto.password}</span></li>
              </ul>
              <p style="color:#252020; font-size:16px;">Entra en <a href="https://level-music-frontend.vercel.app/" style="color:#E08438; font-weight:700;">https://level-music-frontend.vercel.app/</a>. La primera vez que ingreses, solo tendrás que cambiar tu contraseña (tu email permanecerá igual).</p>
              <hr style="border:none; border-top:1px solid #C1BFC0; margin:32px 0;">
              <div style="font-size:15px; color:#252020; margin-top:8px;">
                Renzo Rodríguez Osco (Gerente)<br>
                WhatsApp: +51 989160593<br>
                <a href="mailto:levelmusiccorp@gmail.com" style="color:#1a0dab;">levelmusiccorp@gmail.com</a>
              </div>
              <p style="font-size:15px; color:#252020; font-weight:700; margin-top:12px;">¡Bienvenido!</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
      text: `Hola,\n\nHemos recibido una solicitud para restablecer tu contraseña.\nPor favor, haz clic en el siguiente enlace para crear una nueva contraseña:\n\n${dto.link}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nSaludos,\nEquipo Level Music Corp`,
      html: `
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0; padding:0; background:#DFE0E2; font-family: 'Mulish', Arial, sans-serif;">
          <div style="background:#E08438; padding:32px;">
            <div style="max-width:480px; margin:auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:32px; border:1px solid #C1BFC0;">
              <h2 style="color:#252020; font-family:'Mulish', Arial, sans-serif; font-weight:700;">Recuperación de contraseña</h2>
              <p style="color:#252020; font-size:16px;">Hola,</p>
              <p style="color:#252020; font-size:16px;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
              <p style="margin:24px 0; text-align:center;">
                <a href="${dto.link}" style="display:inline-block; background:#E08438; color:#fff; padding:12px 24px; border-radius:4px; text-decoration:none; font-weight:700; font-family:'Mulish', Arial, sans-serif;">Restablecer contraseña</a>
              </p>
              <p style="color:#252020; font-size:15px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
              <hr style="margin:32px 0; border:none; border-top:1px solid #C1BFC0;">
              <p style="font-size:13px; color:#252020;">Saludos,<br>Equipo Level Music Corp</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
      from: dto.from,
      to: 'levelmusiccorp@gmail.com',
      subject: `Nuevo mensaje de contacto - ${dto.name}`,
      html: `
        <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin:0; padding:0; background:#DFE0E2; font-family:'Mulish', Arial, sans-serif;">
            <div style="background:#E08438; padding:32px;">
              <div style="max-width:520px; margin:auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:32px; border:1px solid #C1BFC0;">
                
                <h2 style="color:#252020; font-weight:700; margin-top:0;">Nuevo mensaje de contacto</h2>
                
                <p style="color:#252020; font-size:16px;">Has recibido un nuevo mensaje desde el formulario de contacto de la web:</p>
                
                <div style="background:#F9F9F9; padding:16px; border-radius:6px; border:1px solid #E0E0E0; margin-top:16px;">
                  <p style="margin:0; color:#252020; font-size:16px;"><strong>Nombre:</strong> ${dto.name}</p>
                  <p style="margin:8px 0 0 0; color:#252020; font-size:16px;"><strong>Correo:</strong> 
                    <a href="mailto:${dto.from}" style="color:#1a0dab;">${dto.from}</a>
                  </p>
                </div>

                <div style="margin-top:24px;">
                  <p style="color:#252020; font-size:16px; margin-bottom:8px;"><strong>Mensaje:</strong></p>
                  <div style="background:#FFF7F2; border-left:4px solid #E08438; padding:16px; border-radius:4px; font-size:16px; color:#252020;">
                    "${dto.message}"
                  </div>
                </div>

                <!-- Separador visual -->
                <hr style="border:none; border-top:1px solid #C1BFC0; margin:32px 0;">

                <div style="font-size:14px; color:#252020;">
                  Este mensaje fue enviado desde el formulario de contacto de 
                  <a href="https://level-music-frontend.vercel.app" style="color:#E08438; text-decoration:none; font-weight:700;">
                    Level Music Corp
                  </a>.
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send contact email: ${error.message}`);
    }
  }
}

