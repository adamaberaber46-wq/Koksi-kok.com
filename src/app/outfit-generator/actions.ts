'use server';

import { generateOutfitSuggestions } from '@/ai/flows/generate-outfit-suggestions';
import { products } from '@/lib/products';
import type { Product } from '@/lib/types';
import { z } from 'zod';

const formSchema = z.object({
  stylePrompt: z.string().min(1, 'Style prompt is required.'),
});

type FormState = {
  suggestions?: Product[];
  error?: string | null;
};

export async function handleGenerateOutfit(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    stylePrompt: formData.get('stylePrompt'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.stylePrompt?.[0],
    };
  }

  try {
    const allProductNames = products.map((p) => p.name);
    
    const result = await generateOutfitSuggestions({
      stylePrompt: validatedFields.data.stylePrompt,
      availableProducts: allProductNames,
    });

    if (!result || !result.suggestions) {
      return { error: 'The AI could not generate suggestions. Please try again.' };
    }

    const suggestedProducts = products.filter((p) =>
      result.suggestions.includes(p.name)
    );

    if (suggestedProducts.length === 0) {
        return { error: 'The AI came up with an outfit, but the products could not be found in our catalog.' };
    }

    return { suggestions: suggestedProducts, error: null };
  } catch (error) {
    console.error('Error generating outfit:', error);
    return {
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
