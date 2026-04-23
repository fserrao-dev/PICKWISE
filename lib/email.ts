import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "PICKWISE <noreply@pickwise.app>";

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to PICKWISE!",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h1 style="color:#6366f1">Welcome to PICKWISE, ${name}!</h1>
          <p>Your account has been created successfully. Start learning today by browsing our course catalog.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses"
             style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">
            Browse Courses
          </a>
        </div>
      `,
    });
  } catch {
    console.error("Failed to send welcome email");
  }
}

export async function sendEnrollmentEmail(name: string, email: string, courseName: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You're enrolled in ${courseName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h1 style="color:#6366f1">Enrollment Confirmed!</h1>
          <p>Hi ${name}, you've been successfully enrolled in <strong>${courseName}</strong>.</p>
          <p>Start learning now and track your progress on your dashboard.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">
            Go to Dashboard
          </a>
        </div>
      `,
    });
  } catch {
    console.error("Failed to send enrollment email");
  }
}

export async function sendCompletionEmail(
  name: string,
  email: string,
  courseName: string,
  certificateUrl?: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Congratulations! You completed ${courseName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h1 style="color:#6366f1">🎉 Course Completed!</h1>
          <p>Congratulations, ${name}! You've successfully completed <strong>${courseName}</strong>.</p>
          ${certificateUrl ? `<p>Your certificate is ready to download:</p>
          <a href="${certificateUrl}"
             style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">
            Download Certificate
          </a>` : ""}
          <p style="margin-top:24px">Keep up the great work and continue your learning journey!</p>
        </div>
      `,
    });
  } catch {
    console.error("Failed to send completion email");
  }
}

export async function sendNotificationEmail(name: string, email: string, message: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "New Notification from PICKWISE",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#6366f1">Hi ${name},</h2>
          <p>${message}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px">
            View Dashboard
          </a>
        </div>
      `,
    });
  } catch {
    console.error("Failed to send notification email");
  }
}
