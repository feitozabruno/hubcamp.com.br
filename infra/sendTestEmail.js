import { sendEmail } from "./emailService.js";

async function testEmail() {
  await sendEmail({
    to: "test@example.com",
    subject: "Teste de Email",
    text: "Este é um teste simples.",
    html: "<p>Este é um teste simples.</p>",
  });
}

testEmail();
