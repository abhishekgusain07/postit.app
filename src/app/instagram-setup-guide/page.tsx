"use client"
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Instagram, 
  Settings, 
  User, 
  Building2, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  Camera,
  BarChart3,
  Users,
  Zap,
  Shield,
  Star
} from 'lucide-react';

export default function InstagramSetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
              <Instagram className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Instagram Setup Guide
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Convert your Instagram account to Business or Creator to unlock powerful social media management features with PostAhead
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Business Account
              </Badge>
              <Badge variant="secondary" className="bg-pink-100 text-pink-800 px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Creator Account
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                API Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Why Convert Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Convert to Business/Creator?
          </h2>
          <p className="text-lg text-gray-600">
            Unlock powerful features that personal accounts can't access
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Get detailed analytics about your posts, followers, and engagement to grow your audience effectively.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Professional Tools</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Access professional scheduling tools, content management, and third-party integrations like PostAhead.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Audience Growth</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Reach more people with promoted posts, better discoverability, and professional features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Types Comparison */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Account Type
          </h2>
          <p className="text-lg text-gray-600">
            Both account types work with PostAhead - choose what fits your goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-800">Business Account</CardTitle>
              <CardDescription className="text-purple-600">
                Perfect for brands, companies, and local businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Contact information display</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Business category selection</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Shopping features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Professional appearance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-orange-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-pink-600" />
              </div>
              <CardTitle className="text-2xl text-pink-800">Creator Account</CardTitle>
              <CardDescription className="text-pink-600">
                Ideal for influencers, content creators, and public figures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-pink-600 mr-3" />
                  <span className="text-gray-700">Creator studio access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-pink-600 mr-3" />
                  <span className="text-gray-700">Flexible category options</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-pink-600 mr-3" />
                  <span className="text-gray-700">Growth insights</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-pink-600 mr-3" />
                  <span className="text-gray-700">Creator tools</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How to Convert Your Account
          </h2>
          <p className="text-lg text-gray-600">
            Follow these simple steps to unlock professional Instagram features
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Open Instagram Settings
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Screenshot: Instagram Settings Menu</p>
                    <p className="text-sm text-gray-400 mt-2">[Add screenshot here]</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Open the Instagram app on your phone</li>
                  <li>Go to your profile by tapping your profile picture</li>
                  <li>Tap the hamburger menu (☰) in the top right</li>
                  <li>Select "Settings and privacy"</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Access Account Settings
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Screenshot: Account Settings</p>
                    <p className="text-sm text-gray-400 mt-2">[Add screenshot here]</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>In Settings, tap "Account"</li>
                  <li>Scroll down to find "Switch to professional account"</li>
                  <li>Tap on this option to begin the conversion process</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Choose Account Type
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Screenshot: Account Type Selection</p>
                    <p className="text-sm text-gray-400 mt-2">[Add screenshot here]</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Instagram will ask you to choose between "Business" and "Creator"</li>
                  <li><strong>Choose "Business"</strong> if you're representing a company, brand, or local business</li>
                  <li><strong>Choose "Creator"</strong> if you're an influencer, content creator, or public figure</li>
                  <li>Both account types work perfectly with PostAhead!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect to Facebook
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Screenshot: Facebook Connection</p>
                    <p className="text-sm text-gray-400 mt-2">[Add screenshot here]</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Instagram will prompt you to connect to a Facebook Page</li>
                  <li>If you don't have a Facebook Page, create one (it's free)</li>
                  <li>This connection is required for API access and PostAhead integration</li>
                  <li>Make sure you're an admin of the Facebook Page</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                5
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Complete Setup
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Screenshot: Setup Complete</p>
                    <p className="text-sm text-gray-400 mt-2">[Add screenshot here]</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Instructions:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Add your business category and contact information</li>
                  <li>Review and confirm your settings</li>
                  <li>Your account is now ready for PostAhead!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect to PostAhead */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Ready to Connect?</CardTitle>
            <CardDescription className="text-purple-100 text-lg">
              Now that your account is set up, connect it to PostAhead and start managing your Instagram like a pro!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-4">
                  <Zap className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="font-semibold">Schedule Posts</p>
                  <p className="text-sm text-purple-100">Plan your content in advance</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <BarChart3 className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="font-semibold">Analytics</p>
                  <p className="text-sm text-purple-100">Track your performance</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Users className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="font-semibold">Grow Audience</p>
                  <p className="text-sm text-purple-100">Reach more followers</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/integrations'}
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Connect to PostAhead
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => window.location.href = '/test-instagram-v2'}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Test Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Will converting affect my existing posts?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                No! Converting to a Business or Creator account won't affect your existing posts, followers, or content. All your photos, videos, and stories remain exactly the same.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Do I need a Facebook account?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes, you'll need a Facebook account to connect your Instagram Business/Creator account. This is required for API access and to use tools like PostAhead.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Can I switch back to a personal account?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes, you can switch back to a personal account at any time through your Instagram settings. However, you'll lose access to business features and won't be able to use PostAhead.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Is there a cost to convert?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                No! Converting to a Business or Creator account is completely free. Instagram provides these features at no cost to help creators and businesses grow.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Instagram?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators and businesses using PostAhead to grow their Instagram presence
          </p>
          <Button 
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4"
            onClick={() => window.location.href = '/integrations'}
          >
            <Instagram className="h-6 w-6 mr-3" />
            Start Managing Your Instagram
          </Button>
        </div>
      </div>
    </div>
  );
} 