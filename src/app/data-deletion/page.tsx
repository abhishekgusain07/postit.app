import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion - PostAhead',
  description: 'Instructions for deleting your data from PostAhead',
};

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Deletion Instructions</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delete Your PostAhead Account and Data</h2>
              <p className="text-gray-700 mb-4">
                You can delete your PostAhead account and all associated data at any time. This will permanently remove:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Your account profile and settings</li>
                <li>All connected social media accounts and tokens</li>
                <li>Your posted content and scheduling history</li>
                <li>Analytics data and insights</li>
                <li>Payment and subscription information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Delete Your Data</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Method 1: Through Your Account Settings</h3>
                <ol className="list-decimal pl-6 text-blue-800 space-y-2">
                  <li>Log into your PostAhead account</li>
                  <li>Go to Settings → Account</li>
                  <li>Scroll down to "Danger Zone"</li>
                  <li>Click "Delete Account"</li>
                  <li>Enter your password to confirm</li>
                  <li>Click "Permanently Delete Account"</li>
                </ol>
              </div>

              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Method 2: Email Request</h3>
                <p className="text-gray-700 mb-2">
                  If you cannot access your account, email us at:
                </p>
                <p className="text-lg font-semibold text-gray-900">privacy@postahead.com</p>
                <p className="text-gray-700 mt-2">
                  Include your registered email address and request account deletion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Facebook/Instagram Data Deletion</h2>
              <p className="text-gray-700 mb-4">
                When you delete your PostAhead account, we will also:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Revoke all access tokens for your connected social media accounts</li>
                <li>Delete all cached data from your Facebook and Instagram accounts</li>
                <li>Remove any profile information obtained through Facebook Login</li>
                <li>Stop all scheduled posts and content management</li>
              </ul>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Important Note</h3>
                <p className="text-yellow-800">
                  Deleting your PostAhead account does not delete the content you've already posted to your social media accounts. 
                  To delete that content, you'll need to remove it directly from each platform.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Deletion Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Immediate (0-24 hours)</h3>
                    <p className="text-gray-700">Account deactivation, social media tokens revoked, login access removed</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Within 7 days</h3>
                    <p className="text-gray-700">Personal data, content, and analytics deleted from active systems</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Within 30 days</h3>
                    <p className="text-gray-700">Complete removal from all systems including backups (except where legally required to retain)</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Data We Keep</h2>
              <p className="text-gray-700 mb-4">
                After deletion, we may retain some data for legitimate business purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Legal compliance:</strong> Financial records as required by law (up to 7 years)</li>
                <li><strong>Security:</strong> Anonymized logs for fraud prevention (up to 1 year)</li>
                <li><strong>Analytics:</strong> Aggregated, anonymized usage statistics</li>
              </ul>
              
              <p className="text-gray-700">
                This retained data cannot be used to identify you personally.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Before You Delete</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <h3 className="text-lg font-medium text-red-900 mb-2">⚠️ This Action Cannot Be Undone</h3>
                <p className="text-red-800 mb-2">
                  Account deletion is permanent. Consider these alternatives:
                </p>
                <ul className="list-disc pl-6 text-red-800 space-y-1">
                  <li>Disconnect specific social media accounts instead of deleting everything</li>
                  <li>Cancel your subscription while keeping your account</li>
                  <li>Export your data before deletion</li>
                  <li>Contact support if you're having issues</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Export Your Data</h2>
              <p className="text-gray-700 mb-4">
                Before deleting your account, you can export your data:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 mb-4">
                <li>Go to Settings → Data Export</li>
                <li>Select the data types you want to export</li>
                <li>Click "Request Export"</li>
                <li>We'll email you a download link within 24 hours</li>
              </ol>
              <p className="text-gray-700">
                Your export will include post history, analytics, and account settings in JSON format.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about data deletion or need assistance:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@postahead.com</p>
                <p className="text-gray-700 mb-2"><strong>Support:</strong> support@postahead.com</p>
                <p className="text-gray-700"><strong>Response Time:</strong> Within 48 hours</p>
              </div>
            </section>

            <section className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                Under privacy laws like GDPR and CCPA, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Request deletion of your personal data</li>
                <li>Receive confirmation that your data has been deleted</li>
                <li>Withdraw consent for data processing</li>
                <li>File a complaint with supervisory authorities</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 