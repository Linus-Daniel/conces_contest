export interface EmailTemplateData {
  fullName: string;
  email: string;
  authToken: string;
  institution: string;
  department: string;
}

export const getWelcomeEmailHTML = (data: EmailTemplateData): string => {
  const contestDeadline = new Date();
  contestDeadline.setDate(contestDeadline.getDate() + 30);
  const formattedDeadline = contestDeadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Logo Rebrand Challenge 2024</p>
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
                                                    <strong>Download the Contest Pack</strong> - Brand guidelines & requirements
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
                                        <a href="https://brandchallenge.conces.org/submit?token=${data.authToken}" 
                                           style="display: inline-block; background-color: #00B894; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                            Start Designing Now →
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
                                Need help? Contact us at <a href="mailto:support@conces.org" style="color: #00B894; text-decoration: none;">support@conces.org</a>
                            </p>
                            
                            <!-- Social Links -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px 0;">
                                <tr>
                                    <td style="padding: 0 10px;">
                                        <a href="#" style="color: #002B5B; text-decoration: none; font-size: 20px;">f</a>
                                    </td>
                                    <td style="padding: 0 10px;">
                                        <a href="#" style="color: #002B5B; text-decoration: none; font-size: 20px;">𝕏</a>
                                    </td>
                                    <td style="padding: 0 10px;">
                                        <a href="#" style="color: #002B5B; text-decoration: none; font-size: 20px;">in</a>
                                    </td>
                                    <td style="padding: 0 10px;">
                                        <a href="#" style="color: #002B5B; text-decoration: none; font-size: 20px;">ig</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                © 2024 CONCES. All rights reserved.<br>
                                Council of Nigerian Engineering Students
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

Start designing now: https://brandchallenge.conces.org/submit?token=${data.authToken}

Need help? Contact us at support@conces.org

Let's go!
— CONCES Team

© 2024 CONCES. All rights reserved.
Council of Nigerian Engineering Students
`;
};
