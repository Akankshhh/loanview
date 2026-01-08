
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BankingAdvisorInputSchema = z.object({
  query: z.string().describe("The user's question about banking or loans."),
});
export type BankingAdvisorInput = z.infer<typeof BankingAdvisorInputSchema>;

const BankingAdvisorOutputSchema = z.object({
  text: z.string(),
  type: z.string(),
  data: z.any().optional(),
  title: z.string().optional(),
  tip: z.string().optional(),
});
export type BankingAdvisorOutput = z.infer<typeof BankingAdvisorOutputSchema>;

// This is the main exported function that the client-side code will call.
export async function bankingAdvisorFlow(input: BankingAdvisorInput): Promise<BankingAdvisorOutput> {
  // --- THIS IS THE FIX ---
  // The try...catch block ensures that any error during the AI call
  // is caught and logged with details to your terminal.
  try {
    console.log(`\n🔹 [NEW REQUEST] Query: "${input.query}"`);
    const result = await bankingAdvisorGenkitFlow(input);
    console.log("   ✅ AI Response Generated successfully.");
    return result;
  } catch (error: any) {
    console.error("\n🔴 CRITICAL ERROR DETECTED IN BANKING ADVISOR FLOW 🔴");
    console.error("   Error Type:", error.name);
    console.error("   Message:", error.message);
    if (error.stack) console.error("   Stack:", error.stack);
    console.error("------------------------------------------------\n");
    
    // Throw a more user-friendly error to the frontend
    throw new Error("System Maintenance: The AI Advisor is temporarily unavailable. Please try again in 5 minutes.");
  }
}

// Define the Genkit Flow with a centralized prompt
const bankingAdvisorGenkitFlow = ai.defineFlow(
  {
    name: 'bankingAdvisorGenkitFlow',
    inputSchema: BankingAdvisorInputSchema,
    outputSchema: BankingAdvisorOutputSchema,
  },
  async ({ query }) => {
    
    const prompt = `You are a helpful and friendly Banking Advisor for an app called LoanView. Your goal is to guide users toward the right loan type based on their query.

      CONTEXT:
      - The user is inside a loan comparison application.
      - The user may ask about specific needs (e.g., "laptop," "study abroad"), loan types, interest rates, or eligibility.
      - You can suggest the following loan types by setting the 'data' field in your response: 'home', 'personal', 'education', 'business', 'gadget'.
      
      RESPONSE RULES:
      1.  **Greeting**: If the user says "hi", "hello", etc., provide a welcoming message. Set type to 'welcome', and include a title and a helpful tip.
      2.  **Eligibility Check**: If the user asks "Am I eligible?", "Can I get a loan?", etc., set type to 'start_eligibility'. Your text should confirm you're starting the check.
      3.  **Loan Recommendations**: Based on the user's need (e.g., "wedding," "macbook," "start a coffee shop"), recommend a specific loan type. Set type to 'loan_card' and the 'data' field to the appropriate loan ID (e.g., 'personal', 'gadget', 'business'). Explain WHY you are recommending it.
      4.  **Comparisons**: If the user asks to "compare" loans, set type to 'comparison_card'.
      5.  **General Questions**: For questions about rates or EMI, provide general information. Set type to 'text'.
      6.  **Fallback**: If you don't understand, provide a helpful fallback message. Set type to 'text'.

      Analyze the following user query and generate the appropriate JSON response based on the rules.

      USER QUERY: "${query}"
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'gemini-pro',
      output: {
        schema: BankingAdvisorOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
