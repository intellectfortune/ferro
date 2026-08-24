import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Ferro's terms of service.",
};

const EFFECTIVE_DATE = "August 24, 2026";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" effectiveDate={EFFECTIVE_DATE}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to and use of
        Ferro, a fleet management platform for exotic and luxury vehicle
        rental operators, provided by Ferro Fleet LLC (&quot;Ferro,&quot;
        &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an
        account, provisioning a company workspace, or otherwise using Ferro
        (the &quot;Service&quot;), you agree to these Terms on behalf of
        yourself and, if applicable, the rental company or business you
        represent (&quot;Company,&quot; &quot;you,&quot; or &quot;your&quot;).
        If you do not agree, do not use the Service.
      </p>
      <p>
        Rules for permitted and prohibited use of the Ferro software itself
        are set out separately in our{" "}
        <a href="/eula">End User License Agreement (EULA)</a>, which is
        incorporated into these Terms by reference. Our{" "}
        <a href="/privacy">Privacy Policy</a> describes how we collect, use,
        and share information, and is also incorporated by reference.
      </p>

      <h2>1. The Service</h2>
      <p>
        Ferro provides a hosted platform for managing a rental vehicle fleet,
        including a public storefront, customer relationship and inquiry
        tools, a booking calendar, invoicing and payment collection via
        Stripe, document and photo storage, GPS/telematics integration via
        Bouncie, e-signature contract workflows via DocuSign and/or PandaDoc,
        and internal team communication. Not every feature is available on
        every plan, and we may add, change, or remove features over time.
      </p>

      <h2>2. Accounts, Companies &amp; Roles</h2>
      <p>
        Ferro is organized around a &quot;Company&quot; workspace. The
        person who creates a Company becomes its initial owner and can invite
        additional users under roles (owner, broker, or employee) that
        control what each user can see and do. You are responsible for:
      </p>
      <ul>
        <li>the accuracy of information you provide when creating an account or Company;</li>
        <li>maintaining the confidentiality of your login credentials;</li>
        <li>all activity that occurs under your account or within your Company&apos;s workspace, including actions taken by users you invite; and</li>
        <li>promptly removing access for anyone who should no longer have it (e.g., a departed employee).</li>
      </ul>
      <p>
        You must be at least 18 years old and able to form a binding contract
        to create a Company on Ferro.
      </p>

      <h2>3. Subscription Fees &amp; Payment Processing</h2>
      <p>
        Ferro is offered on a subscription basis. Fees, billing frequency,
        and plan details are presented at signup or in your account settings.
        Unless stated otherwise, fees are non-refundable and billing is
        handled through <strong>Stripe</strong>. By subscribing, you
        authorize us (via Stripe) to charge your payment method on a
        recurring basis until you cancel. We do not store your full card
        number; Stripe processes and stores payment credentials under its own
        terms and security standards.
      </p>
      <p>
        Separately, Ferro lets your Company use its own connected Stripe
        account to invoice and collect payment from your rental customers.
        When you connect Stripe for this purpose, the resulting Stripe
        customer relationship, transactions, and disputes are between your
        Company and your customer; Ferro is not a party to that transaction
        and is not responsible for chargebacks, refunds, or payment disputes
        between you and your customers.
      </p>
      <p>
        If a payment fails or your subscription lapses, we may suspend or
        limit access to the Service, including customer-facing features such
        as your public storefront, until the account is brought current.
      </p>

      <h2>4. Data You Store On Ferro</h2>
      <p>
        In the course of using Ferro, your Company may upload or generate
        data including fleet and vehicle details, booking and customer
        contact information, invoices, contracts, internal team messages, and
        <strong> sensitive documents</strong> such as renter identification
        photos, driver&apos;s license images, and insurance declaration
        (&quot;dec&quot;) pages. You represent and warrant that:
      </p>
      <ul>
        <li>you have the right to collect and upload this information, and have obtained any consents or provided any notices required by applicable law before doing so;</li>
        <li>you will not upload data you are not legally permitted to collect or retain (for example, government ID images collected without the individual&apos;s knowledge or in violation of a state biometric or privacy statute); and</li>
        <li>you are solely responsible for how you collect, use, and dispose of your customers&apos; personal information outside of the Service.</li>
      </ul>
      <p>
        Identification documents and insurance dec pages are stored in
        access-controlled, non-public storage separate from your public
        vehicle listings and photos. See our <a href="/privacy">Privacy
        Policy</a> for more detail on how this data is stored and secured.
      </p>

      <h2>5. GPS &amp; Location Tracking Data</h2>
      <p>
        If you connect a Bouncie GPS device to a vehicle, Ferro will display
        that vehicle&apos;s real-time and historical location, speed, trip
        history, and diagnostic data as made available through the Bouncie
        API. This data is generated and transmitted by hardware you install
        and an account you control with Bouncie, a third party; Ferro is not
        responsible for the accuracy, availability, or continuity of that
        data.
      </p>
      <p>
        Location and vehicle-tracking data can be legally sensitive.
        <strong> You are solely responsible for complying with all
        applicable laws</strong> governing GPS tracking of vehicles,
        including any obligation to disclose tracking to renters, drivers, or
        employees, obtain consent, or limit tracking of a vehicle while it is
        in a renter&apos;s possession. Several states restrict or condition
        GPS tracking of a vehicle without the driver&apos;s knowledge or
        consent — using Ferro&apos;s tracking features does not by itself
        make your use of GPS tracking lawful.
      </p>

      <h2>6. Multi-Tenant Data Separation</h2>
      <p>
        Ferro is a multi-tenant platform: many Companies share the same
        underlying infrastructure, and each Company&apos;s data is logically
        separated and access-controlled so that only authorized users of
        that Company can view or manage it. We maintain reasonable technical
        and administrative safeguards designed to enforce this separation.
        However, no system is perfectly secure, and we cannot guarantee that
        separation will never fail as a result of a bug, misconfiguration, or
        security incident. We will notify affected Companies as required by
        applicable law if we become aware of unauthorized access to their
        data.
      </p>

      <h2>7. Third-Party Services</h2>
      <p>
        Ferro integrates with third-party services, including Stripe
        (payments), Bouncie (GPS/telematics), DocuSign and PandaDoc
        (e-signature), Google Maps (map display), and Resend (transactional
        email). Your use of these integrations is also subject to each
        provider&apos;s own terms and privacy policy, which you are
        responsible for reviewing. We do not control these third parties and
        are not responsible for their acts, omissions, downtime, or changes
        to their services, though we will make reasonable efforts to keep
        our integrations working and to notify you of material breaking
        changes we&apos;re aware of.
      </p>

      <h2>8. Acceptable Use</h2>
      <p>
        In addition to the rules in our <a href="/eula">EULA</a>, you agree
        not to use Ferro to violate any law, infringe anyone&apos;s rights,
        store data you don&apos;t have the right to store, or interfere with
        the Service&apos;s operation or security. We may investigate and take
        appropriate action, including suspending or terminating access, for
        conduct we reasonably believe violates these Terms or applicable law.
      </p>

      <h2>9. Intellectual Property</h2>
      <p>
        Ferro and its licensors own all right, title, and interest in the
        Service, including its software, design, and branding. We grant you
        a limited, non-exclusive, non-transferable right to access and use
        the Service during your subscription, subject to these Terms and the
        EULA. You retain ownership of the content and data your Company
        uploads (&quot;Your Data&quot;), and you grant us a limited license
        to host, process, and display Your Data solely to provide and
        improve the Service.
      </p>

      <h2>10. Term, Suspension &amp; Termination</h2>
      <p>
        You may cancel your subscription at any time from your account
        settings; cancellation takes effect at the end of the current billing
        period unless stated otherwise. We may suspend or terminate your
        account or your Company&apos;s access if: (a) payment is overdue and
        not cured after notice; (b) we reasonably believe you&apos;ve
        violated these Terms, the EULA, or applicable law; or (c) we
        discontinue the Service generally, with reasonable notice where
        practical.
      </p>
      <p>
        Upon termination, your access to the Service ends. We will retain
        Your Data for a limited period following termination to allow for
        export, after which it may be deleted in accordance with our data
        retention practices described in the <a href="/privacy">Privacy
        Policy</a>. We recommend exporting any data you need before
        cancelling.
      </p>

      <h2>11. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
        AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
        IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY
        WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. WE DO
        NOT WARRANT THAT THE SERVICE, OR ANY THIRD-PARTY INTEGRATION
        (INCLUDING GPS TRACKING DATA), WILL BE UNINTERRUPTED, ERROR-FREE, OR
        FULLY ACCURATE.
      </p>

      <h2>12. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, FERRO AND ITS OFFICERS,
        EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
        OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM OR RELATED TO
        YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
        DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING
        TO THESE TERMS OR THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US
        FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM AROSE.
      </p>
      <p>
        Some jurisdictions do not allow the exclusion or limitation of
        certain damages, so some of the above limitations may not apply to
        you.
      </p>

      <h2>13. Indemnification</h2>
      <p>
        You agree to indemnify and hold Ferro harmless from any claims,
        damages, liabilities, and expenses (including reasonable
        attorneys&apos; fees) arising from: (a) Your Data or your use of the
        Service, including data you collect from and about your customers;
        (b) your violation of these Terms, the EULA, or applicable law; or
        (c) your use of GPS tracking, identification document collection, or
        any other feature in a manner that violates a third party&apos;s
        rights.
      </p>

      <h2>14. Governing Law &amp; Disputes</h2>
      <p>
        These Terms are governed by the laws of the State of California,
        without regard to its conflict-of-laws principles. Any dispute
        arising from these Terms or the Service will be subject to the
        exclusive jurisdiction of the state and federal courts located in
        California, and you consent to personal jurisdiction there.
      </p>

      <h2>15. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material
        changes, we will provide reasonable notice (such as an in-app notice
        or email) before the changes take effect. Continued use of the
        Service after changes take effect constitutes acceptance of the
        updated Terms.
      </p>

      <h2>16. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:legal@joinferro.com">legal@joinferro.com</a>.
      </p>
    </LegalPage>
  );
}
