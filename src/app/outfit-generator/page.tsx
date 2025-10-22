'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Bot, Loader2 } from 'lucide-react';
import { handleGenerateOutfit } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductCard from '@/components/product-card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          Generate Outfit
        </>
      )}
    </Button>
  );
}

const initialState = {
  suggestions: [],
  error: null,
};

export default function OutfitGeneratorPage() {
  const [state, formAction] = useFormState(handleGenerateOutfit, initialState);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-headline font-bold">
              AI Outfit Generator
            </CardTitle>
            <p className="text-muted-foreground pt-2">
              Describe a style or occasion, and our AI will create an outfit for you!
            </p>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="stylePrompt">Style or Occasion</Label>
                <Textarea
                  id="stylePrompt"
                  name="stylePrompt"
                  placeholder="e.g., 'A casual weekend brunch look', 'Smart office attire for a presentation', 'Edgy streetwear style'"
                  required
                  rows={3}
                />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        {state.error && (
            <p className="text-destructive mt-4 text-center">{state.error}</p>
        )}

        {state.suggestions && state.suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-headline font-bold text-center mb-8">
              Your AI-Generated Outfit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {state.suggestions.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
