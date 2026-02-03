/**
 * Google Sheets submission service
 *
 * Sends form data to a Google Apps Script web app that
 * appends rows to a Google Sheet.
 */

const WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbwO9L72qRHgwhgR7fcUBoE-Zpycn-sSv3BYxA45AF3n2H7GnJs6i2WKYlOXhiGjht56Zw/exec';

export interface InterestFormData {
  email: string;
  name: string;
  phone?: string;
  businessName?: string;
  zipCode?: string;
  interestType: 'general' | 'developer' | 'business';
  sourceTab: string;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
}

/**
 * Submit interest form data to Google Sheets
 */
export async function submitInterestForm(
  data: InterestFormData
): Promise<SubmissionResult> {
  if (!WEBAPP_URL) {
    console.warn('Google Sheets webapp URL not configured');
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Form submission:', data);
      return { success: true, message: 'Form logged (dev mode)' };
    }
    return { success: false, message: 'Form submission not configured' };
  }

  try {
    await fetch(WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return { success: true, message: 'Form submitted successfully' };
  } catch (error) {
    console.error('Form submission error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Submission failed',
    };
  }
}
