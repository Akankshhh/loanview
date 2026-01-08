
'use server';

import { ai } from '@/ai/genkit';
import { generate } from '@genkit-ai/ai';
import { z } from 'zod';

const BankingAdvisorInputSchema = z.object({
  query: z.string().describe("The user's question about banking or loans."),
});
export type BankingAdvisorInput = z.infer<typeof BankingAdvisorInputSchema>;

const BankingAdvisorOutputSchema = z.object({
  text: z.string(),
  // Add a field to signal the start of a special flow
  flow: z.enum(['none', 'eligibilityCheck']).optional().default('none'),
});
export type BankingAdvisorOutput = z.infer<typeof BankingAdvisorOutputSchema>;

// --- PROFESSIONAL BANKING KNOWLEDGE BASE ---
// These are "Safe" answers that work 100% of the time without internet/API keys.
const INTERNAL_KNOWLEDGE_BASE: Record<string, string> = {
  "home loan eligibility": "To be eligible for a Home Loan, applicants must be resident citizens between 21 and 60 years of age. Salaried individuals require a minimum work experience of 2 years, while self-employed applicants need 3 years of business continuity. A credit score of 750+ is recommended.",
  
  "home loan interest": "Our Home Loan interest rates are currently floating, starting at 8.35% p.a. for salaried applicants with a high credit score. We also offer fixed-rate options for specific tenures.",
  
  "documents": "Standard documentation includes KYC (PAN/Aadhaar), proof of income (last 3 months' salary slips and Form 16), and the last 6 months of bank statements. Property documents are required prior to disbursement.",
  
  "student loan": "We offer Education Loans covering up to 100% of tuition fees for premier institutes. The loan includes a moratorium period consisting of the course duration plus one year before repayment begins.",
  
  "personal loan": "Our Personal Loans are unsecured and available up to ₹25 Lakhs based on your income profile. Disbursal is typically processed within 24 to 48 hours for pre-approved customers.",
  
  "car loan": "Car loans are available for up to 90% of the vehicle's on-road price. Tenures range from 1 to 7 years with competitive interest rates starting at 8.75%.",
  
  "loan process": "The typical loan process involves these steps: 1. Application submission with required documents. 2. Verification of your identity, income, and credit history. 3. Loan sanctioning by the bank. 4. Signing the loan agreement. 5. Disbursement of the loan amount into your account.",

  "education loan process": "The process for an Education Loan is straightforward: 1. Secure admission to your desired course/university. 2. Gather key documents: Admission Letter, academic records, KYC, and co-borrower's income proof. 3. Submit the completed application form online or at a branch. 4. The bank will review the application and may conduct a personal discussion. 5. Upon approval, you will sign the loan agreement. 6. The tuition fee is typically disbursed directly to the educational institution.",

  "home loan process": "The Home Loan process involves a few key stages: 1. Submit your application with KYC, income proof (salary slips/IT returns), and property documents. 2. The bank conducts a credit appraisal and legal/technical verification of the property. 3. A formal loan sanction letter is issued. 4. You sign the final loan agreement. 5. The loan amount is disbursed to the seller/builder.",
  
  "personal loan process": "For a Personal Loan, the process is quick: 1. Check eligibility and apply online with your KYC and income proof. 2. The bank performs a rapid credit check. 3. If approved, you receive a loan offer with the amount and interest rate. 4. Accept the offer digitally, and the funds are disbursed to your account, often within 24-48 hours.",

  "vehicle loan process": "The process for a Car or Vehicle Loan is: 1. Select the vehicle and get a pro-forma invoice from the dealer. 2. Submit the loan application with KYC, income proof, and the invoice. 3. The bank will verify your details and sanction the loan. 4. Sign the loan agreement and other documents. 5. The bank disburses the loan amount directly to the vehicle dealer.",

  "business loan process": "The Business Loan process typically follows these steps: 1. Prepare a solid business plan and financial projections. 2. Gather documents: Business registration, KYC of promoters, last 3 years' audited financials, and bank statements. 3. Submit the application form along with the prepared documents. 4. The bank will assess the business's viability and creditworthiness. 5. After approval, the loan agreement is signed, and funds are disbursed.",

  "default": "I am your Banking Advisor. I can assist you with Home Loans, Education Loans, Personal Loans, and documentation requirements. How may I assist you today?"
};

export async function bankingAdvisorFlow(input: BankingAdvisorInput): Promise<BankingAdvisorOutput> {
  return bankingAdvisorGenkitFlow(input);
}


// --- THE FLOW DEFINITION ---
const bankingAdvisorGenkitFlow = ai.defineFlow(
  {
    name: 'bankingAdvisorGenkitFlow',
    inputSchema: BankingAdvisorInputSchema,
    outputSchema: BankingAdvisorOutputSchema,
  },
  async ({ query: userQuery }) => {
    // 1. QUERY PROCESSING
    const query = userQuery.toLowerCase().trim();
    console.log(`[Banking Advisor] Received: "${query}"`);

    // 2. CHECK INTERNAL KNOWLEDGE BASE (Layer 1 - Instant & Reliable)
    
    // NEW: Check for eligibility trigger phrases
    if (query.includes("eligible") || query.includes("eligibility") || query.includes("can i get a loan")) {
      return {
        flow: 'eligibilityCheck',
        text: "I can help with that. To check your eligibility, I'll need to ask a few questions."
      };
    }
    
    // Process-specific queries
    if (query.includes("home") && query.includes("process")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["home loan process"] };
    }
    if ((query.includes("education") || query.includes("student")) && query.includes("process")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["education loan process"] };
    }
    if (query.includes("personal") && query.includes("process")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["personal loan process"] };
    }
    if ((query.includes("car") || query.includes("vehicle")) && query.includes("process")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["vehicle loan process"] };
    }
    if (query.includes("business") && query.includes("process")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["business loan process"] };
    }
     if (query.includes("process")) { // General process query
        return { text: INTERNAL_KNOWLEDGE_BASE["loan process"] };
    }

    // General info queries
    if (query.includes("interest") || query.includes("rate") || query.includes("roi")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["home loan interest"] };
    }
    if (query.includes("document") || query.includes("paper") || query.includes("proof")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["documents"] };
    }
    if (query.includes("student") || query.includes("education") || query.includes("study") || query.includes("abroad")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["student loan"] };
    }
    if (query.includes("personal") && query.includes("loan")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["personal loan"] };
    }
    if (query.includes("car") || query.includes("vehicle")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["car loan"] };
    }
    if (query.length < 5 || query.includes("hello") || query.includes("hi")) {
        return { text: INTERNAL_KNOWLEDGE_BASE["default"] };
    }

    // 3. ATTEMPT REAL AI GENERATION (Layer 2 - For complex/new questions)
    try {
      console.log("   Sending to AI Model...");
      const llmResponse = await generate({
        model: ai.model, // Use the globally configured model from genkit.ts for consistency
        prompt: `
          You are a professional Banking Advisor for a major bank.
          User Question: "${userQuery}"
          
          Guidelines:
          - Answer ONLY questions related to banking and loans.
          - Maintain a formal, polite, and professional tone.
          - Do not provide specific financial advice or predict future market trends.
          - Keep the answer concise (under 60 words).
        `,
      });

      console.log("   ✅ AI Response Generated successfully.");
      return { text: llmResponse.text };

    } catch (error: any) {
      // 4. PROFESSIONAL FALLBACK (Layer 3 - Safety Net)
      console.error("\n🔴 CRITICAL ERROR DETECTED 🔴");
      console.error("   Error Type:", error.name);
      console.error("   Message:", error.message);
      if (error.response) console.error("   API Response:", JSON.stringify(error.response, null, 2));
      console.error("------------------------------------------------\n");
      
      return { text: "I can certainly assist with that inquiry. However, to ensure accuracy regarding your specific financial profile, I recommend visiting our nearest branch or checking the 'Loan Policy' section on our official website." };
    }
  }
);
