import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Accessibility | Sproutify School"
        description="Accessibility statement for Sproutify School classroom tower tracking application."
        canonical="/accessibility"
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Accessibility Statement</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Our Commitment</h2>
            <p className="mb-4">
              Sproutify School is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Conformance Status</h2>
            <p className="mb-4">
              We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards. These guidelines explain how to make web content accessible to people with a wide array of disabilities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Accessibility Features</h2>
            <p className="mb-4">Our website includes the following accessibility features:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Keyboard navigation support</li>
              <li>Screen reader compatibility</li>
              <li>High contrast color schemes</li>
              <li>Descriptive alt text for images</li>
              <li>Clear and consistent navigation</li>
              <li>Semantic HTML structure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Known Limitations</h2>
            <p className="mb-4">
              We are aware of some accessibility limitations and are actively working to address them. If you encounter any accessibility barriers, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Feedback</h2>
            <p className="mb-4">
              We welcome your feedback on the accessibility of Sproutify School. Please contact us through our <a href="https://www.sproutify.app/contact.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">contact page</a> if you encounter accessibility barriers or have suggestions for improvement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Assistive Technology</h2>
            <p className="mb-4">
              This website is designed to be compatible with assistive technologies such as screen readers, voice recognition software, and keyboard-only navigation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;