export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Perfect Match matrimonial platform, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Registration</h2>
              <p>
                Users must provide accurate and complete information during registration. You are responsible for
                maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Profile Information</h2>
              <p>
                All profile information must be truthful and accurate. Misrepresentation of personal details is strictly
                prohibited and may result in account termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Privacy Policy</h2>
              <p>
                We are committed to protecting your privacy. Personal information is used solely for matchmaking
                purposes and will not be shared with third parties without consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment Terms</h2>
              <p>
                Premium subscriptions are billed in advance. Refunds are processed according to our refund policy. All
                payments are processed securely through Razorpay.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Activities</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Creating fake or misleading profiles</li>
                <li>Harassment or inappropriate behavior</li>
                <li>Commercial solicitation</li>
                <li>Sharing contact information publicly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
              <p>
                Perfect Match is a platform to facilitate introductions. We do not guarantee successful matches or
                relationships. Users interact at their own discretion and risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at support@perfectmatch.com or call +91-9876543210.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
