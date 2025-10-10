import { MercadoPagoConfig } from 'mercadopago';

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});
