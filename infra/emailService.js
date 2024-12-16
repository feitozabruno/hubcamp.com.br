import nodemailer from "nodemailer";

const mailTransporter = nodemailer.createTransport({
  host: "localhost", // Mailcatcher roda localmente
  port: 1025, // Porta SMTP do Mailcatcher
  secure: false, // Não usa TLS/SSL (não necessário para Mailcatcher)
});

export async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: '"No Reply" <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("Email enviado com sucesso!");
  } catch (error) {
    console.log("Erro ao enviar email:", error);
    throw error;
  }
}
