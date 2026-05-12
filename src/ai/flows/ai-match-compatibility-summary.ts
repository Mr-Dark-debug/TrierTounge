'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating an AI-powered compatibility summary
 * between two university students for language exchange, considering their academic and social goals,
 * and reciprocal language learning needs.
 *
 * - aiMatchCompatibilitySummary - The main function to trigger the compatibility summary generation.
 * - AiMatchCompatibilitySummaryInput - The input type for the flow.
 * - AiMatchCompatibilitySummaryOutput - The output type of the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentProfileSchema = z.object({
  name: z.string().describe("The student's name."),
  targetLanguage: z.string().describe("The language the student wants to learn."),
  nativeLanguage: z.string().describe("The student's native language (which they can teach)."),
  academicGoals: z.string().describe("A description of the student's academic goals, major, and interests."),
  socialGoals: z.string().describe("A description of the student's social goals, hobbies, and preferred exchange activities."),
});

const AiMatchCompatibilitySummaryInputSchema = z.object({
  studentA: StudentProfileSchema.describe("The profile of the first student (current user)."),
  studentB: StudentProfileSchema.describe("The profile of the second student (potential partner)."),
});

export type AiMatchCompatibilitySummaryInput = z.infer<typeof AiMatchCompatibilitySummaryInputSchema>;

const AiMatchCompatibilitySummaryOutputSchema = z.object({
  summary: z.string().describe("A concise AI-generated summary of their compatibility."),
  score: z.number().int().min(0).max(100).describe("A numerical compatibility score from 0 to 100."),
  sharedInterests: z.array(z.string()).describe("A list of specific shared academic or social interests."),
  reciprocalLanguageBenefit: z.string().describe("A description of how their language learning needs reciprocate each other."),
});

export type AiMatchCompatibilitySummaryOutput = z.infer<typeof AiMatchCompatibilitySummaryOutputSchema>;

export async function aiMatchCompatibilitySummary(input: AiMatchCompatibilitySummaryInput): Promise<AiMatchCompatibilitySummaryOutput> {
  return aiMatchCompatibilitySummaryFlow(input);
}

const aiMatchCompatibilitySummaryPrompt = ai.definePrompt({
  name: 'aiMatchCompatibilitySummaryPrompt',
  input: { schema: AiMatchCompatibilitySummaryInputSchema },
  output: { schema: AiMatchCompatibilitySummaryOutputSchema },
  prompt: `You are an intelligent language exchange compatibility AI for university students at the University of Trier. Your task is to analyze two student profiles and determine their compatibility for a language exchange partnership. Focus on shared academic goals, shared social goals, and how well their language learning needs reciprocate each other.

Student A's Profile:
Name: {{{studentA.name}}}
Target Language: {{{studentA.targetLanguage}}}
Native Language: {{{studentA.nativeLanguage}}}
Academic Goals: {{{studentA.academicGoals}}}
Social Goals: {{{studentA.socialGoals}}}

Student B's Profile:
Name: {{{studentB.name}}}
Target Language: {{{studentB.targetLanguage}}}
Native Language: {{{studentB.nativeLanguage}}}
Academic Goals: {{{studentB.academicGoals}}}
Social Goals: {{{studentB.socialGoals}}}

Based on the provided profiles, generate a concise compatibility summary, a numerical compatibility score from 0 to 100, a list of specific shared interests, and a description of the reciprocal language benefit.
`,
});

const aiMatchCompatibilitySummaryFlow = ai.defineFlow(
  {
    name: 'aiMatchCompatibilitySummaryFlow',
    inputSchema: AiMatchCompatibilitySummaryInputSchema,
    outputSchema: AiMatchCompatibilitySummaryOutputSchema,
  },
  async (input) => {
    const { output } = await aiMatchCompatibilitySummaryPrompt(input);
    return output!;
  },
);
