# Facebook Legal Pages Setup

## Overview
I've created comprehensive legal pages required for Facebook app approval. These pages meet Facebook's policy requirements and provide transparency about data usage and user rights.

## Pages Created

### 1. Privacy Policy (`/privacy`)
- **File**: `src/app/privacy/page.tsx`
- **URL**: `https://yourdomain.com/privacy`
- **Content**: Comprehensive privacy policy covering:
  - Information collection and usage
  - Social media integrations
  - Data sharing with third parties
  - User rights under GDPR/CCPA
  - Facebook/Instagram specific disclosures
  - Data retention policies
  - International data transfers
  - Contact information for privacy requests

### 2. Terms of Service (`/terms`)
- **File**: `src/app/terms/page.tsx`
- **URL**: `https://yourdomain.com/terms`
- **Content**: Complete terms of service including:
  - Service description
  - User account requirements
  - Acceptable use policies
  - Social media platform compliance
  - Intellectual property rights
  - Subscription and payment terms
  - Liability limitations
  - Facebook Platform Policy compliance section

### 3. Data Deletion Instructions (`/data-deletion`)
- **File**: `src/app/data-deletion/page.tsx`
- **URL**: `https://yourdomain.com/data-deletion`
- **Content**: Detailed instructions for users to delete their data:
  - Step-by-step account deletion process
  - Email-based deletion requests
  - Facebook/Instagram data handling
  - Data deletion timeline
  - What data is retained and why
  - Data export options
  - User rights under privacy laws

## Navigation Updates
- **Updated**: `src/app/components/footer.tsx`
- **Changes**: Added links to all three legal pages in the footer navigation

## Facebook App Configuration

### Required URLs for Facebook App Dashboard:
When configuring your Facebook app, use these URLs:

1. **Privacy Policy URL**: `https://yourdomain.com/privacy`
2. **Terms of Service URL**: `https://yourdomain.com/terms`
3. **Data Deletion Callback URL**: `https://yourdomain.com/data-deletion`

### App Settings Location:
- Facebook Developers Console → Your App → Settings → Basic
- Scroll down to "Privacy Policy URL" and "Terms of Service URL"
- For Instagram Business API, also add "Data Deletion Callback URL"

## Next Steps

### 1. Update Domain References
Replace placeholder domain references in the legal pages:
- Update `[Your Business Address]` with your actual business address
- Update `[Your Jurisdiction]` with your legal jurisdiction
- Verify all email addresses (`privacy@postahead.com`, `legal@postahead.com`, `support@postahead.com`)

### 2. Legal Review
- **Recommended**: Have a lawyer review these documents
- **Important**: Ensure compliance with your local laws
- **Consider**: Industry-specific regulations that may apply

### 3. Facebook App Configuration
1. Go to Facebook Developers Console
2. Select your app → Settings → Basic
3. Add the privacy policy URL: `https://yourdomain.com/privacy`
4. Add the terms of service URL: `https://yourdomain.com/terms`
5. Add data deletion callback URL: `https://yourdomain.com/data-deletion`
6. Save changes

### 4. Deploy and Test
1. Deploy your app to production
2. Test all legal page links work correctly
3. Verify pages load properly and are accessible
4. Check that footer links navigate to correct pages

### 5. App Review Submission
Once legal pages are live, you can submit your Facebook app for review:
- Go to App Review → Permissions and Features
- Request the permissions you need (e.g., `instagram_basic`, `pages_show_list`)
- Submit for review with detailed use case descriptions

## Key Features of These Legal Pages

### ✅ Facebook Compliance
- Specifically addresses Facebook/Instagram integrations
- Includes Facebook Platform Policy compliance sections
- Clear data deletion instructions for Facebook data
- Proper disclaimers about Meta affiliation

### ✅ GDPR/CCPA Compliant
- User rights clearly explained
- Data retention policies defined
- Lawful basis for processing outlined
- Contact information for privacy requests

### ✅ User-Friendly
- Clear, non-technical language
- Step-by-step instructions
- Visual formatting with sections and lists
- Mobile-responsive design

### ✅ Professional Appearance
- Clean, modern design
- Consistent branding
- Professional typography
- Easy navigation

## Important Notes

1. **Regular Updates**: Keep these pages current with any service changes
2. **Backup**: Keep backups of these legal documents
3. **Notifications**: Notify users of any material changes to these policies
4. **Accessibility**: Ensure pages are accessible to users with disabilities
5. **Multiple Languages**: Consider translations if serving international users

## Contact Information
Make sure to update all contact information in the legal pages:
- `privacy@postahead.com` - Privacy-related inquiries
- `legal@postahead.com` - Legal and terms-related inquiries  
- `support@postahead.com` - General support

## Troubleshooting

### If Facebook Rejects Your App:
1. Verify all URLs are accessible and return 200 status
2. Ensure privacy policy specifically mentions Facebook/Instagram data usage
3. Check that data deletion instructions are clear and actionable
4. Verify your app's use case is clearly described

### Common Issues:
- **404 Errors**: Ensure pages are deployed and accessible
- **Incomplete Policies**: Make sure all required sections are present
- **Broken Links**: Test all navigation links work correctly
- **Mobile Issues**: Verify pages work on mobile devices

## Summary
Your app now has comprehensive legal pages that meet Facebook's requirements. After updating the domain references and deploying to production, you should be able to successfully submit your app for Facebook review. 