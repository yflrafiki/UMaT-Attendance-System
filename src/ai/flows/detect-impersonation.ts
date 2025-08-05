'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting impersonation attempts during attendance capture.
 *
 * The flow uses facial recognition to compare a student's current photo with their enrolled photo and identify potential impersonation.
 * It exports:
 * - `detectImpersonation`: An async function to initiate the impersonation detection flow.
 * - `DetectImpersonationInput`: The input type for the `detectImpersonation` function.
 * - `DetectImpersonationOutput`: The output type for the `detectImpersonation` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const DetectImpersonationInputSchema = z.object({
  livePhotoDataUri: z
    .string()
    .describe(
      'A photo of the student taken during attendance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Updated description
    ),
  enrolledPhotoDataUri: z
    .string()
    .describe(
      'The student\'s enrolled photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Updated description
    ),
});
export type DetectImpersonationInput = z.infer<typeof DetectImpersonationInputSchema>;

// Define the output schema
const DetectImpersonationOutputSchema = z.object({
  isImpersonation: z
    .boolean()
    .describe(
      'Whether or not the system suspects impersonation. True if impersonation is suspected, false otherwise.'
    ),
  confidence: z
    .number()
    .describe(
      'A confidence score (0-1) indicating the likelihood of impersonation. Higher values indicate higher confidence.'
    ),
  reason: z
    .string()
    .describe(
      'A brief explanation of why impersonation is suspected, or why not.  For example, \'Face match confidence is below threshold.\' or \'Excellent face match - no impersonation suspected.\''
    )
});
export type DetectImpersonationOutput = z.infer<typeof DetectImpersonationOutputSchema>;

// Define the main function
export async function detectImpersonation(
  input: DetectImpersonationInput
): Promise<DetectImpersonationOutput> {
  return detectImpersonationFlow(input);
}

// Define the prompt
const detectImpersonationPrompt = ai.definePrompt({
  name: 'detectImpersonationPrompt',
  input: {schema: DetectImpersonationInputSchema},
  output: {schema: DetectImpersonationOutputSchema},
  prompt: `You are an AI-powered impersonation detection system.

You are given two images: a live photo taken during attendance and an enrolled photo of the student.

Compare the two images and determine if the live photo is likely an impersonation attempt.

Consider factors such as facial similarity, pose, lighting, and image quality.

Return a boolean value indicating whether impersonation is suspected, a confidence score (0-1) indicating the likelihood of impersonation, and a brief explanation.

Live Photo: {{media url=livePhotoDataUri}}
Enrolled Photo: {{media url=enrolledPhotoDataUri}}

Your output MUST be in JSON format.
`,
});

// Define the flow
const detectImpersonationFlow = ai.defineFlow(
  {
    name: 'detectImpersonationFlow',
    inputSchema: DetectImpersonationInputSchema,
    outputSchema: DetectImpersonationOutputSchema,
  },
  async input => {
    const {output} = await detectImpersonationPrompt(input);
    return output!;
  }
);
