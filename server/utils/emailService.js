const nodemailer = require('nodemailer');

// Create transporter (using Gmail as example)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
exports.sendEmail = async (to, subject, html) => {
  try {
    // In development, log instead of actually sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('HTML:', html);
      return true;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Feedback-specific email templates
exports.sendFeedbackConfirmation = async (email, feedbackData) => {
  const subject = 'Thank You for Your Feedback - RiseUp Connect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4F46E5; margin: 0;">RiseUp Connect</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Thank you for your feedback!</p>
      </div>
      
      <div style="background: #F8FAFC; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #1F2937; margin-top: 0;">We've Received Your Feedback</h2>
        <p style="color: #4B5563; line-height: 1.6;">
          Thank you for taking the time to share your ${feedbackData.type} with us. 
          Your input is valuable and helps us improve the platform for everyone.
        </p>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #374151; margin-top: 0;">Feedback Summary</h3>
          <p><strong>Type:</strong> ${feedbackData.type.charAt(0).toUpperCase() + feedbackData.type.slice(1)}</p>
          <p><strong>Title:</strong> ${feedbackData.title}</p>
          ${feedbackData.rating ? `<p><strong>Rating:</strong> ${'⭐'.repeat(feedbackData.rating)}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #1F2937;">What Happens Next?</h3>
        <ul style="color: #4B5563; line-height: 1.6;">
          <li>Our team will review your feedback</li>
          <li>Bug reports are typically addressed within 48 hours</li>
          <li>Feature requests are evaluated in our weekly planning</li>
          <li>We may contact you for more details if needed</li>
        </ul>
      </div>

      <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center;">
        <p style="color: #6B7280; font-size: 14px;">
          Best regards,<br>
          <strong>The RiseUp Connect Team</strong>
        </p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await exports.sendEmail(email, subject, html);
};