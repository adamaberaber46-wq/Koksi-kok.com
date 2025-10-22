import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold font-headline text-center mb-12">Privacy Policy</h1>
      <Card>
        <CardHeader>
          <CardTitle>Our Commitment to Your Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            At Koksi Kok, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">Information We Collect</h3>
          <p>
            We may collect personal information from you such as your name, email address, shipping address, and payment information when you place an order. We also collect non-personal information, such as browser type, operating system, and web pages visited to help us manage our website.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">How We Use Your Information</h3>
          <p>
            We use the information we collect to process your orders, to communicate with you about your orders, and to provide you with a personalized shopping experience. We may also use your information to improve our website and to send you promotional emails about new products or special offers.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">Security of Your Information</h3>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
