# University Email OTP Verification Plan (Free Tier)

This document outlines the architecture and implementation steps for a 6-digit OTP verification system using free services. The goal is to verify that users have a valid university email address before they can use their profiles.

## 1. Architecture Overview

To stay within the **free tier** without requiring a credit card (avoiding Firebase Blaze plan requirements), we will use the following stack:

*   **Authentication:** Firebase Auth (Email/Password).
*   **Database:** Firebase Firestore (Spark Plan - Free).
*   **Backend Logic:** Next.js API Routes (hosted on Vercel).
*   **Email Delivery:** [Brevo](https://www.brevo.com/) (formerly Sendinblue) - Free tier allows **300 emails per day**.
*   **OTP Storage:** Firestore collection `temp_verification`.

## 2. The Verification Flow

1.  **Sign Up:** User signs up with their university email (`@uni-trier.de` or similar).
2.  **Initial State:** The user profile in Firestore is created with `isVerified: false`.
3.  **OTP Generation:**
    *   Frontend calls a Next.js API route `/api/otp/send`.
    *   API generates a random 6-digit code.
    *   API stores `{ uid, email, otp, expiresAt }` in Firestore.
4.  **Email Dispatch:**
    *   API sends the code to the user's email using Brevo's SMTP/API.
5.  **User Input:** User enters the 6-digit code on the website.
6.  **Verification:**
    *   Frontend calls `/api/otp/verify`.
    *   API checks the code against Firestore and ensures it hasn't expired.
    *   On success, API updates the user's main profile to `isVerified: true`.
7.  **Access Control:** The app UI checks the `isVerified` flag before allowing access to discovery/matching features.

## 3. Implementation Steps

### Service Setup
1.  **Brevo Account:** Create a free account at [Brevo](https://app.brevo.com/).
2.  **API Key:** Generate an API key from Brevo dashboard.
3.  **Environment Variables:** Add `BREVO_API_KEY` to `.env.local`.

### Database Schema
*   **Collection:** `temp_verification`
    *   `id`: User UID
    *   `otp`: String (e.g., "123456")
    *   `expiresAt`: Timestamp (Current time + 10-15 minutes)

### Backend API Routes
*   `src/app/api/otp/send/route.ts`:
    *   Validate university email domain.
    *   Generate code.
    *   Save to Firestore.
    *   Send email via Brevo.
*   `src/app/api/otp/verify/route.ts`:
    *   Compare user input with Firestore value.
    *   Delete the `temp_verification` document on success.
    *   Update user profile `isVerified: true`.

### Frontend UI
1.  **Verification View:** A new screen (or step in `profile-builder.tsx`) with 6 input boxes.
2.  **State Management:** Handle loading, error (wrong code), and resend timer (60s).

## 4. Security Considerations
*   **Rate Limiting:** Implement a cooldown for "Resend OTP" to prevent spamming the email service.
*   **Expiration:** Codes should expire within 10-15 minutes.
*   **Domain Validation:** Only allow emails ending in the specific university domain.
*   **Server-Side Verification:** Never check the OTP on the client side; always use the API route.

## 5. Cost Summary
| Service | Tier | Cost |
| :--- | :--- | :--- |
| Firebase | Spark | $0 |
| Vercel | Hobby | $0 |
| Brevo | Free | $0 (300 emails/day) |
| **Total** | | **$0** |
