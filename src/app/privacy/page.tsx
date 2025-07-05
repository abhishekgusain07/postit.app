import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - PostAhead',
  description: 'Privacy Policy for PostAhead - Social Media Management Platform',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to PostAhead ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management platform, including our website and mobile application (collectively, the "Service").
              </p>
              <p className="text-gray-700">
                By using our Service, you consent to the data practices described in this Privacy Policy. If you do not agree with the practices described in this Privacy Policy, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">We may collect the following personal information:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Name and email address when you create an account</li>
                <li>Profile information from connected social media accounts</li>
                <li>Payment information for subscription services</li>
                <li>Communication data when you contact us</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Social Media Account Information</h3>
              <p className="text-gray-700 mb-4">When you connect your social media accounts (Instagram, Twitter, LinkedIn, TikTok, YouTube), we collect:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account profile information (username, display name, profile picture)</li>
                <li>Access tokens to manage your content</li>
                <li>Post data and analytics</li>
                <li>Follower and engagement metrics</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Usage Data</h3>
              <p className="text-gray-700 mb-4">We automatically collect:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Log files and analytics data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide, operate, and maintain our Service</li>
                <li>Manage your social media accounts and post content</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you updates, newsletters, and promotional materials</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Analyze usage patterns to improve our Service</li>
                <li>Detect and prevent fraud, abuse, and security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Third-Party Services</h3>
              <p className="text-gray-700 mb-4">We share information with:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Social Media Platforms:</strong> To post content and manage your accounts</li>
                <li><strong>Payment Processors:</strong> To process subscription payments (Stripe)</li>
                <li><strong>Analytics Providers:</strong> To analyze usage and improve our Service (PostHog)</li>
                <li><strong>Cloud Storage:</strong> To store and process your data securely</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose your information if required by law or to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud or security threats</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure hosting infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. Specifically:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account information: Until you delete your account</li>
                <li>Social media tokens: Until you disconnect the account</li>
                <li>Usage data: Up to 2 years for analytics purposes</li>
                <li>Payment data: As required by financial regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                <li><strong>Erasure:</strong> Delete your personal information</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for data processing</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us at privacy@postahead.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries outside your residence. We ensure adequate protection through appropriate safeguards such as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Standard Contractual Clauses</li>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Certified frameworks (Privacy Shield, etc.)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Links</h2>
              <p className="text-gray-700">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Right to know what personal information we collect and how it's used</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Updates to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our Service after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@postahead.com</p>
                <p className="text-gray-700 mb-2"><strong>Website:</strong> https://postahead.com</p>
                <p className="text-gray-700"><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Data Deletion Instructions</h2>
              <p className="text-gray-700 mb-4">
                To delete your data from our platform:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 mb-4">
                <li>Log into your PostAhead account</li>
                <li>Go to Settings → Account</li>
                <li>Click "Delete Account" and follow the instructions</li>
                <li>Alternatively, email us at privacy@postahead.com with your deletion request</li>
              </ol>
              <p className="text-gray-700">
                We will delete your data within 30 days of your request, except where retention is required by law.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 