import nodemailer from 'nodemailer';

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: SendEmailOptions) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('------------------');
    return { mocked: true };
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define the email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return { mocked: false };
  } catch (error) {
    // console.error('Email sending failed, falling back to mock:', error);
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('------------------');
    return { mocked: true };
  }
};

export default sendEmail;
