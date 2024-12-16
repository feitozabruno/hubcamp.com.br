import { sendEmail } from "infra/emailService";
import orchestrator from "tests/orchestrator";

beforeEach(async () => {
  await orchestrator.clearMailCatcherInbox();
});

test("should send an email correctly", async () => {
  const testEmail = {
    to: "user@example.com",
    subject: "Welcome!",
    text: "Thank you for registering.",
    html: "<p>Thank you for registering.</p>",
  };

  await sendEmail(testEmail);

  const lastEmail = await orchestrator.fetchLastEmail();

  expect(lastEmail.subject).toBe("Welcome!");
  expect(lastEmail.recipients[0]).toBe("<user@example.com>");
});
