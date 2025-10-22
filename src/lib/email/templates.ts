// templates.ts
export interface EmailTemplateData {
  fullName: string;
  email: string;
  authToken: string;
  institution: string;
  department: string;
}

export interface MotivationalEmailData {
  firstName: string;
  email: string;
}

export const getWelcomeEmailHTML = (data: EmailTemplateData): string => {
  const contestDeadline = new Date();
  contestDeadline.setDate(contestDeadline.getDate() + 30);
  const formattedDeadline = "October 7 2025";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CONCES Rebrand Challenge</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #002B5B 0%, #00B894 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">CONCES</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Logo Rebrand Challenge 2025</p>
                        </td>
                    </tr>
                    
                    <!-- Welcome Badge -->
                    <tr>
                        <td align="center" style="padding: 30px 40px 0;">
                            <div style="background: linear-gradient(135deg, #FFC300 0%, #FF6B00 100%); display: inline-block; padding: 10px 30px; border-radius: 25px;">
                                <span style="color: #ffffff; font-size: 16px; font-weight: bold;">🎉 You're In!</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <h2 style="color: #002B5B; font-size: 24px; margin: 0 0 20px 0;">
                                Welcome, ${data.fullName}!
                            </h2>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Congratulations on joining the <strong>CONCES Logo Rebrand Challenge</strong>! You're now part of an exclusive group of creative minds competing for amazing prizes.
                            </p>
                            
                            <!-- Info Cards -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td width="48%" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; vertical-align: top;">
                                        <h3 style="color: #002B5B; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase;">Your Details</h3>
                                        <p style="color: #666666; font-size: 14px; margin: 5px 0;">
                                            <strong>School:</strong> ${data.institution}<br>
                                            <strong>Department:</strong> ${data.department}<br>
                                            <strong>Email:</strong> ${data.email}
                                        </p>
                                    </td>
                                    <td width="4%"></td>
                                    <td width="48%" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; vertical-align: top;">
                                        <h3 style="color: #002B5B; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase;">Contest Info</h3>
                                        <p style="color: #666666; font-size: 14px; margin: 5px 0;">
                                            <strong>Deadline:</strong> ${formattedDeadline}<br>
                                            <strong>Grand Prize:</strong> ₦500,000<br>
                                            <strong>Total Prizes:</strong> ₦1,000,000+
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Auth Token Section -->
                            <div style="background: linear-gradient(135deg, #002B5B 0%, #004080 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px;">Your Unique Access Token</h3>
                                <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                                    <code style="color: #002B5B; font-size: 14px; font-weight: bold; word-break: break-all;">
                                        ${data.authToken}
                                    </code>
                                </div>
                                <p style="color: #ffffff; font-size: 12px; margin: 10px 0 0 0; opacity: 0.9;">
                                    Keep this token safe - you'll need it to submit your designs
                                </p>
                            </div>
                            
                            <!-- Next Steps -->
                            <h3 style="color: #002B5B; font-size: 18px; margin: 30px 0 15px 0;">
                                What's Next? 🚀
                            </h3>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">1</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong><a href="https://brandchallenge.conces.org/pack">View contest pack here for </a> </strong> - Brand guidelines & requirements
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">2</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong>Create Your Design</strong> - Let your creativity shine
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">3</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong>Submit Before ${formattedDeadline}</strong> - Don't miss out!
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://brandchallenge.conces.org/submit" 
                                           style="display: inline-block; background-color: #00B894; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                            Submit your design when ready here →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Tips Section -->
                            <div style="background-color: #FFF3CD; border-left: 4px solid #FFC300; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">
                                    💡 Pro Tips for Success
                                </h4>
                                <ul style="color: #856404; font-size: 14px; margin: 5px 0; padding-left: 20px;">
                                    <li style="margin: 5px 0;">Keep it simple, memorable, and scalable</li>
                                    <li style="margin: 5px 0;">Consider both digital and print applications</li>
                                    <li style="margin: 5px 0;">Reflect Nigerian engineering excellence</li>
                                    <li style="margin: 5px 0;">Submit multiple variations for better chances</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-radius: 0 0 10px 10px;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                                Need help? Contact us at <a href="mailto:goodnews@conces.org" style="color: #00B894; text-decoration: none;">goodnews@conces.org</a>
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                              <tr>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/share/173jPb1P73/">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M22.675 0h-21.35C.597 0 0 .598 0 1.333v21.333C0 23.402.597 24 1.325 24H12.82V14.708h-3.13V11.08h3.13V8.414c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.466.099 2.797.143v3.243l-1.918.001c-1.504 0-1.795.715-1.795 1.764v2.303h3.587l-.467 3.628h-3.12V24h6.116c.728 0 1.325-.598 1.325-1.334V1.333C24 .598 23.403 0 22.675 0z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://x.com/concesofficial?t=l3hLqtzs5ZHcgBrUV0PfNw&s=09">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.197-6.803-5.94 6.803H1.726l7.72-8.85L1.25 2.25h7.59l4.713 6.231L18.244 2.25zm-1.16 17.52h1.833L7.084 4.63H5.117l11.967 15.14z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/concesofficial?igsh=MXZ4aW5wb2Q5M2IxNg==">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.348 3.608 1.322.975.975 1.26 2.242 1.322 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.347 2.633-1.322 3.608-.975.975-2.242 1.26-3.608 1.322-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.347-3.608-1.322-.975-.975-1.26-2.242-1.322-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.347-2.633 1.322-3.608.975-.975 2.242-1.26 3.608-1.322C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.795.07-1.042.048-1.61.218-1.982.417-.5.27-.855.594-1.225 1.225-.199.372-.369.94-.417 1.982-.058 1.247-.07 1.625-.07 4.795s.012 3.548.07 4.795c.048 1.042.218 1.61.417 1.982.37.63.725.955 1.225 1.225.372.199.94.369 1.982.417 1.247.058 1.625.07 4.795.07s3.548-.012 4.795-.07c1.042-.048 1.61-.218 1.982-.417.5-.27.855-.594 1.225-1.225.199-.372.369-.94.417-1.982.058-1.247.07-1.625.07-4.795s-.012-3.548-.07-4.795c-.048-1.042-.218-1.61-.417-1.982-.37-.63-.725-.955-1.225-1.225-.372-.199-.94-.369-1.982-.417-1.247-.058-1.625-.07-4.795-.07zm0 3.945a5.892 5.892 0 1 1 0 11.784 5.892 5.892 0 0 1 0-11.784zm0 1.837a4.055 4.055 0 1 0 0 8.11 4.055 4.055 0 0 0 0-8.11zm6.406-3.394a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/@concesofficial">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a2.97 2.97 0 0 0-2.09-2.103C19.413 3.5 12 3.5 12 3.5s-7.413 0-9.408.583a2.97 2.97 0 0 0-2.09 2.103C0 8.184 0 12 0 12s0 3.816.502 5.814a2.97 2.97 0 0 0 2.09 2.103C4.587 20.5 12 20.5 12 20.5s7.413 0 9.408-.583a2.97 2.97 0 0 0 2.09-2.103C24 15.816 24 12 24 12s0-3.816-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                                    </svg>
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2025 CONCES. All rights reserved.<br>
                                Conference of Nigerian Christian Engineering Students
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

// NEW: Motivational Email Template
export const getMotivationalEmailHTML = (
  data: MotivationalEmailData
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 Reasons to Bring Your Best</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #002B5B 0%, #00B894 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">CONCES</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Logo Rebrand Challenge 2025</p>
                        </td>
                    </tr>
                    
                    <!-- Motivational Badge -->
                    <tr>
                        <td align="center" style="padding: 30px 40px 0;">
                            <div style="background: linear-gradient(135deg, #FFC300 0%, #FF6B00 100%); display: inline-block; padding: 10px 30px; border-radius: 25px;">
                                <span style="color: #ffffff; font-size: 16px; font-weight: bold;">🎯 500 Reasons to Win</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <h2 style="color: #002B5B; font-size: 24px; margin: 0 0 20px 0;">
                                Hi ${data.firstName},
                            </h2>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We just crossed a major milestone — <strong>over 500 engineering and tech students</strong> have now joined the CONCES Logo Rebrand Challenge. 
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-style: italic;">
                                <em>That's 500 minds, 500 dreams, 500 shots at ₦500,000.</em>
                            </p>
                            
                            <!-- Prize Highlight -->
                            <div style="background: linear-gradient(135deg, #002B5B 0%, #004080 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 20px;">₦500,000</h3>
                                <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.9;">
                                    Grand Prize Winner
                                </p>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Think about it. That's enough to buy your dream tech gear. Launch that startup idea. Support your next big move. 
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>This isn't just another design contest. It's a chance to put your name on a national stage.</strong>
                            </p>
                            
                            <!-- Progress Update -->
                            <div style="background-color: #e8f5e8; border-left: 4px solid #00B894; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <p style="color: #333333; font-size: 15px; margin: 0 0 10px 0;">
                                    We've already seen some fantastic entries come in. <em><strong>Creative, bold, and inspiring</strong></em>. But it's not over. Not even close.
                                </p>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                So whether you've started designing or not, this is your reminder to <strong>give it your best shot</strong>. Don't settle for average. Make it count.
                            </p>
                            
                            <!-- Process Info -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #FFC300; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <p style="color: #856404; font-size: 15px; margin: 0;">
                                    <strong>Next Steps:</strong> When this round ends, we'll shortlist entries that will move to the public voting stage. If yours makes the cut, we'll send you an email and WhatsApp update.
                                </p>
                            </div>
                            
                            <!-- Goal Section -->
                            <div style="text-align: center; padding: 20px 0;">
                                <h3 style="color: #002B5B; font-size: 20px; margin: 0 0 15px 0;">
                                    🎯 The Goal?
                                </h3>
                                <p style="color: #333333; font-size: 16px; font-style: italic; margin: 0;">
                                    <em><strong>Take home the ₦500,000 grand prize and earn national recognition</strong></em>
                                </p>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0; text-align: center;">
                                Let your creativity lead the way. <strong>You've got this.</strong>
                            </p>
                            
                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://brandchallenge.conces.org/submit" 
                                           style="display: inline-block; background-color: #00B894; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                            Submit Your Entry Now →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-radius: 0 0 10px 10px;">
                            <p style="color: #333333; font-size: 14px; margin: 0 0 15px 0; font-weight: bold;">
                                — Team CONCES
                            </p>
                            <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                                Conference of Nigerian Christian Engineering Students
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                              <tr>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/share/173jPb1P73/">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M22.675 0h-21.35C.597 0 0 .598 0 1.333v21.333C0 23.402.597 24 1.325 24H12.82V14.708h-3.13V11.08h3.13V8.414c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.466.099 2.797.143v3.243l-1.918.001c-1.504 0-1.795.715-1.795 1.764v2.303h3.587l-.467 3.628h-3.12V24h6.116c.728 0 1.325-.598 1.325-1.334V1.333C24 .598 23.403 0 22.675 0z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://x.com/concesofficial?t=l3hLqtzs5ZHcgBrUV0PfNw&s=09">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.197-6.803-5.94 6.803H1.726l7.72-8.85L1.25 2.25h7.59l4.713 6.231L18.244 2.25zm-1.16 17.52h1.833L7.084 4.63H5.117l11.967 15.14z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/concesofficial?igsh=MXZ4aW5wb2Q5M2IxNg==">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.348 3.608 1.322.975.975 1.26 2.242 1.322 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.347 2.633-1.322 3.608-.975.975-2.242 1.26-3.608 1.322-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.347-3.608-1.322-.975-.975-1.26-2.242-1.322-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.347-2.633 1.322-3.608.975-.975 2.242-1.26 3.608-1.322C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.795.07-1.042.048-1.61.218-1.982.417-.5.27-.855.594-1.225 1.225-.199.372-.369.94-.417 1.982-.058 1.247-.07 1.625-.07 4.795s.012 3.548.07 4.795c.048 1.042.218 1.61.417 1.982.37.63.725.955 1.225 1.225.372.199.94.369 1.982.417 1.247.058 1.625.07 4.795.07s3.548-.012 4.795-.07c1.042-.048 1.61-.218 1.982-.417.5-.27.855-.594 1.225-1.225.199-.372.369-.94.417-1.982.058-1.247.07-1.625.07-4.795s-.012-3.548-.07-4.795c-.048-1.042-.218-1.61-.417-1.982-.37-.63-.725-.955-1.225-1.225-.372-.199-.94-.369-1.982-.417-1.247-.058-1.625-.07-4.795-.07zm0 3.945a5.892 5.892 0 1 1 0 11.784 5.892 5.892 0 0 1 0-11.784zm0 1.837a4.055 4.055 0 1 0 0 8.11 4.055 4.055 0 0 0 0-8.11zm6.406-3.394a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/@concesofficial">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a2.97 2.97 0 0 0-2.09-2.103C19.413 3.5 12 3.5 12 3.5s-7.413 0-9.408.583a2.97 2.97 0 0 0-2.09 2.103C0 8.184 0 12 0 12s0 3.816.502 5.814a2.97 2.97 0 0 0 2.09 2.103C4.587 20.5 12 20.5 12 20.5s7.413 0 9.408-.583a2.97 2.97 0 0 0 2.09-2.103C24 15.816 24 12 24 12s0-3.816-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                                    </svg>
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2025 CONCES. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

export const getMotivationalEmailText = (
  data: MotivationalEmailData
): string => {
  return `
500 Reasons to Bring Your Best 🎯

Hi ${data.firstName},

We just crossed a major milestone — over 500 engineering and tech students have now joined the CONCES Logo Rebrand Challenge. That's 500 minds, 500 dreams, 500 shots at ₦500,000.

Yes — ₦500,000 is up for grabs for the grand winner.

Think about it. That's enough to buy your dream tech gear. Launch that startup idea. Support your next big move. This isn't just another design contest. It's a chance to put your name on a national stage.

We've already seen some fantastic entries come in. Creative, bold, and inspiring. But it's not over. Not even close.

So whether you've started designing or not, this is your reminder to give it your best shot. Don't settle for average. Make it count.

When this round ends, we'll shortlist entries that will move to the public voting stage. If yours makes the cut, we'll send you an email and WhatsApp update.

🎯 The goal? Take home the ₦500,000 grand prize and earn national recognition.

Let your creativity lead the way. You've got this.

Submit your entry: https://brandchallenge.conces.org/submit

—
Team CONCES
Conference of Nigerian Christian Engineering Students

© 2025 CONCES. All rights reserved.
`;
};

export const getWelcomeEmailText = (data: EmailTemplateData): string => {
  const contestDeadline = new Date();
  contestDeadline.setDate(contestDeadline.getDate() + 30);
  const formattedDeadline = contestDeadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `
Welcome to CONCES Logo Rebrand Challenge!

Hi ${data.fullName},

You're in! Welcome to the CONCES Logo Rebrand Challenge.

YOUR DETAILS:
- School: ${data.institution}
- Department: ${data.department}
- Email: ${data.email}

YOUR UNIQUE ACCESS TOKEN:
${data.authToken}

(Keep this token safe - you'll need it to submit your designs)

CONTEST INFORMATION:
- Deadline: ${formattedDeadline}
- Grand Prize: ₦500,000
- Total Prizes: Over ₦1,000,000

WHAT'S NEXT?
1. Download the Contest Pack - Brand guidelines & requirements
2. Create Your Design - Let your creativity shine
3. Submit Before ${formattedDeadline} - Don't miss out!

PRO TIPS FOR SUCCESS:
- Keep it simple, memorable, and scalable
- Consider both digital and print applications
- Reflect Nigerian engineering excellence
- Submit multiple variations for better chances

To submit you design when ready visit: https://brandchallenge.conces.org/submit and insert your token

Need help? Contact us at goodnews@conces.org

Let's go!
— CONCES Team

© 2025 CONCES. All rights reserved.
Conference of Nigerian Engineering Students
`;
};



// Add to lib/templates.ts

export interface LastCallEmailData {
  firstName: string;
  email: string;
}

export const getLastCallEmailHTML = (data: LastCallEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Last Call - Contest Ends in 7 Days</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #002B5B 0%, #00B894 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">CONCES</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Logo Rebrand Challenge 2025</p>
                        </td>
                    </tr>
                    
                    <!-- Urgent Badge -->
                    <tr>
                        <td align="center" style="padding: 30px 40px 0;">
                            <div style="background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%); display: inline-block; padding: 10px 30px; border-radius: 25px;">
                                <span style="color: #ffffff; font-size: 16px; font-weight: bold;">⏰ Last Call - 7 Days Left!</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <h2 style="color: #002B5B; font-size: 24px; margin: 0 0 20px 0;">
                                Hi ${data.firstName},
                            </h2>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                You've signed up for the <strong>CONCES Logo Rebrand Challenge</strong> — now it's time to finish strong.
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>If you have not submitted your entry, it's time.</strong>
                            </p>
                            
                            <!-- Deadline Box -->
                            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid #F59E0B;">
                                <p style="color: #92400E; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">Deadline to Submit</p>
                                <h3 style="color: #78350F; margin: 0; font-size: 32px; font-weight: bold;">October 7</h3>
                                <p style="color: #92400E; margin: 10px 0 0 0; font-size: 14px;">⏳ Don't miss this opportunity!</p>
                            </div>
                            
                            <!-- Prize Highlight -->
                            <div style="background: linear-gradient(135deg, #002B5B 0%, #004080 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 20px;">₦1 Million in Prizes</h3>
                                <p style="color: #FDE68A; font-size: 16px; margin: 0;">
                                    Including a <strong>₦500,000 grand prize</strong>
                                </p>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Over <strong>700 students</strong> have joined the challenge. Some amazing designs are already in — and we'd love to see yours in the final mix.
                            </p>
                            
                            <!-- Next Steps -->
                            <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <h3 style="color: #1E40AF; margin: 0 0 15px 0; font-size: 18px;">
                                    🎯 What to do now:
                                </h3>
                                <ol style="color: #1E3A8A; font-size: 15px; margin: 0; padding-left: 20px;">
                                    <li style="margin: 8px 0;"><strong>Finalize your design</strong></li>
                                    <li style="margin: 8px 0;"><strong>Submit your entry via the website</strong></li>
                                </ol>
                            </div>
                            
                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://brandchallenge.conces.org/submit" 
                                           style="display: inline-block; background-color: #00B894; color: #ffffff; padding: 16px 50px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0, 184, 148, 0.3);">
                                            👉 Submit Your Entry Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Help Section -->
                            <div style="background-color: #F3F4F6; padding: 20px; margin: 25px 0; border-radius: 4px;">
                                <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">
                                    Need help?
                                </h4>
                                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                                    If you're facing any issues or have questions, reply to this email. We're here to help.
                                </p>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                <strong>Let's make your entry count.</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-radius: 0 0 10px 10px;">
                            <p style="color: #333333; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">
                                – The CONCES Team
                            </p>
                            
                            <p style="color: #666666; font-size: 14px; margin: 10px 0;">
                                <a href="https://brandchallenge.conces.org" style="color: #00B894; text-decoration: none; font-weight: bold;">
                                    brandchallenge.conces.org
                                </a>
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                              <tr>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/share/173jPb1P73/">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M22.675 0h-21.35C.597 0 0 .598 0 1.333v21.333C0 23.402.597 24 1.325 24H12.82V14.708h-3.13V11.08h3.13V8.414c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.466.099 2.797.143v3.243l-1.918.001c-1.504 0-1.795.715-1.795 1.764v2.303h3.587l-.467 3.628h-3.12V24h6.116c.728 0 1.325-.598 1.325-1.334V1.333C24 .598 23.403 0 22.675 0z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://x.com/concesofficial?t=l3hLqtzs5ZHcgBrUV0PfNw&s=09">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.197-6.803-5.94 6.803H1.726l7.72-8.85L1.25 2.25h7.59l4.713 6.231L18.244 2.25zm-1.16 17.52h1.833L7.084 4.63H5.117l11.967 15.14z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/concesofficial?igsh=MXZ4aW5wb2Q5M2IxNg==">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.348 3.608 1.322.975.975 1.26 2.242 1.322 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.347 2.633-1.322 3.608-.975.975-2.242 1.26-3.608 1.322-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.347-3.608-1.322-.975-.975-1.26-2.242-1.322-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.347-2.633 1.322-3.608.975-.975 2.242-1.26 3.608-1.322C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.795.07-1.042.048-1.61.218-1.982.417-.5.27-.855.594-1.225 1.225-.199.372-.369.94-.417 1.982-.058 1.247-.07 1.625-.07 4.795s.012 3.548.07 4.795c.048 1.042.218 1.61.417 1.982.37.63.725.955 1.225 1.225.372.199.94.369 1.982.417 1.247.058 1.625.07 4.795.07s3.548-.012 4.795-.07c1.042-.048 1.61-.218 1.982-.417.5-.27.855-.594 1.225-1.225.199-.372.369-.94.417-1.982.058-1.247.07-1.625.07-4.795s-.012-3.548-.07-4.795c-.048-1.042-.218-1.61-.417-1.982-.37-.63-.725-.955-1.225-1.225-.372-.199-.94-.369-1.982-.417-1.247-.058-1.625-.07-4.795-.07zm0 3.945a5.892 5.892 0 1 1 0 11.784 5.892 5.892 0 0 1 0-11.784zm0 1.837a4.055 4.055 0 1 0 0 8.11 4.055 4.055 0 0 0 0-8.11zm6.406-3.394a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
                                    </svg>
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2025 CONCES. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

export const getLastCallEmailText = (data: LastCallEmailData): string => {
  return `
Last Call: Submit Your Entry — Contest Ends in 7 Days!

Hi ${data.firstName},

You've signed up for the CONCES Logo Rebrand Challenge — now it's time to finish strong.

If you have not submitted your entry, it's time.

The deadline to submit your entry is almost here: October 7 ⏳

₦1 million in prizes is still up for grabs — including a ₦500,000 grand prize.

Over 700 students have joined the challenge. Some amazing designs are already in — and we'd love to see yours in the final mix.

🎯 What to do now:
1. Finalize your design
2. Submit your entry via the website

👉 https://brandchallenge.conces.org/submit

Need help?
If you're facing any issues or have questions, reply to this email. We're here to help.

Let's make your entry count.

– The CONCES Team
brandchallenge.conces.org

© 2025 CONCES. All rights reserved.
`;
};

// Add to lib/email-service.ts




// Add to templates.ts

export interface VotingStageEmailData {
  firstName: string;
  email: string;
}

export const getVotingStageEmailHTML = (data: VotingStageEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You Made It! Time to Prepare for the Voting Stage</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #002B5B 0%, #00B894 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">CONCES</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Logo Rebrand Challenge 2025</p>
                        </td>
                    </tr>
                    
                    <!-- Success Badge -->
                    <tr>
                        <td align="center" style="padding: 30px 40px 0;">
                            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); display: inline-block; padding: 10px 30px; border-radius: 25px;">
                                <span style="color: #ffffff; font-size: 16px; font-weight: bold;">🗳️✨ You Made It!</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Hero Message -->
                    <tr>
                        <td align="center" style="padding: 20px 40px;">
                            <h2 style="color: #002B5B; font-size: 28px; margin: 0; line-height: 1.3;">
                                You're in. Now, it's time to show<br>the world what you've created.
                            </h2>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Dear ${data.firstName},
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>Congratulations! 🎉</strong>
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Out of <strong>over a thousand students</strong> across Nigeria, your entry has qualified for the first voting stage of the CONCES Logo Rebrand Challenge.
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>This is no small feat, and we're proud of what you've done.</strong>
                            </p>
                            
                            <!-- What Happens Next Section -->
                            <div style="background-color: #F0F9FF; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <h3 style="color: #002B5B; font-size: 20px; margin: 0 0 20px 0;">
                                    Here's what happens next:
                                </h3>
                                
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="font-size: 20px; vertical-align: middle;">🗓️</span>
                                            <span style="color: #333333; font-size: 15px; margin-left: 10px;">
                                                <strong>Voting opens October 22 and closes November 4.</strong>
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="font-size: 20px; vertical-align: middle;">📲</span>
                                            <span style="color: #333333; font-size: 15px; margin-left: 10px;">
                                                <strong>You'll receive a unique voting link for your entry.</strong> Share it widely: friends, classmates, groups, alumni.
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="font-size: 20px; vertical-align: middle;">🌍</span>
                                            <span style="color: #333333; font-size: 15px; margin-left: 10px;">
                                                <strong>You can also share the general contest link</strong> to let others see all entries.
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="font-size: 20px; vertical-align: middle;">📣</span>
                                            <span style="color: #333333; font-size: 15px; margin-left: 10px;">
                                                <strong>The entries with the most votes and with the Judges blessing</strong> will move on to the semi-final stage, where things get even more exciting.
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="font-size: 20px; vertical-align: middle;">🎯</span>
                                            <span style="color: #333333; font-size: 15px; margin-left: 10px;">
                                                <strong>And yes, the final goal remains that ₦500,000 Grand Prize</strong>—and over ₦1,000,000 in total rewards.
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Prize Highlight -->
                            <div style="background: linear-gradient(135deg, #FFC300 0%, #FF6B00 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 24px;">₦500,000</h3>
                                <p style="color: #ffffff; font-size: 16px; margin: 0;">
                                    Grand Prize Winner
                                </p>
                                <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">
                                    Over ₦1,000,000 in total rewards
                                </p>
                            </div>
                            
                            <!-- Next Steps -->
                            <div style="background-color: #F9FAFB; border-left: 4px solid #00B894; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="color: #002B5B; font-size: 18px; margin: 0 0 15px 0;">
                                    Next Steps:
                                </h3>
                                <ul style="color: #333333; font-size: 15px; margin: 0; padding-left: 20px;">
                                    <li style="margin: 8px 0;">Get ready to promote your design.</li>
                                    <li style="margin: 8px 0;">Use your voice and creativity to share your story.</li>
                                    <li style="margin: 8px 0;">Watch out for your link—it's coming soon via SMS.</li>
                                </ul>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0; text-align: center; font-weight: bold;">
                                Let the journey to the top begin.
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0; text-align: center;">
                                <strong>You've earned your place here. Now own it.</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-radius: 0 0 10px 10px;">
                            <p style="color: #333333; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">
                                — Team CONCES
                            </p>
                            
                            <p style="color: #666666; font-size: 14px; margin: 15px 0;">
                                Need help? Contact us at <a href="mailto:goodnews@conces.org" style="color: #00B894; text-decoration: none;">goodnews@conces.org</a>
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                              <tr>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/share/173jPb1P73/">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M22.675 0h-21.35C.597 0 0 .598 0 1.333v21.333C0 23.402.597 24 1.325 24H12.82V14.708h-3.13V11.08h3.13V8.414c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.466.099 2.797.143v3.243l-1.918.001c-1.504 0-1.795.715-1.795 1.764v2.303h3.587l-.467 3.628h-3.12V24h6.116c.728 0 1.325-.598 1.325-1.334V1.333C24 .598 23.403 0 22.675 0z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://x.com/concesofficial?t=l3hLqtzs5ZHcgBrUV0PfNw&s=09">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.197-6.803-5.94 6.803H1.726l7.72-8.85L1.25 2.25h7.59l4.713 6.231L18.244 2.25zm-1.16 17.52h1.833L7.084 4.63H5.117l11.967 15.14z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/concesofficial?igsh=MXZ4aW5wb2Q5M2IxNg==">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.348 3.608 1.322.975.975 1.26 2.242 1.322 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.347 2.633-1.322 3.608-.975.975-2.242 1.26-3.608 1.322-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.347-3.608-1.322-.975-.975-1.26-2.242-1.322-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.347-2.633 1.322-3.608.975-.975 2.242-1.26 3.608-1.322C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.795.07-1.042.048-1.61.218-1.982.417-.5.27-.855.594-1.225 1.225-.199.372-.369.94-.417 1.982-.058 1.247-.07 1.625-.07 4.795s.012 3.548.07 4.795c.048 1.042.218 1.61.417 1.982.37.63.725.955 1.225 1.225.372.199.94.369 1.982.417 1.247.058 1.625.07 4.795.07s3.548-.012 4.795-.07c1.042-.048 1.61-.218 1.982-.417.5-.27.855-.594 1.225-1.225.199-.372.369-.94.417-1.982.058-1.247.07-1.625.07-4.795s-.012-3.548-.07-4.795c-.048-1.042-.218-1.61-.417-1.982-.37-.63-.725-.955-1.225-1.225-.372-.199-.94-.369-1.982-.417-1.247-.058-1.625-.07-4.795-.07zm0 3.945a5.892 5.892 0 1 1 0 11.784 5.892 5.892 0 0 1 0-11.784zm0 1.837a4.055 4.055 0 1 0 0 8.11 4.055 4.055 0 0 0 0-8.11zm6.406-3.394a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
                                    </svg>
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2025 CONCES. All rights reserved.<br>
                                Conference of Nigerian Christian Engineering Students
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

export const getVotingStageEmailText = (data: VotingStageEmailData): string => {
  return `
You Made It! Time to Prepare for the Voting Stage 🗳️✨

You're in. Now, it's time to show the world what you've created.

Dear ${data.firstName},

Congratulations! 🎉

Out of over a thousand students across Nigeria, your entry has qualified for the first voting stage of the CONCES Logo Rebrand Challenge.

This is no small feat, and we're proud of what you've done.

Here's what happens next:

🗓️ Voting opens October 22 and closes November 4.

📲 You'll receive a unique voting link for your entry. Share it widely: friends, classmates, groups, alumni.

🌍 You can also share the general contest link to let others see all entries.

📣 The entries with the most votes and with the Judges blessing will move on to the semi-final stage, where things get even more exciting.

🎯 And yes, the final goal remains that ₦500,000 Grand Prize—and over ₦1,000,000 in total rewards.

Next Steps:
- Get ready to promote your design.
- Use your voice and creativity to share your story.
- Watch out for your link—it's coming soon via SMS.

Let the journey to the top begin.

You've earned your place here. Now own it.

— Team CONCES

Need help? Contact us at goodnews@conces.org
Visit: https://brandchallenge.conces.org

© 2025 CONCES. All rights reserved.
Conference of Nigerian Christian Engineering Students
`;
};

// Voting Card Email Template
export interface VotingCardEmailData {
  firstName: string;
  email: string;
  projectTitle?: string;
  candidateName: string;
}

export const getVotingCardEmailHTML = (data: VotingCardEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your CONCES Logo Rebrand Challenge Voting Card Is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #002B5B 0%, #00B894 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">CONCES</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Logo Rebrand Challenge 2025</p>
                        </td>
                    </tr>
                    
                    <!-- Celebration Badge -->
                    <tr>
                        <td align="center" style="padding: 30px 40px 0;">
                            <div style="background: linear-gradient(135deg, #FFC300 0%, #FF6B00 100%); display: inline-block; padding: 10px 30px; border-radius: 25px;">
                                <span style="color: #ffffff; font-size: 16px; font-weight: bold;">🎉 Your Voting Card Is Ready!</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <h2 style="color: #002B5B; font-size: 24px; margin: 0 0 20px 0;">
                                Dear ${data.candidateName},
                            </h2>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>Congratulations once again on making it to the first stage of the CONCES Logo Rebrand Challenge! 👏</strong>
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We're excited to let you know that your <strong>personalized voting card and unique voting link are now available!</strong>✨
                            </p>
                            
                            <!-- Facebook Link Section -->
                            <div style="background: linear-gradient(135deg, #4267B2 0%, #365899 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                                <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 20px;">📱 Get Your Voting Card</h3>
                                <p style="color: #ffffff; font-size: 16px; margin: 0 0 20px 0; line-height: 1.5;">
                                    You can download your card and copy your voting link directly from our official Facebook page using the link below 👇
                                </p>
                                <a href="https://www.facebook.com/share/1BdKxeLByf/?mibextid=wwXIfr" 
                                   style="display: inline-block; background-color: #ffffff; color: #4267B2; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 10px 0;">
                                    📲 Visit Facebook Page →
                                </a>
                            </div>
                            
                            <!-- Important Instructions -->
                            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="color: #92400E; margin: 0 0 15px 0; font-size: 18px;">
                                    📝 Important Instructions:
                                </h3>
                                <ul style="color: #92400E; font-size: 15px; margin: 0; padding-left: 20px; line-height: 1.6;">
                                    <li style="margin: 8px 0;"><strong>There are two albums</strong> with all contestants' cards and direct voting links.</li>
                                    <li style="margin: 8px 0;"><strong>Please go through both albums carefully</strong> to locate your card.</li>
                                    <li style="margin: 8px 0;"><strong>Your direct voting link is written in the caption</strong> on your card.</li>
                                </ul>
                            </div>
                            
                            <!-- Share Your Card Section -->
                            <div style="background-color: #F0F9FF; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <h3 style="color: #002B5B; font-size: 20px; margin: 0 0 15px 0;">
                                    🗳️ Remember: Your voting card is a powerful tool!
                                </h3>
                                <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
                                    <strong>Share it widely and encourage your supporters to vote for you!</strong> 🗳✨
                                </p>
                            </div>
                            
                            <!-- Action Steps -->
                            <h3 style="color: #002B5B; font-size: 18px; margin: 30px 0 15px 0;">
                                What to do next:
                            </h3>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">1</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong>Visit the Facebook page</strong> using the link above
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">2</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong>Find your card</strong> in the two albums
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">3</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong>Download your card</strong> and copy your voting link
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="background-color: #00B894; color: #ffffff; width: 30px; height: 30px; text-align: center; border-radius: 50%; font-weight: bold;">4</td>
                                                <td style="padding-left: 15px; color: #333333; font-size: 15px;">
                                                    <strong>Share everywhere!</strong> WhatsApp, Instagram, Twitter, Groups
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Prize Reminder -->
                            <div style="background: linear-gradient(135deg, #002B5B 0%, #004080 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                                <h3 style="color: #FFC300; margin: 0 0 10px 0; font-size: 24px;">₦500,000</h3>
                                <p style="color: #ffffff; font-size: 16px; margin: 0;">
                                    Grand Prize Still Up for Grabs!
                                </p>
                                <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">
                                    Over ₦1,000,000 in total rewards
                                </p>
                            </div>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0; text-align: center; font-weight: bold;">
                                Wishing you the very best!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-radius: 0 0 10px 10px;">
                            <p style="color: #333333; font-size: 14px; margin: 0 0 15px 0; font-weight: bold;">
                                –Team CONCES
                            </p>
                            
                            <p style="color: #666666; font-size: 12px; margin: 15px 0; font-style: italic;">
                                <strong>N.B:</strong> There are two albums with all contestants' cards and direct voting links.<br>
                                Please go through both albums carefully to locate your card — your direct voting link is written in the caption on your card.
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                              <tr>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/share/173jPb1P73/">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M22.675 0h-21.35C.597 0 0 .598 0 1.333v21.333C0 23.402.597 24 1.325 24H12.82V14.708h-3.13V11.08h3.13V8.414c0-3.1 1.893-4.788 4.657-4.788 1.325 0 2.466.099 2.797.143v3.243l-1.918.001c-1.504 0-1.795.715-1.795 1.764v2.303h3.587l-.467 3.628h-3.12V24h6.116c.728 0 1.325-.598 1.325-1.334V1.333C24 .598 23.403 0 22.675 0z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://x.com/concesofficial?t=l3hLqtzs5ZHcgBrUV0PfNw&s=09">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.197-6.803-5.94 6.803H1.726l7.72-8.85L1.25 2.25h7.59l4.713 6.231L18.244 2.25zm-1.16 17.52h1.833L7.084 4.63H5.117l11.967 15.14z"/>
                                    </svg>
                                  </a>
                                </td>
                                <td style="padding: 0 10px;">
                                  <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/concesofficial?igsh=MXZ4aW5wb2Q5M2IxNg==">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#002B5B" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.348 3.608 1.322.975.975 1.26 2.242 1.322 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.347 2.633-1.322 3.608-.975.975-2.242 1.26-3.608 1.322-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.347-3.608-1.322-.975-.975-1.26-2.242-1.322-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.347-2.633 1.322-3.608.975-.975 2.242-1.26 3.608-1.322C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.795.07-1.042.048-1.61.218-1.982.417-.5.27-.855.594-1.225 1.225-.199.372-.369.94-.417 1.982-.058 1.247-.07 1.625-.07 4.795s.012 3.548.07 4.795c.048 1.042.218 1.61.417 1.982.37.63.725.955 1.225 1.225.372.199.94.369 1.982.417 1.247.058 1.625.07 4.795.07s3.548-.012 4.795-.07c1.042-.048 1.61-.218 1.982-.417.5-.27.855-.594 1.225-1.225.199-.372.369-.94.417-1.982.058-1.247.07-1.625.07-4.795s-.012-3.548-.07-4.795c-.048-1.042-.218-1.61-.417-1.982-.37-.63-.725-.955-1.225-1.225-.372-.199-.94-.369-1.982-.417-1.247-.058-1.625-.07-4.795-.07zm0 3.945a5.892 5.892 0 1 1 0 11.784 5.892 5.892 0 0 1 0-11.784zm0 1.837a4.055 4.055 0 1 0 0 8.11 4.055 4.055 0 0 0 0-8.11zm6.406-3.394a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
                                    </svg>
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2025 CONCES. All rights reserved.<br>
                                Conference of Nigerian Christian Engineering Students
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

export const getVotingCardEmailText = (data: VotingCardEmailData): string => {
  return `
🎉 Your CONCES Logo Rebrand Challenge Voting Card Is Ready!

Dear ${data.candidateName},

Congratulations once again on making it to the first stage of the CONCES Logo Rebrand Challenge! 👏

We're excited to let you know that your personalized voting card and unique voting link are now available!✨

You can download your card and copy your voting link directly from our official Facebook page using the link below 👇

https://www.facebook.com/share/1BdKxeLByf/?mibextid=wwXIfr

Remember, your voting card is a powerful tool to help you reach more people—so share it widely and encourage your supporters to vote for you! 🗳✨

WHAT TO DO NEXT:
1. Visit the Facebook page using the link above
2. Find your card in the two albums
3. Download your card and copy your voting link
4. Share everywhere! WhatsApp, Instagram, Twitter, Groups

IMPORTANT:
- There are two albums with all contestants' cards and direct voting links
- Please go through both albums carefully to locate your card
- Your direct voting link is written in the caption on your card

₦500,000 Grand Prize Still Up for Grabs!
Over ₦1,000,000 in total rewards

Wishing you the very best!

–Team CONCES

N.B: There are two albums with all contestants' cards and direct voting links.
Please go through both albums carefully to locate your card — your direct voting link is written in the caption on your card.

© 2025 CONCES. All rights reserved.
Conference of Nigerian Christian Engineering Students
`;
};
