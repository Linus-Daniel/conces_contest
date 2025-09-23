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
