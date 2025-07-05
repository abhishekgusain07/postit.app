import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - PostAhead',
  description: 'Terms of Service for PostAhead - Social Media Management Platform',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service ("Terms") govern your use of PostAhead's social media management platform, website, and related services (collectively, the "Service") operated by PostAhead ("us," "we," or "our").
              </p>
              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                PostAhead is a social media management platform that allows users to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Connect and manage multiple social media accounts</li>
                <li>Schedule and publish content across platforms</li>
                <li>Analyze social media performance and engagement</li>
                <li>Collaborate with team members on content creation</li>
                <li>Access social media insights and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To use our Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account at any time for any reason, including violation of these Terms. You may also delete your account at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Permitted Use</h3>
              <p className="text-gray-700 mb-4">
                You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Prohibited Activities</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>To violate any applicable law or regulation</li>
                <li>To post harmful, illegal, or offensive content</li>
                <li>To impersonate others or misrepresent your identity</li>
                <li>To spam, harass, or abuse other users</li>
                <li>To distribute malware or engage in hacking</li>
                <li>To infringe intellectual property rights</li>
                <li>To bypass or circumvent security measures</li>
                <li>To violate social media platform terms of service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Social Media Integration</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Third-Party Platforms</h3>
              <p className="text-gray-700 mb-4">
                Our Service integrates with various social media platforms (Instagram, Twitter, LinkedIn, TikTok, YouTube, etc.). Your use of these integrations is subject to the respective platforms' terms of service and privacy policies.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Platform Compliance</h3>
              <p className="text-gray-700 mb-4">
                You agree to comply with all terms and conditions of the social media platforms you connect to our Service. We are not responsible for changes to third-party platforms that may affect our Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.3 Access Tokens</h3>
              <p className="text-gray-700 mb-4">
                By connecting your social media accounts, you grant us permission to access and manage your accounts on your behalf. You may revoke this access at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Your Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of all content you create, upload, or share through our Service. By using our Service, you grant us a limited license to store, process, and display your content solely for the purpose of providing our Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Our Intellectual Property</h3>
              <p className="text-gray-700 mb-4">
                Our Service, including all software, text, images, and other content, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.3 User-Generated Content</h3>
              <p className="text-gray-700 mb-4">
                You are solely responsible for the content you post through our Service. You represent that you have all necessary rights to your content and that it does not violate any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Subscription and Payment</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 Subscription Plans</h3>
              <p className="text-gray-700 mb-4">
                We offer various subscription plans with different features and pricing. Current pricing is available on our website and may change with notice.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 Payment Terms</h3>
              <p className="text-gray-700 mb-4">
                Subscription fees are charged in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as specified in our refund policy.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.3 Automatic Renewal</h3>
              <p className="text-gray-700 mb-4">
                Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-700">
                By using our Service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">9.1 Service Availability</h3>
              <p className="text-gray-700 mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted access to our Service. We may experience downtime for maintenance, updates, or technical issues.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">9.2 Third-Party Limitations</h3>
              <p className="text-gray-700 mb-4">
                Our Service depends on third-party social media platforms. We are not responsible for changes, limitations, or outages affecting these platforms.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">9.3 Data Loss</h3>
              <p className="text-gray-700 mb-4">
                While we implement backup procedures, we are not liable for any data loss. You are responsible for maintaining backups of your important content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, POSTAHEAD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF YOUR USE OF THE SERVICE.
              </p>
              <p className="text-gray-700">
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless PostAhead from any claims, damages, losses, or expenses arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Dispute Resolution</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">12.1 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">12.2 Arbitration</h3>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration, except for claims that may be brought in small claims court.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by email or through our Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@postahead.com</p>
                <p className="text-gray-700 mb-2"><strong>Website:</strong> https://postahead.com</p>
                <p className="text-gray-700"><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </section>

            <section className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Facebook Platform Policy Compliance</h2>
              <p className="text-gray-700 mb-4">
                By using our Service to connect with Facebook and Instagram, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You will comply with Facebook's Platform Terms and Developer Policies</li>
                <li>You understand that Facebook may limit or terminate API access</li>
                <li>You consent to Facebook's data use policies</li>
                <li>You will not use our Service to violate Facebook's community standards</li>
              </ul>
              <p className="text-gray-700">
                Our Service is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 