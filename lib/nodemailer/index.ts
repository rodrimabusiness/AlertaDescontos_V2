"use server";

import { EmailContent, EmailProductInfo, NotificationType } from "@/types";
import nodemailer from "nodemailer";

const Notification = {
  WELCOME: "BEM-VINDO",
  CHANGE_OF_STOCK: "ALTERAÇÃO_DE_STOCK",
  LOWEST_PRICE: "PREÇO_MÍNIMO",
  THRESHOLD_MET: "LIMIAR_ATINGIDO",
};

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
) {
  const THRESHOLD_PERCENTAGE = 40;
  // Reduzir o título do produto
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;

  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Bem-vindo ao seguimento de preços para ${shortenedTitle}`;
      body = `
        <div>
          <h2>Bem-vindo ao Alerta Descontos 🚀</h2>
          <p>Agora está a seguir o preço de ${product.title}.</p>
          <p>Eis um exemplo de como irá receber atualizações:</p>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
            <h3>${product.title} está novamente em stock!</h3>
            <p>Estamos entusiasmados por informar que ${product.title} está disponível outra vez.</p>
            <p>Não perca - <a href="${product.url}" target="_blank" rel="noopener noreferrer">compre já</a>!</p>
            <img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Imagem do Produto" style="max-width: 100%;" />
          </div>
          <p>Mantenha-se atento para mais atualizações sobre ${product.title} e outros produtos que está a seguir.</p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} está novamente em stock!`;
      body = `
        <div>
          <h4>Olá, ${product.title} foi reposto! Aproveite antes que esgote novamente!</h4>
          <p>Veja o produto <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a>.</p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Alerta de Preço Mínimo para ${shortenedTitle}`;
      body = `
        <div>
          <h4>Olá, ${product.title} atingiu o seu preço mais baixo de sempre!</h4>
          <p>Adquira o produto <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a> agora.</p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Alerta de Desconto para ${shortenedTitle}`;
      body = `
        <div>
          <h4>Olá, ${product.title} está agora disponível com um desconto superior a ${THRESHOLD_PERCENTAGE}%!</h4>
          <p>Adquira já em <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a>.</p>
        </div>
      `;
      break;

    default:
      throw new Error("Tipo de notificação inválido.");
  }

  return { subject, body };
}

const transporter = nodemailer.createTransport({
  pool: true,
  service: "hotmail",
  port: 2525,
  auth: {
    user: "alertadescontos@outlook.pt",
    pass: process.env.EMAIL_PASSWORD,
  },
  maxConnections: 1,
});

export const sendEmail = async (
  emailContent: EmailContent,
  sendTo: string[]
) => {
  const mailOptions = {
    from: "alertadescontos@outlook.pt",
    to: sendTo,
    html: emailContent.body,
    subject: emailContent.subject,
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.log("Erro ao enviar email: ", error);
      return;
    }

    console.log("Email enviado: ", info);
  });
};
