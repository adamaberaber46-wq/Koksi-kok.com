import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold font-headline text-center mb-12">Terms of Service</h1>
      <Card>
        <CardHeader>
          <CardTitle>Agreement to our Legal Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to Koksi Kok! These Terms of Service constitute a legally binding agreement made between you and Koksi Kok, concerning your access to and use of the website.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">1. Use of Our Service</h3>
          <p>
            You agree to use our website only for lawful purposes. You are prohibited from any use of the site that would constitute a violation of any applicable law, regulation, rule or ordinance of any nationality, state, or locality or of any international law or treaty.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">2. Intellectual Property Rights</h3>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">3. Product Information</h3>
          <p>
            We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.
          </p>
          <h3 className="font-semibold text-lg text-card-foreground pt-4">4. Limitation of Liability</h3>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the site.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
