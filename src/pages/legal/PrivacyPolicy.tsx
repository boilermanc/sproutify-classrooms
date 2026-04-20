import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | Sproutify School"
        description="Sproutify School Privacy Policy — FERPA, COPPA, and student data protection commitments for K-12 classrooms."
        canonical="/privacy"
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Effective Date: April 20, 2026 &nbsp;|&nbsp; Last Updated: April 20, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">

          <section className="mb-8">
            <p className="mb-4">
              Sproutify School (the "Service") is operated by Sweetwater Technology
              ("Sproutify," "we," "us," or "our"). The Service helps teachers manage
              classroom hydroponic tower gardens by tracking plants, environmental
              vitals, harvests, and student photo contributions.
            </p>
            <p className="mb-4">
              We built Sproutify School to be safe for K-12 classrooms by design.
              This Privacy Policy explains what information we collect, how we use it,
              who we share it with, and the rights of teachers, schools, parents, and
              students. It applies to <strong>school.sproutify.app</strong> and any
              related Sproutify School services.
            </p>
            <p className="mb-4">
              If you are a school administrator, district Data Privacy Officer, or
              parent and need a Data Processing Agreement (DPA) or have questions
              about this policy, please contact us at{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">
                team@sproutify.app
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Our Privacy Commitments</h2>
            <p className="mb-4">When it comes to student data, Sproutify School commits to the following:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We <strong>do not sell</strong> student personal information.</li>
              <li>We <strong>do not use</strong> student data for targeted advertising or to build advertising profiles.</li>
              <li>We <strong>do not</strong> show third-party advertising in the Service.</li>
              <li>We <strong>do not</strong> require students to create individual accounts, provide email addresses, or set passwords.</li>
              <li>We collect the minimum information needed to operate the Service.</li>
              <li>We act as a "school official" with a "legitimate educational interest" under FERPA when handling student records on behalf of schools.</li>
              <li>We support school and parent rights to access, correct, and delete student data.</li>
              <li>We host all data in the United States and use industry-standard security practices.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information from Teachers</h3>
            <p className="mb-3">When a teacher creates an account, we collect:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>First and last name</li>
              <li>Email address and password (password is stored hashed by our authentication provider)</li>
              <li>School name and (optional) school district</li>
              <li>Optional profile information: phone number, time zone, biography, profile photo, and school logo</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Information from Students</h3>
            <p className="mb-3">
              Sproutify School is designed to minimize the personal information collected from students.
              Students do <strong>not</strong> create individual accounts and are <strong>not</strong> asked
              to provide email addresses, passwords, real names, dates of birth, home addresses, or any
              other personally identifying information.
            </p>
            <p className="mb-3">For each student added to a classroom roster by a teacher, we store only:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>A <strong>display name</strong> chosen by the teacher (this may be a first name, nickname, initials, or any identifier the teacher chooses — schools may use pseudonyms to further reduce identifiability)</li>
              <li>The classroom the student belongs to</li>
              <li>Records of activity students log on shared classroom devices ("Kiosk Mode"), such as vitals readings, plant entries, harvest weights, pest observations, and photo uploads</li>
              <li>Optional photo credits attaching a student's display name to a photo they uploaded of a tower or plant</li>
            </ul>
            <p className="mb-4">
              Students log in to Kiosk Mode using a shared classroom name and PIN provided by their teacher
              — not personal credentials.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Tower & Garden Data</h3>
            <p className="mb-3">Teachers and students may log non-personal garden data, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Tower configurations, plant catalog entries, and plantings</li>
              <li>pH and EC ("vitals") readings</li>
              <li>Harvest weights and destinations</li>
              <li>Waste logs and pest observations</li>
              <li>Photographs of towers and plants (which may incidentally contain images of students if uploaded by the teacher or classroom)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Automatically Collected Information</h3>
            <p className="mb-3">When you use the Service, we and our hosting providers automatically collect limited technical information needed to operate and secure the Service, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>IP address and approximate location derived from it</li>
              <li>Browser type, device type, and operating system</li>
              <li>Pages visited, features used, and timestamps (for security and usage analytics)</li>
              <li>Server logs and error reports</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.5 Cookies & Local Storage</h3>
            <p className="mb-4">
              We use a small number of cookies and browser local storage entries that are required for
              the Service to function — for example, keeping a teacher signed in or remembering which
              classroom is active in Kiosk Mode. We do not use third-party advertising or cross-site
              tracking cookies. See our{" "}
              <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Allow teachers to track tower gardens, log data, and manage classrooms</li>
              <li>Display class leaderboards and historical data within a teacher's account</li>
              <li>Authenticate users and protect against fraud, abuse, and security threats</li>
              <li>Communicate with teachers about their account, support requests, billing, and Service updates</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mb-4">
              We do not use student personal information for any commercial purpose other than operating
              the Service for the school.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. FERPA & Educational Records</h2>
            <p className="mb-4">
              The Family Educational Rights and Privacy Act ("FERPA," 20 U.S.C. § 1232g) protects the
              privacy of student education records. To the extent any data stored in Sproutify School
              constitutes a student "education record" under FERPA, the school remains the owner of that
              data, and Sproutify acts as a "school official" with a "legitimate educational interest"
              under 34 CFR § 99.31(a)(1)(i)(B).
            </p>
            <p className="mb-4">In that role, Sproutify:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Performs services the school would otherwise perform itself</li>
              <li>Operates under the direct control of the school with respect to the use and maintenance of education records</li>
              <li>Does not re-disclose personally identifiable information from education records except as authorized by the school or required by law</li>
              <li>Uses education records only for the educational purposes for which they were provided</li>
            </ul>
            <p className="mb-4">
              Schools and districts that require a signed Data Processing Agreement, FERPA addendum, or
              state-specific student data privacy contract should email{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">team@sproutify.app</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. COPPA & Children Under 13</h2>
            <p className="mb-4">
              The Children's Online Privacy Protection Act ("COPPA") requires verifiable parental consent
              before an online service knowingly collects personal information from children under 13.
            </p>
            <p className="mb-4">
              Sproutify School is offered to <strong>schools and teachers</strong>, not directly to
              children. We rely on the school or teacher to provide consent on behalf of parents for the
              limited classroom use of the Service, consistent with FTC guidance permitting schools to
              act as agents for parents in the educational context.
            </p>
            <p className="mb-4">
              Because students do not create accounts and the only student data we store is a teacher-chosen
              display name plus classroom activity logs, the personal information collected from children
              under 13 is intentionally minimal. Schools may choose to use pseudonyms or initials as
              display names to further reduce identifiability.
            </p>
            <p className="mb-4">
              If a parent believes their child's information was collected without appropriate school
              consent, they may contact us at{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">team@sproutify.app</a>{" "}
              to request review and deletion. We will work with the school to honor the request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. State Student Privacy Laws</h2>
            <p className="mb-4">
              In addition to FERPA and COPPA, Sproutify intends to comply with applicable state student
              data privacy laws, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>California Student Online Personal Information Protection Act (SOPIPA) and AB 1584</li>
              <li>New York Education Law § 2-d and Part 121 of the Commissioner's Regulations</li>
              <li>Illinois Student Online Personal Protection Act (SOPPA)</li>
              <li>Connecticut Public Act 16-189</li>
              <li>Other state laws governing student personal information</li>
            </ul>
            <p className="mb-4">
              Schools subject to state-specific contracting requirements should contact us at{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">team@sproutify.app</a>{" "}
              to arrange the appropriate addendum.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. How We Share Information</h2>
            <p className="mb-4">
              We do <strong>not</strong> sell or rent personal information. We share information only in
              the limited circumstances described below.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Service Providers (Subprocessors)</h3>
            <p className="mb-3">
              We use a small number of vetted service providers to operate the Service. They are
              contractually limited to processing data on our behalf and may not use it for their own
              purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Supabase</strong> — authentication, database, and file storage. Data is hosted in the United States (US-East region).</li>
              <li><strong>IONOS</strong> — virtual private server hosting for the Sproutify School web application, located in the United States.</li>
              <li><strong>Stripe</strong> — payment processing for subscriptions. Stripe receives billing information directly; we do not store full payment card numbers.</li>
              <li><strong>MailerLite</strong> — sending transactional and informational emails to teachers and account administrators. Student information is not sent to MailerLite.</li>
            </ul>
            <p className="mb-4">
              An up-to-date list of subprocessors is available on request from{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">team@sproutify.app</a>.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 With the School</h3>
            <p className="mb-4">
              Teacher and classroom data is accessible to the teacher who created it. Schools and
              districts that require administrative access to data created by their teachers may request
              it in writing.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Legal Requirements</h3>
            <p className="mb-4">
              We may disclose information if required by law, valid legal process, or to protect the
              rights, safety, or property of Sproutify, our users, or the public. We will notify the
              affected school where legally permitted.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.4 Business Transfers</h3>
            <p className="mb-4">
              If Sproutify is involved in a merger, acquisition, or sale of assets, user information may
              be transferred as part of that transaction. The successor entity will remain bound by the
              commitments in this Privacy Policy, and schools will be notified of any material changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Storage & Security</h2>
            <p className="mb-3">We use industry-standard administrative, technical, and physical safeguards, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>HTTPS/TLS encryption for all data in transit</li>
              <li>Encryption at rest for the database and file storage provided by Supabase</li>
              <li>Row Level Security (RLS) policies in our database, so a teacher can only access their own classrooms, students, and tower data</li>
              <li>Hashed passwords (we never store plaintext passwords)</li>
              <li>Restricted administrative access on a need-to-know basis</li>
              <li>Regular software updates and dependency monitoring</li>
              <li>Logging and monitoring of access to production systems</li>
            </ul>
            <p className="mb-4">
              No method of electronic storage or transmission is 100% secure, but we work continuously to
              protect the information entrusted to us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention & Deletion</h2>
            <p className="mb-4">
              We retain teacher and classroom information for as long as the teacher's account is active,
              or as needed to provide the Service.
            </p>
            <p className="mb-3">When a teacher or school requests deletion:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Active production data is deleted within <strong>30 days</strong> of a verified request.</li>
              <li>Residual copies in encrypted, rotating system backups are purged within <strong>90 days</strong> of the original deletion.</li>
              <li>De-identified or aggregated data (which does not identify any individual student or teacher) may be retained for analytics and Service improvement.</li>
            </ul>
            <p className="mb-4">
              At the end of the school year, teachers may delete classroom rosters and associated student
              records directly within the Service. Schools may also request bulk end-of-year deletion by
              contacting{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">team@sproutify.app</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Parent & Student Rights</h2>
            <p className="mb-4">
              Under FERPA, parents (and "eligible students" who are 18 or older) have the right to
              inspect, request correction of, and request deletion of their child's education records.
              Because Sproutify acts on behalf of the school, parents should generally direct these
              requests to their child's teacher or school first.
            </p>
            <p className="mb-4">
              If the school directs us to act on a parent's request — or if a parent is unable to obtain
              a response from the school — they may contact us directly at{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">team@sproutify.app</a>.
              We will respond within a reasonable time and will work with the school to verify and
              fulfill the request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Data Breach Notification</h2>
            <p className="mb-4">
              If we become aware of a security incident that has resulted, or is reasonably likely to
              result, in unauthorized access to personal information stored in Sproutify School, we will
              notify affected schools without unreasonable delay and consistent with applicable law. Our
              notice will describe what happened, what information was involved, what we are doing in
              response, and steps the school can take.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. International Users</h2>
            <p className="mb-4">
              Sproutify School is operated in, and intended for use within, the United States. All data
              is hosted in the United States. By using the Service from outside the United States, you
              acknowledge that your information will be processed in the United States, which may have
              different data protection laws than your jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. When we make material changes, we
              will update the "Last Updated" date above and, where appropriate, notify teachers by email
              or through the Service. Continued use of the Service after the effective date of an update
              constitutes acceptance of the revised Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
            <p className="mb-4">
              This Privacy Policy is governed by the laws of the State of Georgia, United States, without
              regard to its conflict of laws principles. See our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> for
              additional terms governing use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
            <p className="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or your data:
            </p>
            <p className="mb-2"><strong>Sweetwater Technology — Sproutify School</strong></p>
            <p className="mb-2">
              Email:{" "}
              <a href="mailto:team@sproutify.app" className="text-primary hover:underline">
                team@sproutify.app
              </a>
            </p>
            <p className="mb-4">
              Web:{" "}
              <a
                href="https://www.sproutify.app/contact.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                sproutify.app/contact
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
