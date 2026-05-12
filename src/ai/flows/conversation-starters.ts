
'use server';
/**
 * @fileOverview This flow generates language exchange conversation starters
 * based on the students' academic and social goals to help them break the ice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConversationStartersInputSchema = z.object({
  targetLanguage: z.string(),
  studentAGoals: z.string(),
  studentBGoals: z.string(),
});

export type ConversationStartersInput = z.infer<typeof ConversationStartersInputSchema>;

const ConversationStartersOutputSchema = z.object({
  starters: z.array(z.string()).describe("A list of 5 ice-breaker questions or topics in the target language."),
});

export type ConversationStartersOutput = z.infer<typeof ConversationStartersOutputSchema>;

export async function generateConversationStarters(input: ConversationStartersInput): Promise<ConversationStartersOutput> {
  return conversationStartersFlow(input);
}

const startersPrompt = ai.definePrompt({
  name: 'conversationStartersPrompt',
  input: { schema: ConversationStartersInputSchema },
  output: { schema: ConversationStartersOutputSchema },
  prompt: `You are a helpful language exchange coach for university students at Trier University.
The target language of the exchange session is: {{{targetLanguage}}}.

Student A's Goals: {{{studentAGoals}}}
Student B's Goals: {{{studentBGoals}}}

Generate 5 fun, engaging, and contextually relevant conversation starters, ice-breaker questions, or role-play scenarios in {{{targetLanguage}}}. 
Focus on their shared academic interests or common student life themes (e.g. Mensa, Library, Trier city life, exams).
Provide the output as an array of strings in the target language.`,
});

const conversationStartersFlow = ai.defineFlow(
  {
    name: 'conversationStartersFlow',
    inputSchema: ConversationStartersInputSchema,
    outputSchema: ConversationStartersOutputSchema,
  },
  async (input) => {
    const { output } = await startersPrompt(input);
    return output!;
  },
);
