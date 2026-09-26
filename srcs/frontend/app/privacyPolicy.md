
# Privacy Policy

**Last Updated:** [Insert Date]

This Privacy Policy explains how **[Insert App Name]** ("we," "us," or "our") collects, uses, and protects your information when you use our application (the "Service"). By using the Service, you agree to the practices described in this policy.

## 1. Our Guarantees to You

We are committed to protecting your privacy. We explicitly guarantee the following:

### 1.1 Secure Authentication
Your account authentication is secure. **We do not know your password.** All passwords are encrypted (hashed) in our database before storage. We cannot retrieve or view your plain-text password at any time.

### 1.2 Secure File Storage
All files you upload to the Service are stored in a secure S3 (cloud storage) service. **The only exception is your profile picture**, which is stored separately to allow for faster display and public access within the app.

### 1.3 Message Storage and Access
All messages, including direct messages and channel messages, are stored in our database. **These messages are not end-to-end encrypted.** Access to this database is strictly limited to a handful of authorized personnel (the developers of the website). We do not read your messages unless required for security, moderation, or legal compliance.

### 1.4 No Sharing of User Details
**We will not share your personal user details with third parties.** We do not sell, rent, or trade your personal information to advertisers or other external companies.

## 2. Information We Collect

To provide the Service, we collect the following types of information:

- **Account Information:** Username, email address, and encrypted password.
- **Profile Information:** Profile picture and any optional details you add to your profile.
- **User Content:** Files you upload and messages you send (including channel messages).
- **Technical Data:** IP address, device type, browser type, and usage logs necessary for security and operation.

## 3. How We Use Your Information

We use the information we collect only for the following purposes:

- To create and manage your account.
- To provide, operate, and maintain the Service.
- To store your files and messages as part of the Service's core functionality.
- To ensure the security and integrity of the Service.
- To comply with legal obligations.

## 4. Data Storage and Security

- **Passwords:** Encrypted (hashed) in our database.
- **Files:** Stored in a secure S3 service (except profile pictures).
- **Messages:** Stored in our database, accessible only to authorized developers.
- **Profile Pictures:** Stored separately and may be publicly visible within the Service.

While we take reasonable measures to protect your data, please note that **no method of transmission or storage is 100% secure.** Because messages are not encrypted, we cannot guarantee absolute confidentiality of message content against unauthorized access.

## 5. Data Sharing and Disclosure

We do not share your user details with third parties, except in the following limited circumstances:

- **Legal Requirements:** If required by law, subpoena, or court order.
- **Safety:** To protect the rights, property, or safety of our users, the public, or us.
- **Service Providers:** Trusted third-party providers (such as the S3 storage service) who process data on our behalf under strict confidentiality agreements.

## 6. Data Retention

We retain your information for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymize your data within a reasonable timeframe, unless we are required to retain it for legal reasons.

## 7. Your Rights

Depending on your location, you may have the following rights:

- **Access:** Request a copy of the data we hold about you.
- **Correction:** Request correction of inaccurate data.
- **Deletion:** Request deletion of your account and associated data.
- **Objection:** Object to certain processing of your data.

To exercise these rights, contact us at **[Insert Contact Email]** .

## 8. Children's Privacy

The Service is not intended for children under the age of **[Insert Age, e.g., 13 or 16]** . We do not knowingly collect personal information from children. If we learn we have done so, we will delete it promptly.

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app or via email. Your continued use of the Service after changes constitutes acceptance of the updated policy.

## 10. Contact Us

If you have questions about this Privacy Policy, please contact us at:

**[Insert App Name]**
**[Insert Contact Email]**
**[Insert Physical Address, if applicable]**

---

### Important Notes for You (the Developer)

1. **"Encrypted" vs. "Hashed":** In your original text, you said the password is "encrypted." Technically, passwords should be **hashed** (one-way encryption), not encrypted (two-way). I used "encrypted (hashed)" in the policy to be accurate. You should adjust this based on your actual implementation.
2. **Profile Picture Exception:** You mentioned profile pictures are not in S3. You need to clarify **where** they are stored (e.g., on your own server, in a public folder) and **who can see them**. I noted they may be "publicly visible," but you should confirm this.
3. **Messages Not Encrypted:** This is a significant point. You should be very clear that messages are **not end-to-end encrypted** and that developers can technically read them. This protects you legally if a user assumes privacy that doesn't exist.
4. **Legal Review:** This is a template. For a real app, especially if you have users in the EU (GDPR) or California (CCPA), you should have a lawyer review it.


