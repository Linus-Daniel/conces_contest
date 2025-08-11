import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Enroll from '@/models/Enroll';
import { sendWelcomeEmail } from '@/lib/email/emailService';
import crypto from 'crypto';

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Helper function for rate limiting
function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const limit = rateLimitStore.get(ip);
    
    if (!limit || limit.resetTime < now) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + 60000 // 1 minute window
        });
        return true;
    }
    
    if (limit.count >= 5) {
        return false;
    }
    
    limit.count++;
    return true;
}

// Validation function
function validateEnrollmentData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    console.log(data)
    
    // Required fields
    const requiredFields = [
        'fullName', 'email', 'phone', 
        'university', 'department', 'matricNumber'
    ];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${field} is required`);
        }
    }
    
    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Invalid email format');
    }
    
    // Phone number validation (Nigerian format)
    const phoneRegex = /^(\+234|0)[789]\d{9}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
        errors.push('Invalid Nigerian phone number format');
    }
    
    if (!data.agreeToTerms) {
        errors.push('You must accept the terms and conditions');
        console.log('Terms not accepted');
        console.log(data.agreeToTerms);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }
        
        // Parse request data
        const {data} = await request.json();
        
        // Validate input
        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }
        const validation = validateEnrollmentData(data);
        if (!validation.isValid) {
            return NextResponse.json(
                { 
                    error: 'Validation failed',
                    details: validation.errors 
                },
                { status: 400 }
            );
        }
        
        // Connect to database
        await connectDB();
        
        // Check if email already exists
        const existingEnrollment = await Enroll.findOne({ 
            email: data.email.toLowerCase().trim() 
        });
        
        if (existingEnrollment) {
            return NextResponse.json(
                { 
                    error: 'This email is already registered for the contest',
                    suggestion: 'Please use a different email or contact support if you need help'
                },
                { status: 409 } // Conflict status
            );
        }
        
        // Generate unique auth token
        const authToken = crypto.randomBytes(32).toString('hex');
        
        // Create new enrollment
        const enrollment = new Enroll({
            fullName: data.fullName.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            university: data.university.trim(),
            department: data.department.trim(),
            matricNumber: data.matricNumber.trim().toUpperCase(),
            authToken,
            agreeToTerms: data.agreeToTerms
        });
        
        // Save to database
        const savedEnrollment = await enrollment.save();
        
        // Send welcome email
        const emailSent = await sendWelcomeEmail({
            fullName: savedEnrollment.fullName,
            email: savedEnrollment.email,
            authToken: savedEnrollment.authToken,
            university: savedEnrollment.university,
            department: savedEnrollment.department
        });
        
        // Update contest pack status if email was sent
        if (emailSent) {
            savedEnrollment.contestPack.sent = true;
            savedEnrollment.contestPack.sentAt = new Date();
            await savedEnrollment.save();
        }
        
        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful! Check your email for your contest pack.',
                data: {
                    id: savedEnrollment._id,
                    fullName: savedEnrollment.fullName,
                    email: savedEnrollment.email}
            }, 
            { status: 201 }
        );
    }
    catch (error:any) {
        console.error('Error in enrollment route:', error);
        
        // Handle specific errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.message },
                { status: 400 }
            );
        }
        
        // General server error
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
