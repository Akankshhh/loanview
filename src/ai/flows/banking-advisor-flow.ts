
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  const result = await bankingAdvisorGenkitFlow({ query: input.query });
  return result;
}

// Define the Genkit Flow
const bankingAdvisorGenkitFlow = ai.defineFlow(
  {
    name: 'bankingAdvisorFlow',
    inputSchema: BankingAdvisorInputSchema,
    outputSchema: BankingAdvisorOutputSchema,
  },
  async ({ query }) => {
    // This is the internal logic that processes the query. It's now running on the server.
    const lowerInput = query.toLowerCase();

    // 1. SCENARIO DETECTION
    const scenarios = {
      tech_gear: /(laptop|macbook|graphics card|gpu|robotics|raspberry pi|sensor|workstation|3d rendering|vr headset|hardware)/.test(lowerInput),
      upskilling: /(bootcamp|course|certification|coaching|training|aws|cybersecurity|data science|web development|gate|exam)/.test(lowerInput),
      student_startup: /(incubator|seed money|patent|prototype|competition|fest|campus business)/.test(lowerInput),
      abroad: /(abroad|overseas|foreign|uk|canada|usa|germany|australia|medicine|masters)/.test(lowerInput) && /(study|university|degree|admission|living expenses)/.test(lowerInput),
      medical: /(medical|emergency|surgery|hospital|treatment|health)/.test(lowerInput),
      wedding: /(wedding|marriage|venue|catering|ceremony|bride|groom)/.test(lowerInput),
      travel: /(travel|vacation|europe|trip|holiday|flight|tour)/.test(lowerInput),
      business_expansion: /(working capital|expand|machinery|inventory|factory|renovate shop)/.test(lowerInput),
      business_new: /(startup|coffee shop|open a|start a business|textile|store)/.test(lowerInput)
    };

    // 2. INTENT DETECTION
    const intents = {
      greeting: /^(hi|hello|hey|start|good morning|good evening)/.test(lowerInput),
      rates: /rate|interest|percent|%/.test(lowerInput),
      compare: /compare|difference|better| vs |vs\./.test(lowerInput),
      eligibility: /eligible|eligib|score|credit|qualify|can i get|can i borrow|am i eligible/.test(lowerInput),
      emi: /emi|calculate|cost/.test(lowerInput),
    };

    // --- RESPONSE GENERATION ---
    if (scenarios.tech_gear) {
      return {
        text: "For engineering students needing high-performance gear (Laptops, GPUs, Robotics kits), we offer a **Student Equipment Loan**.\n\n**Horizon Trust** offers a special **0% EMI scheme** for laptops under 12 months tenure.\n**Apex Financial** offers up to 2 Lakhs for workstation setups at 12%.",
        type: 'loan_card',
        data: 'gadget'
      };
    }
    if (scenarios.upskilling) {
      return {
        text: "Investing in skills is excellent! For Bootcamps, Certifications (AWS, Data Science), or Coaching:\n\nYou can apply for a **Skill Development Loan** (a sub-category of Education Loans).\n• Covers 100% of course fees.\n• Repayment starts after course completion.\n• **Apex Financial** has a tie-up with major bootcamps for lower rates.",
        type: 'text'
      };
    }
    if (scenarios.student_startup) {
      return {
        text: "That's an exciting initiative! For student startups, prototypes, or patents:\n\nWe recommend the **'Campus Entrepreneur' Micro-Loan**.\n• Amounts up to ₹50,000 for prototypes.\n• Requires a letter from your college incubator or professor.\n• **Horizon Trust** supports student innovations with flexible repayment.",
        type: 'text'
      };
    }
    if (scenarios.abroad) {
      return {
        text: "Pursuing studies abroad (UK, Canada, Medicine, etc.) requires significant funding.\n\nOur **Education Loan** covers:\n• Tuition Fees\n• Living Expenses (travel, accommodation)\n\n**Apex Financial** is preferred for high-value overseas loans (>20 Lakhs) with a long repayment holiday (moratorium).",
        type: 'loan_card',
        data: 'education'
      };
    }
    if (scenarios.medical) {
      return {
        text: "I understand this is urgent. For medical emergencies, **Personal Loans** are the fastest option.\n\n• **Horizon Trust** offers 'Instant Disbursal' (within 4 hours) for medical grounds.\n• Minimal documentation required.\n• Interest rates start at 10.9%.",
        type: 'loan_card',
        data: 'personal'
      };
    }
    if (scenarios.wedding) {
      return {
        text: "Congratulations on the upcoming wedding! To manage venue and catering costs:\n\nA **Personal Loan** is ideal. You can borrow a lump sum and repay over 1-5 years.\n**Apex Financial** offers large ticket personal loans (up to 25 Lakhs) which is suitable for grand events.",
        type: 'loan_card',
        data: 'personal'
      };
    }
    if (scenarios.travel) {
      return {
        text: "Planning a trip to Europe? Sounds amazing.\n\nYou can use a **Travel Loan** (Personal Loan) to cover flights and hotels upfront.\nAlternatively, **Horizon Trust** credit cards offer 0% foreign transaction fees if you are eligible.",
        type: 'text'
      };
    }
    if (scenarios.business_new || scenarios.business_expansion) {
      const isNew = scenarios.business_new;
      return {
        text: isNew 
          ? "Starting a new business (Coffee shop, Textile, etc.)? You might need a **Mudra Loan** or **Startup Capital Loan**.\n\n**Horizon Trust** is great for new entrepreneurs as they rely less on past vintage and more on your business plan."
          : "For expanding your existing business (Machinery, Inventory):\n\n**Apex Financial** offers lower rates (10.5%) for businesses with >2 years vintage. They also offer Equipment Financing specifically for machinery.",
        type: 'loan_card',
        data: 'business'
      };
    }

    if (intents.greeting) {
      return {
        type: 'welcome',
        title: 'Banking & Loan Advisor',
        tip: 'I can assist with Student Gear, Study Abroad, Startups, and Emergencies.',
        text: "Hello! I can help with loans for **Laptops**, **Study Abroad**, **Business**, or **Personal needs**. \n\nTry asking: 'I need a high-spec laptop for coding' or 'Loan for my sister's wedding'."
      };
    }

    if (intents.eligibility) {
      return {
        type: 'start_eligibility',
        text: "Sure — let's check your eligibility. I'll ask a few quick questions (amount, loan type, tenure, income, credit score, existing EMIs). Ready?"
      };
    }

    if (intents.compare) {
      return {
        text: "Here is a quick comparison of interest rates:",
        type: 'comparison_card'
      };
    }

    const BANK_DATA = [
      { id: 'apex', name: 'Apex Financial', loans: { home: { rate: 6.5 }, business: { rate: 10.5 } } },
      { id: 'horizon', name: 'Horizon Trust', loans: { home: { rate: 6.8 }, business: { rate: 11.0 } } }
    ];

    const LOAN_TYPES = [
      { id: 'home', label: 'Home Loan' },
      { id: 'auto', label: 'Auto Loan' },
      { id: 'personal', label: 'Personal Loan' },
      { id: 'education', label: 'Education Loan' },
      { id: 'business', label: 'Business Loan' },
      { id: 'gadget', label: 'Gadget/Gear Loan' }
    ];

    const specificBank = BANK_DATA.find(b => lowerInput.includes(b.name.toLowerCase()) || lowerInput.includes(b.id));
    const specificLoan = LOAN_TYPES.find(l => lowerInput.includes(l.label.toLowerCase()) || lowerInput.includes(l.id));

    if (specificBank && specificLoan) {
      const bank = specificBank;
      const loanId = specificLoan.id as keyof typeof bank.loans;
      const details = (bank.loans as any)[loanId];
      if (!details) {
         return { text: `Sorry, ${bank.name} does not offer ${specificLoan.label}s at this moment.`, type: 'text' };
      }
      return {
        text: `**${bank.name} - ${specificLoan.label}**\n\nInterest Rate: **${details.rate}%**`,
        type: 'text'
      };
    }

    if (specificLoan) {
      return {
        text: `I found these offers for ${specificLoan.label}s.`,
        type: 'loan_card',
        data: specificLoan.id
      };
    }

    if (intents.rates || intents.emi) {
      return {
        text: "Interest rates vary by loan type:\n• Home: 6.5% - 7.5%\n• Education: 6.8% - 7.5%\n• Business: 10.5% - 11.0%\n• Gadget/Personal: 10.9% - 12.0%\n\nI can calculate EMI if you tell me the amount and duration.",
        type: 'text'
      };
    }

    // Default fallback
    return {
      text: "I'm not sure I understood the context. Could you clarify?\n\nFor example: 'I need a loan for a laptop', 'I'm moving to Canada for studies', or 'I need to buy machinery for my factory'.",
      type: 'text'
    };
  }
);
