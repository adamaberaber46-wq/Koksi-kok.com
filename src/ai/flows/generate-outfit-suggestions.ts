'use server';

/**
 * @fileOverview Outfit suggestion AI agent.
 * 
 * - generateOutfitSuggestions - A function that handles the outfit suggestions process.
 * - GenerateOutfitSuggestionsInput - The input type for the generateOutfitSuggestions function.
 * - GenerateOutfitSuggestionsOutput - The return type for the generateOutfitSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutfitSuggestionsInputSchema = z.object({
  stylePrompt: z
    .string()
    .describe('A description of the desired style or occasion.'),
  availableProducts: z.array(z.string()).describe('List of available products'),
});
export type GenerateOutfitSuggestionsInput = z.infer<typeof GenerateOutfitSuggestionsInputSchema>;

const GenerateOutfitSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Outfit suggestions based on the style prompt and available products.'),
});
export type GenerateOutfitSuggestionsOutput = z.infer<typeof GenerateOutfitSuggestionsOutputSchema>;

export async function generateOutfitSuggestions(input: GenerateOutfitSuggestionsInput): Promise<GenerateOutfitSuggestionsOutput> {
  return generateOutfitSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutfitSuggestionsPrompt',
  input: {schema: GenerateOutfitSuggestionsInputSchema},
  output: {schema: GenerateOutfitSuggestionsOutputSchema},
  prompt: `You are a personal stylist that will suggest outfits based on a style prompt.

  Style Prompt: {{{stylePrompt}}}
  Available Products: {{#each availableProducts}}{{{this}}}, {{/each}}

  Suggest outfits using only the provided available products.
  Return a list of product names that create great outfits.
  Do not suggest unavailable products.
  Be creative and come up with cool pairings.`,
});

const generateOutfitSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateOutfitSuggestionsFlow',
    inputSchema: GenerateOutfitSuggestionsInputSchema,
    outputSchema: GenerateOutfitSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
