// src/lib/resend.js
// Shared Resend client - imported by every email helper in /lib/email/*

import { Resend } from 'resend'

// Fail at startup rather than silently at send-time
if (!process.env.RESEND_API_KEY){
    throw new Error('Missing env var: RESEND_API_KEY')
}

// Single instance reused across all transactional emails
export const resend = new Resend(process.env.RESEND_API_KEY)