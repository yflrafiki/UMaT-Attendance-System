'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting impersonation attempts during attendance capture.
 *
 * The flow uses facial recognition to compare a student's current photo with their enrolled photo and identify potential impersonation.
  * It also analyzes the background of the live photo to ensure the student is in a classroom-like environment.
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
      'A photo of the student taken during attendance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
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
      'A confidence score (0-1) indicating the likelihood of a valid, in-class attendance. Higher values indicate higher confidence in both identity and location.'
    ),
  reason: z
    .string()
    .describe(
      'A brief explanation of the decision. For example, "Face match confidence is below threshold." or "Excellent face match and classroom background detected." or "Face matches, but background does not appear to be a classroom."'
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
  prompt: `You are an AI-powered proctoring system for university attendance. Your job is to verify two things:
1.  **Identity:** Is the person in the live photo the same person as in the enrolled photo?
2.  **Presence:** Is the person in the live photo physically in a classroom environment?

**Instructions:**
- Compare the face in the live photo with the face in the enrolled photo.
- Analyze the background of the live photo. Look for tell-tale signs of a classroom setting (e.g., whiteboard, projector screen, desks, lecture hall seats, other students in the background).
- If the faces do not match, set 'isImpersonation' to true and provide a reason. The confidence score should be low.
- If the faces match, but the background does NOT look like a classroom (e.g., it looks like a bedroom, a car, or outdoors), set 'isImpersonation' to true because the student is not in the required location. Provide a reason like "Face matches, but student does not appear to be in a classroom." The confidence score should be moderate (e.g., 0.5-0.7) because the identity is correct but the location is not.
- If the faces match AND the background appears to be a classroom, set 'isImpersonation' to false. Provide a reason confirming the match and the environment. The confidence score should be high.

Base your entire decision on the two images provided.

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
