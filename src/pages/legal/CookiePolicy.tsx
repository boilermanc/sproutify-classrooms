import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cookie Policy | Sproutify School"
        description="Cookie Policy for Sproutify School classroom tower tracking application."
        canonical="/cookies"
      />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and login status.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">
              We use cookies for essential functions such as:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Keeping you logged in</li>
              <li>Remembering your preferences</li>
              <li>Ensuring security</li>
              <li>Analyzing usage patterns to improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            <p className="mb-4">
              <strong>Essential Cookies:</strong> These are necessary for the website to function properly.
            </p>
            <p className="mb-4">
              <strong>Functional Cookies:</strong> These enhance functionality and personalization.
            </p>
            <p className="mb-4">
              <strong>Analytics Cookies:</strong> These help us understand how visitors interact with our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
            <p className="mb-4">
              You can control and/or delete cookies as you wish through your browser settings. However, removing essential cookies may impact the functionality of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies, please contact us through our <a href="https://www.sproutify.app/contact.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;