/**
 * Mock Email Service
 *
 * This is a mock email service for development and testing purposes.
 * In a production environment, this should be replaced with a real email service
 * like Resend, Nodemailer, or AWS SES.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  console.log("--- MOCK EMAIL SERVICE ---");
  console.log(
    "WARNING: This is a mock email service. In production, configure a real email provider.",
  );
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log("Body (HTML):");
  console.log(options.html);
  console.log("--- END MOCK EMAIL SERVICE ---");

  // In a real implementation, this would return a promise that resolves or rejects
  // based on the email sending status. For this mock, we'll always resolve.
  return Promise.resolve();
};
