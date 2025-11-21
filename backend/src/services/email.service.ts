import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  content: string;
  replyTo: string;
}

// Create transporter - configure based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use configured email service
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development: Use ethereal.email for testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || '',
        pass: process.env.ETHEREAL_PASS || ''
      }
    });
  }
};

export async function sendComplaintEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"MMT Accountability Platform" <${process.env.EMAIL_USER || 'noreply@mmt-accountability.org'}>`,
    to: options.to,
    subject: options.subject,
    text: options.content,
    replyTo: options.replyTo,
    headers: {
      'X-Sent-Via': 'MMT Accountability Platform',
      'X-Reply-To-User': options.from
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    // Log preview URL in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
}

// Utility to test email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
