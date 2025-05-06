import React from 'react';

const LicenseAgreement = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <div className="prose prose-gray dark:prose-invert mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-semibold">postahead SaaS Template License Agreement</h1>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold">TL;DR;</h4>
          <h4 className="text-lg"><strong>Standard License: </strong>Build one commercial SaaS application.</h4>
          <h4 className="text-lg"><strong>Enterprise License: </strong>Build unlimited applications with priority support.</h4>
        </div>
        
        <div>
          This License Agreement ('Agreement') is entered into between postahead SaaS Template ('postahead'), and you, the user ('Licensee'), regarding the use of the postahead SaaS development template (the 'Product') available at postahead.dev. By downloading, accessing, or using the Product, Licensee agrees to be bound by the terms and conditions of this Agreement.
        </div>
        
        <span className="text-lg font-semibold">1. Grant of License</span>
        
        <div className="flex flex-col gap-8">
          <span className="font-semibold">1.1 Standard License</span>
          <span>
            Subject to the terms and conditions of this Agreement, postahead grants Licensee a non-exclusive, non-transferable, and non-sublicensable Standard License to use the postahead SaaS template for the following purposes:
          </span>
          <ul>
            <li>Create one commercial SaaS application.</li>
            <li>Build and develop applications with authentication, payments, and analytics.</li>
            <li>Deploy the application to production environments.</li>
          </ul>
        </div>
        
        <div className="flex flex-col gap-8">
          <span className="font-semibold">1.2 Enterprise License</span>
          <span>
            Subject to the terms and conditions of this Agreement, postahead grants Licensee a non-exclusive, non-transferable, and non-sublicensable Enterprise License to use the postahead SaaS template for the following purposes:
          </span>
          <ul>
            <li>Create unlimited commercial SaaS applications.</li>
            <li>Build and develop applications as part of a team or organization.</li>
            <li>Receive priority support and updates.</li>
            <li>Access to exclusive components and features.</li>
          </ul>
        </div>
        
        <span className="text-lg font-semibold">2. Restrictions</span>
        
        <div className="flex flex-col gap-8">
          <span>Licensee shall not:</span>
          <ul>
            <li>Resell or redistribute the postahead SaaS template as a standalone product.</li>
            <li>Create derivative templates for distribution or sale.</li>
            <li>Remove, alter, or obscure any copyright, trademark, or other proprietary notices from the postahead SaaS template.</li>
            <li>Use the postahead SaaS template in any way that violates applicable laws, regulations, or third-party rights.</li>
            <li>Sub-license, rent, lease, or transfer the postahead SaaS template or any rights granted under this Agreement.</li>
          </ul>
        </div>
        
        <div className="mt-10 flex flex-col gap-10">
          <div className="grid gap-4">
            <span className="text-lg font-semibold">3. Ownership and Intellectual Property</span>
            <span>
              postahead retains all ownership and intellectual property rights in and to the postahead SaaS template. This Agreement does not grant Licensee any ownership rights in the postahead SaaS template.
            </span>
          </div>
          
          <div className="grid gap-4">
            <span className="text-lg font-semibold">4. Warranty and Disclaimer</span>
            <span>
              THE postahead SAAS TEMPLATE IS PROVIDED 'AS IS' WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NONINFRINGEMENT.
            </span>
          </div>
          
          <div className="grid gap-4">
            <span className="text-lg font-semibold">5. Limitation of Liability</span>
            <span>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, postahead SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO THE USE OR INABILITY TO USE THE postahead SAAS TEMPLATE, EVEN IF postahead HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </span>
          </div>
          
          <div className="grid gap-4">
            <span className="text-lg font-semibold">6. Covering Law and Jurisdiction</span>
            <span>
              This Agreement shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law principles. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in the United States.
            </span>
          </div>
          
          <div className="grid gap-4">
            <span className="text-lg font-semibold">7. Entire Agreement</span>
            <span>
              This Agreement constitutes the entire agreement between Licensee and postahead concerning the subject matter herein and supersedes all prior or contemporaneous agreements, representations, warranties, and understandings.
            </span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span>Last updated: 2024-07-01</span>
          <span>postahead SaaS Template</span>
          <span>Contact Information: support@postahead.dev</span>
        </div>
      </div>
    </main>
  );
};

export default LicenseAgreement;