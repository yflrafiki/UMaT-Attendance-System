'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an AI-powered attendance report for a course.
 *
 * It analyzes attendance data for all students in a course and produces a human-readable summary
 * that highlights overall trends and identifies students with notable attendance records.
 * It exports:
 * - `generateAttendanceReport`: An async function to initiate the report generation flow.
 * - `GenerateAttendanceReportInput`: The input type for the `generateAttendanceReport` function.
 * - `GenerateAttendanceReportOutput`: The output type for the `generateAttendanceReport` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GenerateAttendanceReportInputSchema = z.object({
    courseName: z.string().describe("The name of the course."),
    studentAttendance: z.array(z.object({
        name: z.string(),
        id: z.string(),
        percentage: z.number(),
        status: z.string().describe("e.g., 'Good', 'At Risk', 'Poor'"),
    })).describe("An array of student attendance records for the course.")
});
export type GenerateAttendanceReportInput = z.infer<typeof GenerateAttendanceReportInputSchema>;

// Define the output schema
const GenerateAttendanceReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A concise, human-readable summary of the attendance report. It should be 2-3 sentences long.'
    ),
});
export type GenerateAttendanceReportOutput = z.infer<typeof GenerateAttendanceReportOutputSchema>;


export async function generateAttendanceReport(
  input: GenerateAttendanceReportInput
): Promise<GenerateAttendanceReportOutput> {
  return generateAttendanceReportFlow(input);
}


const generateReportPrompt = ai.definePrompt({
  name: 'generateAttendanceReportPrompt',
  input: {schema: GenerateAttendanceReportInputSchema},
  output: {schema: GenerateAttendanceReportOutputSchema},
  prompt: `You are an academic advisor AI. Your task is to analyze the provided attendance data for a university course and generate a brief, insightful summary for the lecturer.

**Course Name:** {{courseName}}

**Student Data:**
{{#each studentAttendance}}
- **{{name}} ({{id}}):** {{percentage}}% attendance (Status: {{status}})
{{/each}}

**Instructions:**
1.  Start by stating the overall attendance health of the course.
2.  Highlight any students with exceptionally good attendance as a positive note.
3.  Identify any students whose attendance is "Poor" or "At Risk," as they may require intervention.
4.  Keep the entire report concise and professional, no more than 3 sentences.

Generate the report now.
`,
});


const generateAttendanceReportFlow = ai.defineFlow(
  {
    name: 'generateAttendanceReportFlow',
    inputSchema: GenerateAttendanceReportInputSchema,
    outputSchema: GenerateAttendanceReportOutputSchema,
  },
  async input => {
    const {output} = await generateReportPrompt(input);
    return output!;
  }
);
