'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShieldCheck, Lightbulb } from 'lucide-react';
import { bankingAdvisorFlow, type BankingAdvisorOutput } from '@/ai/flows/banking-advisor-flow';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// --- MOCK KNOWLEDGE BASE (STATIC UI DATA) ---
const BANK_DATA = [
  {
    id: 'apex',
    name: 'Apex Financial',
    loans: {
      home: { rate: 6.5, maxTenure: 30, minScore: 700 },
      auto: { rate: 8.2, maxTenure: 7, minScore: 650 },
      personal: { rate: 11.5, maxTenure: 5, minScore: 600 },
      education: { rate: 7.0, maxTenure: 15, minScore: 0 },
      business: { rate: 10.5, maxTenure: 10, minScore: 700 },
      gadget: { rate: 12.0, maxTenure: 2, minScore: 0 }
    }
  },
  {
    id: 'horizon',
    name: 'Horizon Trust',
    loans: {
      home: { rate: 6.8, maxTenure: 25, minScore: 650 },
      auto: { rate: 7.9, maxTenure: 8, minScore: 680 },
      personal: { rate: 10.9, maxTenure: 6, minScore: 620 },
      education: { rate: 6.8, maxTenure: 12, minScore: 0 },
      business: { rate: 11.0, maxTenure: 7, minScore: 650 },
      gadget: { rate: 0.0, maxTenure: 1, minScore: 0 } // 0% EMI scheme
    }
  }
];

// --- Helper functions for eligibility flow ---
const eligibilitySteps = [
  { key: 'loanType', question: `Which loan type? (home, auto, personal, education, business, gadget)` },
  { key: 'amount', question: 'What loan amount do you need? (in ₹)' },
  { key: 'tenure', question: 'Preferred tenure (years)?' },
  { key: 'monthlyIncome', question: 'Your monthly income (in ₹)?' },
  { key: 'creditScore', question: 'Approx. your credit score (e.g., 600, 700)?' },
  { key: 'existingEMI', question: 'Existing monthly EMI/outgoings (in ₹). If none, type 0.' },
  { key: 'employmentType', question: 'Employment type: salaried / self-employed / student / other' }
];

const parseNumber = (text: string) => {
  const cleaned = text.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

const calculateMonthlyEMI = (principal: number, annualRatePercent: number, years: number) => {
  if (annualRatePercent === 0) return principal / (years * 12);
  const r = annualRatePercent / 100 / 12;
  const n = years * 12;
  const emi = (principal * r) / (1 - Math.pow(1 + r, -n));
  return emi;
};

export const checkBankEligibility = (bank: any, loanKey: string, data: any) => {
  const reasons: string[] = [];
  const loanDef = bank.loans[loanKey];
  if (!loanDef) {
    reasons.push('Loan type not offered by this bank.');
    return { eligible: false, reasons };
  }

  // credit score check
  if (loanDef.minScore && loanDef.minScore > 0 && data.creditScore < loanDef.minScore) {
    reasons.push(`Credit score below required (${loanDef.minScore}).`);
  }

  // tenure check
  if (data.tenure > loanDef.maxTenure) {
    reasons.push(`Requested tenure (${data.tenure}y) exceeds bank's max tenure (${loanDef.maxTenure}y).`);
  }

  // affordability check: EMI <= 50% of (monthlyIncome - existingEMI)
  const emi = calculateMonthlyEMI(data.amount, loanDef.rate, data.tenure);
  const netAvailable = Math.max(0, data.monthlyIncome - data.existingEMI);
  const allowed = netAvailable * 0.5;
  if (emi > allowed) {
    reasons.push(`Estimated EMI ₹${emi.toFixed(0)} exceeds 50% of your net income after existing EMIs (₹${allowed.toFixed(0)}).`);
  }

  const eligible = reasons.length === 0;
  return { eligible, reasons, emi: Math.round(emi), bankRate: loanDef.rate };
};

// --- COMPONENTS ---
const MessageBubble = ({ message }: { message: any }) => {
  const isBot = message.sender === 'bot';

  // Function to render text with bold tags
  const renderText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };
  
  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mt-1 shadow-sm ${isBot ? 'bg-teal-700 mr-3' : 'bg-slate-700 ml-3'}`}>
          {isBot ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          {isBot && <span className="text-xs font-bold text-teal-800 mb-1 ml-1">Banking & Loan Advisor</span>}
          
          <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-line border ${
            isBot 
              ? 'bg-white text-slate-800 rounded-tl-none border-slate-200' 
              : 'bg-teal-600 text-white rounded-tr-none border-teal-600'
          }`}>
            
            {message.type === 'welcome' ? (
              <div className="space-y-3">
                 <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                    <ShieldCheck size={16} className="text-teal-600" />
                    <span className="font-bold text-slate-800">{message.title}</span>
                 </div>
                 
                 <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex items-start space-x-2">
                    <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-teal-900 font-medium text-sm">{message.tip}</span>
                 </div>
                 
                 <p className="text-slate-600 mt-2">{renderText(message.text)}</p>
              </div>
            ) : (
              <div>
                {renderText(message.text)}

                {message.type === 'comparison_card' && (
                  <div className="mt-4 grid gap-2">
                    {BANK_DATA.map(bank => (
                      <div key={bank.id} className="bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="font-bold text-slate-700">{bank.name}</div>
                        <div className="flex justify-between text-xs mt-1 text-slate-500">
                          <span>Home: {bank.loans.home?.rate || 'N/A'}%</span>
                          <span>Business: {bank.loans.business?.rate || 'N/A'}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                 {message.type === 'loan_card' && message.data && (
                   <div className="mt-4 space-y-2">
                     {BANK_DATA
                       .filter(bank => bank.loans[message.data as keyof typeof bank.loans]) // Filter banks that offer the loan
                       .map(bank => {
                         const details = bank.loans[message.data as keyof typeof bank.loans];
                         if (!details) return null; // Should not happen due to filter, but for type safety
                         return (
                           <div key={bank.id} className="bg-slate-50 p-3 rounded border border-slate-200 flex justify-between items-center">
                             <div>
                               <div className="font-semibold text-slate-700">{bank.name}</div>
                               {details.rate === 0.0 ? (
                                 <div className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">0% EMI Offer</div>
                               ) : (
                                 <div className="text-xs text-slate-500">Max Tenure: {details.maxTenure}y</div>
                               )}
                             </div>
                             <div className="text-right">
                               <div className="text-lg font-bold text-teal-600">{details.rate}%</div>
                               <div className="text-xs text-slate-400">Interest Rate</div>
                             </div>
                           </div>
                         )
                     })}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AIAdvisorPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<(BankingAdvisorOutput & { id: number, sender: 'bot' | 'user' })[]>([
    { 
      id: 1, 
      sender: 'bot', 
      type: 'welcome',
      title: 'Banking & Loan Advisor',
      tip: 'I can assist with Student Gear, Study Abroad, Startups, and Emergencies.',
      text: "Hello! I can help with loans for **Laptops**, **Study Abroad**, **Business**, or **Personal needs**. \n\nTry asking: 'I need a high-spec laptop for coding' or 'Loan for my sister's wedding'."
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilitySession, setEligibilitySession] = useState<any>(null); // null or { stepIndex, data }
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // push bot message helper
  const pushBotMessage = (payload: any) => {
    const botMsg = { id: Date.now() + Math.random(), sender: 'bot', ...payload };
    setMessages(prev => [...prev, botMsg]);
  };

  // push user message helper
  const pushUserMessage = (text: string) => {
    const userMsg = { id: Date.now(), text, sender: 'user', type: 'text' };
    setMessages(prev => [...prev, userMsg] as any);
  };

  // start eligibility flow
  const startEligibilityFlow = () => {
    setEligibilitySession({ stepIndex: 0, data: {} });
    pushBotMessage({ type: 'text', text: "Great — we'll check eligibility step-by-step. You can type 'cancel' anytime to stop." });
    // ask first question
    const q = eligibilitySteps[0].question;
    pushBotMessage({ type: 'text', text: q });
  };

  // finish and compute results
  const finishEligibilityFlow = (collected: any) => {
    // compute per-bank eligibility
    pushBotMessage({ type: 'text', text: 'Calculating eligibility across banks — one moment...' });

    const results = BANK_DATA.map(bank => {
      return { bankId: bank.id, name: bank.name, ...checkBankEligibility(bank, collected.loanType, collected) };
    });

    // present results
    results.forEach(res => {
      if (res.eligible) {
        pushBotMessage({
          type: 'text',
          text: `✅ **${res.name}** — Eligible\nInterest Rate: ${res.bankRate}%\nEstimated EMI: ₹${res.emi}/month\nNext: You can apply and upload documents (ID, income proof).`
        });
      } else {
        pushBotMessage({
          type: 'text',
          text: `❌ **${res.name}** — Not Eligible\nReason(s):\n• ${res.reasons.join('\n• ')}\nSuggestion: Improve credit score, reduce requested tenure/amount, or lower existing EMIs.`
        });
      }
    });

    setEligibilitySession(null);
  };

  // process a single answer in eligibility flow
  const handleEligibilityAnswer = (text: string) => {
    const lower = text.trim().toLowerCase();
    if (lower === 'cancel') {
      pushBotMessage({ type: 'text', text: 'Eligibility check cancelled. How else can I help?' });
      setEligibilitySession(null);
      return;
    }

    setEligibilitySession((prev: any) => {
      if (!prev) return null;
      const stepIndex = prev.stepIndex;
      const step = eligibilitySteps[stepIndex];
      const curData = { ...prev.data };

      // validate & store answers based on step key
      let invalid = false;
      let storedValue: string | number | null = null;
      const LOAN_TYPES = [
        { id: 'home', label: 'Home Loan' },
        { id: 'auto', label: 'Auto Loan' },
        { id: 'personal', label: 'Personal Loan' },
        { id: 'education', label: 'Education Loan' },
        { id: 'business', label: 'Business Loan' },
        { id: 'gadget', label: 'Gadget/Gear Loan' }
      ];


      switch (step.key) {
        case 'loanType': {
          const found = LOAN_TYPES.find(l => text.toLowerCase().includes(l.id) || text.toLowerCase().includes(l.label.toLowerCase()));
          if (found) storedValue = found.id;
          else {
            // accept single-word loan ids too
            const possible = LOAN_TYPES.map(l => l.id);
            if (possible.includes(lower)) storedValue = lower;
            else invalid = true;
          }
          break;
        }
        case 'amount': {
          const num = parseNumber(text);
          if (num && num > 0) storedValue = Math.round(num);
          else invalid = true;
          break;
        }
        case 'tenure': {
          const num = parseNumber(text);
          if (num && num > 0 && num <= 30) storedValue = Math.round(num);
          else invalid = true;
          break;
        }
        case 'monthlyIncome': {
          const num = parseNumber(text);
          if (num && num > 0) storedValue = Math.round(num);
          else invalid = true;
          break;
        }
        case 'creditScore': {
          const num = parseNumber(text);
          if (num && num >= 300 && num <= 900) storedValue = Math.round(num);
          else invalid = true;
          break;
        }
        case 'existingEMI': {
          const num = parseNumber(text);
          if (num !== null && num >= 0) storedValue = Math.round(num);
          else invalid = true;
          break;
        }
        case 'employmentType': {
          const v = text.toLowerCase();
          if (['salaried','self-employed','student','other'].some(k => v.includes(k))) {
            if (v.includes('salaried')) storedValue = 'salaried';
            else if (v.includes('self')) storedValue = 'self-employed';
            else if (v.includes('student')) storedValue = 'student';
            else storedValue = 'other';
          } else {
            invalid = true;
          }
          break;
        }
        default:
          invalid = true;
      }

      if (invalid) {
        // ask to re-enter
        pushBotMessage({ type: 'text', text: `I couldn't understand that. ${step.question}` });
        return prev; // unchanged session
      }

      // store value
      curData[step.key] = storedValue;

      // move to next step or finish
      const nextIndex = stepIndex + 1;
      if (nextIndex >= eligibilitySteps.length) {
        // all collected
        setTimeout(() => finishEligibilityFlow(curData), 500);
        return null;
      } else {
        // ask next question
        setTimeout(() => {
          pushBotMessage({ type: 'text', text: eligibilitySteps[nextIndex].question });
        }, 250);
        return { stepIndex: nextIndex, data: curData };
      }
    });
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim() || isLoading) return;

    pushUserMessage(text);
    setInputText('');
    setIsLoading(true);

    if (eligibilitySession) {
      setTimeout(() => {
        handleEligibilityAnswer(text)
        setIsLoading(false);
      }, 300);
      return;
    }
    
    try {
      const response = await bankingAdvisorFlow({ query: text });
      if (response.type === 'start_eligibility') {
        // push bot reply and then start flow
        pushBotMessage({ type: 'text', text: response.text });
        setTimeout(() => startEligibilityFlow(), 300);
      } else {
        const botMsg = { id: Date.now() + 1, ...response, sender: 'bot' };
        setMessages(prev => [...prev, botMsg] as any);
      }

    } catch (error) {
      console.error("Error calling banking advisor flow:", error);
      const errorMsg = { id: Date.now() + 1, text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.", sender: 'bot', type: 'text' };
      setMessages(prev => [...prev, errorMsg] as any);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl flex flex-col h-[calc(100vh-12rem)] animate-in fade-in-0 duration-500">
      <CardHeader>
        <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle>{t('nav.bankingAdvisor')}</CardTitle>
        </div>
        <CardDescription>Your AI-powered guide for banking and loan queries.</CardDescription>
      </CardHeader>
      
      {/* Chat Feed */}
      <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        {messages.map((msg, index) => (
          <MessageBubble key={msg.id || index} message={msg} />
        ))}
        {isLoading && <MessageBubble message={{ id: 'typing', sender: 'bot', type: 'text', text: '...' }} />}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Area */}
      <div className="bg-card border-t p-4 md:p-6 z-10 rounded-b-xl">
        <div className="w-full relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 focus-within:border-teal-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:shadow-md transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your query here... (try: 'Am I eligible for a home loan?')"
            className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 mr-2 rounded-full transition-all ${inputText.trim() && !isLoading ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}
