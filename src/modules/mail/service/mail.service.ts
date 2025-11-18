import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import puppeteer from 'puppeteer';
import * as nodemailer from 'nodemailer';
import {
  CreateTemporalCredentialMailDto,
  CreatePasswordResetLinkMailDto,
  SendQuotationReadyMailDto,
} from '../dto';
import { formatLatamDate, formatLatamDateTime } from '../../../core/utils/format-latam-date';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/modules/user/schema';
import { Model } from 'mongoose';
import { ClientType } from 'src/modules/user/enum';

@Injectable()
export class MailService {
  private oauth2Client;
  private transporter;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
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
      subject: 'Credenciales Level Music Corp',
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

  async sendQuotationReadyMail(dto: SendQuotationReadyMailDto) {
    const user = await this.userModel.findById(dto.user_id);
    const appUrl = process.env.APP_URL;
    const loginUrl = `${appUrl}/auth/login`;

    const html = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&display=swap" rel="stylesheet">
        <meta name="color-scheme" content="light only">
        <meta name="supported-color-schemes" content="light">
      </head>
      <body style="margin:0; padding:0; background:#DFE0E2; font-family:'Mulish', Arial, sans-serif;">
        <div style="background:#E08438; padding:32px;">
          <div style="max-width:520px; margin:auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:32px; border:1px solid #C1BFC0;">
            <h2 style="color:#252020; font-weight:700; margin-top:0;">Tu cotización ya está lista</h2>
            <p style="color:#252020; font-size:16px; margin:0 0 12px 0;">Hola ${ user.client_type === ClientType.PERSONA ?  user.first_name + " " + user.last_name : user.company_name}</p>
            <p style="color:#252020; font-size:16px; margin:0 0 16px 0;">
              Ingresa a tu cuenta para revisar los detalles, ver los servicios asignados y confirmar o solicitar ajustes.
            </p>
            <div style="text-align:center; margin:24px 0;">
              <a href="${loginUrl}"
                style="display:inline-block; background:#E08438; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:700; font-family:'Mulish', Arial, sans-serif;">
                Iniciar sesión en Level Music Corp
              </a>
            </div>
            <hr style="border:none; border-top:1px solid #C1BFC0; margin:32px 0;">
            <div style="font-size:14px; color:#252020;">
              Este mensaje fue enviado por
              <a href="${appUrl}" style="color:#E08438; text-decoration:none; font-weight:700;">Level Music Corp</a>.
            </div>
          </div>
        </div>
      </body>
    </html>`.trim();

    const subject = 'Tu cotización está lista — Inicia sesión para revisarla';

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: dto.to,
      subject,
      html,
    });
  }

  async sendAppointmentReadyMail(dto: {
    to: string;
    clientName: string;
    meetingType: string;
    date: string;
    hour: string;
    attendeesCount: number;
  }) {
    const appUrl = process.env.APP_URL;

    const baseHead = `
      <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&display=swap" rel="stylesheet">
      <meta name="color-scheme" content="light only">
      <meta name="supported-color-schemes" content="light">
    `;

    const html = `
    <html>
      <head>${baseHead}</head>
      <body style="margin:0; padding:0; background:#DFE0E2; font-family:'Mulish', Arial, sans-serif;">
        <div style="background:#E08438; padding:32px;">
          <div style="max-width:520px; margin:auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); padding:32px; border:1px solid #C1BFC0;">
            <h2 style="color:#252020; font-weight:700; margin-top:0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="vertical-align:middle; margin-right:8px;">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Tu cita ha sido confirmada
            </h2>
            <p style="color:#252020; font-size:16px; margin:0 0 12px 0;">Hola ${dto.clientName}</p>
            <p style="color:#252020; font-size:16px; margin:0 0 16px 0;">
              Tu cita ha sido confirmada exitosamente. A continuación los detalles:
            </p>
            
            <div style="background:#F9F9F9; padding:16px; border-radius:6px; border:1px solid #E0E0E0; margin-top:16px;">
              <table style="width:100%; border-collapse:collapse;">
                <tr>
                  <td style="color:#252020; font-size:16px; padding:8px 0; font-weight:600;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align:middle; margin-right:8px;">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Tipo de Reunión:
                  </td>
                  <td style="color:#252020; font-size:16px; padding:8px 0;">${dto.meetingType}</td>
                </tr>
                <tr>
                  <td style="color:#252020; font-size:16px; padding:8px 0; font-weight:600;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align:middle; margin-right:8px;">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Fecha:
                  </td>
                  <td style="color:#252020; font-size:16px; padding:8px 0;">${dto.date}</td>
                </tr>
                <tr>
                  <td style="color:#252020; font-size:16px; padding:8px 0; font-weight:600;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align:middle; margin-right:8px;">
                      <circle cx="12" cy="12" r="10" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 6v6l4 2" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Hora:
                  </td>
                  <td style="color:#252020; font-size:16px; padding:8px 0;">${dto.hour}</td>
                </tr>
                <tr>
                  <td style="color:#252020; font-size:16px; padding:8px 0; font-weight:600;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="vertical-align:middle; margin-right:8px;">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#E08438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Asistentes:
                  </td>
                  <td style="color:#252020; font-size:16px; padding:8px 0;">${dto.attendeesCount}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top:24px; padding:12px; border-left:4px solid #C1BFC0; background:#FBFBFB; color:#252020; border-radius:4px;">
              Por favor, asegúrate de estar disponible en la fecha y hora indicadas. Si necesitas realizar algún cambio, contáctanos.
            </div>

            <hr style="border:none; border-top:1px solid #C1BFC0; margin:32px 0;">
            <div style="font-size:14px; color:#252020;">
              Este mensaje fue enviado por
              <a href="${appUrl}" style="color:#E08438; text-decoration:none; font-weight:700;">Level Music Corp</a>.
            </div>
          </div>
        </div>
      </body>
    </html>`.trim();

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: dto.to,
      subject: ' Tu cita ha sido confirmada - Level Music Corp',
      html,
    });
  }

  // PDF Generation for Purchase Order
  async generatePurchaseOrderPdf(data: {
    event: any;
    assignations: any[];
  }): Promise<Buffer> {
    const { event, assignations } =
      data;

    const mergedDetails: string[] = [];
    assignations.forEach((a) => {
      const details = a.service_detail || {};
      for (const [key, value] of Object.entries(details)) {
        mergedDetails.push(`${key}: ${value}`);
      }
    });

    const html = `
      <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #ffffff; color: #2c3e50;">

  <div style="page-break-after: always; min-height: 297mm; position: relative; padding: 60px 50px 80px 50px; box-sizing: border-box;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%); padding: 30px 40px; margin: -60px -50px 40px -50px; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; position: relative;">
      <h1 style="font-size: 36px; font-weight: 300; letter-spacing: 3px; margin: 0 0 5px 0;">ORDEN DE COMPRA</h1>
      <p style="font-size: 13px; opacity: 0.8; font-weight: 300; margin: 0;">Código: ${event.event_code}</p>

      <!-- LOGO -->
      <img src="https://i.postimg.cc/tCyBxPJ9/logo.png"
        alt="Logo empresa"
        style="position: absolute; right: 40px; top: 25px; height: 60px; object-fit: contain;">
    </div>

    <table style="width: 100%; margin-bottom: 35px; border-collapse: collapse;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding-right: 20px;">
        <div style="background: #fafafa; padding: 20px; border-radius: 6px; border-top: 3px solid #A05C25;">
          <h2 style="font-size: 13px; text-transform: uppercase; color: #A05C25; font-weight: 600; margin: 0 0 15px 0; letter-spacing: 0.5px;">PROVEEDOR</h2>
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong style="display: inline-block; width: 100px; color: #555;">Empresa:</strong>
            <span style="color: #2c3e50;">LEVEL MUSIC CORP S.A.C.</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong style="display: inline-block; width: 100px; color: #555;">Responsable:</strong>
            <span style="color: #2c3e50;">Renzo Rodriguez</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong style="display: inline-block; width: 100px; color: #555;">Contacto:</strong>
            <span style="color: #2c3e50;">+51 989 160 593</span>
          </div>
        </div>
      </td>

      <td style="width: 50%; vertical-align: top; padding-left: 20px;">
        <div style="background: #fafafa; padding: 20px; border-radius: 6px; border-top: 3px solid #A05C25;">
          <h2 style="font-size: 13px; text-transform: uppercase; color: #A05C25; font-weight: 600; margin: 0 0 15px 0; letter-spacing: 0.5px;">INFORMACIÓN DEL EVENTO</h2>
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong style="display: inline-block; width: 140px; color: #555; vertical-align: top;">Evento:</strong>
            <span style="color: #2c3e50; display: inline-block; width: calc(100% - 145px);">${event.name || event.event_type_name || '-'}</span>
          </div>
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong style="display: inline-block; width: 140px; color: #555; vertical-align: top;">Fecha y hora de inicio:</strong>
            <span style="color: #2c3e50; display: inline-block; width: calc(100% - 145px);">
              ${event.start_time ? new Date(event.start_time).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
            </span>
          </div>
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong style="display: inline-block; width: 140px; color: #555; vertical-align: top;">Fecha y hora de fin:</strong>
            <span style="color: #2c3e50; display: inline-block; width: calc(100% - 145px);">
              ${event.end_time ? new Date(event.end_time).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
            </span>
          </div>
        </div>
      </td>
      </tr>
    </table>

    <div style="height: 2px; background: linear-gradient(to right, #A05C25, transparent); margin: 30px 0;"></div>

    <h2 style="font-size: 18px; color: #2c3e50; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 3px solid #A05C25;">
      Requerimientos del Servicio
    </h2>

    <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 30px;">
      <thead>
        <tr>
          <th style="background: #A05C25; color: white; padding: 15px 18px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">Descripción de los Servicios Requeridos</th>
        </tr>
      </thead>
      <tbody>
        ${
          mergedDetails.length > 0
            ? mergedDetails
                .slice(0, 8)
                .map(
                  (line, index) =>
                    `<tr style="background: ${index % 2 === 1 ? '#f8f9fa' : '#ffffff'};"><td style="padding: 14px 18px; font-size: 13px; color: #444; border-bottom: 1px solid #e9ecef;">${line}</td></tr>`,
                )
                .join('')
            : `<tr><td style="padding: 14px 18px; font-size: 13px; color: #444;">—</td></tr>`
        }
      </tbody>
    </table>

    <div style="position: absolute; bottom: 30px; right: 50px; left: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: right;">
      <p style="font-size: 11px; color: #666; margin: 0 0 5px 0;"><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      <p style="font-size: 11px; color: #888; margin: 0;">Documento generado automáticamente</p>
    </div>
  </div>

  <!-- Páginas adicionales si hay más de 8 items -->
  ${
    mergedDetails.length > 8
      ? `
    ${(() => {
      const remainingItems = mergedDetails.slice(8);
      const itemsPerPage = 20;
      const totalPages = Math.ceil(remainingItems.length / itemsPerPage);
      let html = '';

      for (let i = 0; i < totalPages; i++) {
        const start = i * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = remainingItems.slice(start, end);

        html += `
          <div style="page-break-after: ${i < totalPages - 1 ? 'always' : 'auto'}; min-height: 297mm; position: relative; padding: 60px 50px 80px 50px; box-sizing: border-box;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%); padding: 30px 40px; margin: -60px -50px 40px -50px; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; position: relative;">
              <h1 style="font-size: 36px; font-weight: 300; letter-spacing: 3px; margin: 0 0 5px 0;">ORDEN DE COMPRA</h1>
              <p style="font-size: 13px; opacity: 0.8; font-weight: 300; margin: 0;">Código: ${event.event_code} - Página ${i + 2}</p>

              <!-- LOGO -->
              <img src="https://i.postimg.cc/tCyBxPJ9/logo.png"
                alt="Logo empresa"
                style="position: absolute; right: 40px; top: 25px; height: 60px; object-fit: contain;">
            </div>

            <h2 style="font-size: 18px; color: #2c3e50; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 3px solid #A05C25;">
              Requerimientos del Servicio (continuación)
            </h2>

            <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; margin-bottom: 30px;">
              <thead>
                <tr>
                  <th style="background: #A05C25; color: white; padding: 15px 18px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                    Descripción de los Servicios Requeridos
                  </th>
                </tr>
              </thead>
              <tbody>
                ${pageItems
                  .map(
                    (line, index) =>
                      `<tr style="background: ${index % 2 === 1 ? '#f8f9fa' : '#ffffff'};"><td style="padding: 14px 18px; font-size: 13px; color: #444; border-bottom: 1px solid #e9ecef;">${line}</td></tr>`,
                  )
                  .join('')}
              </tbody>
            </table>

            <div style="position: absolute; bottom: 30px; right: 50px; left: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: right;">
              <p style="font-size: 11px; color: #666; margin: 0 0 5px 0;"><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              <p style="font-size: 11px; color: #888; margin: 0;">Documento generado automáticamente</p>
            </div>
          </div>
        `;
      }

      return html;
    })()}
  `
      : ''
  }

</body>
</html>

    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBufferRaw = await page.pdf({ format: 'A4' });
    const pdfBuffer = Buffer.from(pdfBufferRaw);

    await browser.close();
    return pdfBuffer;
  }

  async sendPurchaseOrderPdf(dto: {
    to: string;
    providerName: string;
    providerCompany: string;
    event: any;
    assignations: any[];
  }) {
    const { to, providerName, providerCompany, event, assignations } = dto;

    const clientName =
      `${event.first_name || ''} ${event.last_name || ''}`.trim();

    const pdf = await this.generatePurchaseOrderPdf({
      event,
      assignations,
    });

    const message = `
      <p>Hola <strong>${providerName}</strong>,</p>
      <p>Te enviamos tu orden de compra con los requerimientos asignados para el evento <strong>${event.name}</strong>.</p>
      <p>Por favor revisa el documento adjunto y confirma la recepción.</p>
      <p>Saludos cordiales,<br/><strong>Level Music Corp</strong></p>
    `;

    const todayPE = formatLatamDate(new Date(), 'America/Lima');

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: `Orden de Compra - Level Music Corp - ${todayPE}`,
      html: message,
      attachments: [
        {
          filename: `ORDEN_${event.event_code}_${providerCompany}.pdf`,
          content: pdf,
        },
      ],
    });
  }
}
