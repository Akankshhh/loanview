
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShieldCheck, Lightbulb, FileText, CheckCircle, XCircle } from 'lucide-react';
import { bankingAdvisorFlow, type BankingAdvisorOutput } from '@/ai/flows/banking-advisor-flow';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- ELIGIBILITY CHECK FLOW LOGIC ---

type EligibilityStep = {
  key: keyof EligibilityData;
  question: string;
  type: 'text' | 'number';
};

type EligibilityData = {
  loanType: string;
  amount: number | null;
  tenure: number | null;
  monthlyIncome: number | null;
  creditScore: number | null;
  existingEMI: number | null;
  employmentType: string;
};

const eligibilitySteps: EligibilityStep[] = [
  { key: 'loanType', question: `Which loan type are you interested in? (e.g., home, personal, car, education)`, type: 'text' },
  { key: 'amount', question: 'What loan amount do you need? (in ₹)', type: 'number' },
  { key: 'monthlyIncome', question: 'What is your approximate monthly income? (in ₹)', type: 'number' },
  { key: 'creditScore', question: 'What is your CIBIL score? (e.g., 600, 700, 750)', type: 'number' },
  { key: 'existingEMI', question: 'Do you have any existing monthly EMIs? If so, what is the total amount? (Enter 0 if none)', type: 'number' },
];

const parseNumber = (text: string) => {
  const cleaned = text.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};


// --- COMPONENTS ---
const MessageBubble = ({ message }: { message: any }) => {
  const isBot = message.sender === 'bot';

  // Function to render text with bold tags and detect links
  const renderText = (text: string) => {
    if (!text) return null;
    
    // Split by markdown bold syntax
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
             {message.isResult ? (
                <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                        {message.isSuccess ? <CheckCircle className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
                        <h4 className="font-bold text-lg">{message.isSuccess ? "Congratulations! You are likely eligible." : "Eligibility Check Result"}</h4>
                    </div>
                    <p>{renderText(message.text)}</p>
                    {message.isSuccess && (
                         <Button asChild className='mt-2'>
                            <Link href="/apply">
                                <FileText className='mr-2 h-4 w-4'/>
                                Proceed to Application
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                renderText(message.text)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AIAdvisorPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<(BankingAdvisorOutput & { id: number, sender: 'bot' | 'user', isResult?: boolean, isSuccess?: boolean })[]>([
    { 
      id: 1, 
      sender: 'bot', 
      text: "Hello! I am your Banking Advisor. I can assist with loan information, processes, or even check your basic eligibility. How may I assist you today? (Try: 'am i eligible for a loan?')"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for the eligibility flow
  const [inEligibilityFlow, setInEligibilityFlow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [eligibilityData, setEligibilityData] = useState<Partial<EligibilityData>>({});


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
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg] as any);
  };
  
  const resetFlow = () => {
      setInEligibilityFlow(false);
      setCurrentStep(0);
      setEligibilityData({});
  };
  
  const handleEligibilityFlow = (text: string) => {
    const currentQuestion = eligibilitySteps[currentStep];
    const updatedData = { ...eligibilityData };
    let value: string | number | null = text;
    
    if (currentQuestion.type === 'number') {
      value = parseNumber(text);
      if (value === null) {
        pushBotMessage({ text: "Please enter a valid number." });
        return;
      }
    }
    
    updatedData[currentQuestion.key] = value as any;
    setEligibilityData(updatedData);

    const nextStep = currentStep + 1;

    if (nextStep < eligibilitySteps.length) {
      // Ask the next question
      setCurrentStep(nextStep);
      pushBotMessage({ text: eligibilitySteps[nextStep].question });
    } else {
      // End of flow, evaluate eligibility
      evaluateEligibility(updatedData as EligibilityData);
      resetFlow();
    }
  };

  const evaluateEligibility = (data: EligibilityData) => {
    const { creditScore } = data;
    
    if (creditScore === null) {
        pushBotMessage({ isResult: true, isSuccess: false, text: "Could not determine eligibility due to missing credit score." });
        return;
    }

    if (creditScore < 650) {
      pushBotMessage({ 
          isResult: true, 
          isSuccess: false, 
          text: `Based on the information provided, you are likely **not eligible** for a loan at this time. Your CIBIL score of ${creditScore} is below the minimum requirement of 650. We recommend improving your score before reapplying.` 
      });
    } else {
       pushBotMessage({ 
          isResult: true, 
          isSuccess: true, 
          text: `With a CIBIL score of ${creditScore} and the other details provided, you have a good chance of being eligible. You can proceed with a formal application.`
      });
    }
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim() || isLoading) return;

    pushUserMessage(text);
    setInputText('');
    setIsLoading(true);

    if (inEligibilityFlow) {
      handleEligibilityFlow(text);
      setIsLoading(false);
      return;
    }

    try {
      const response = await bankingAdvisorFlow({ query: text });
      pushBotMessage({ text: response.text });
      
      // Check if the response triggers the eligibility flow
      if (response.flow === 'eligibilityCheck') {
        setInEligibilityFlow(true);
        setCurrentStep(0);
        setEligibilityData({});
        // Ask the first question of the flow
        pushBotMessage({ text: eligibilitySteps[0].question });
      }

    } catch (error) {
      console.error("Error calling banking advisor flow:", error);
      const errorMsg = { id: Date.now() + 1, text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.", sender: 'bot' };
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
        {isLoading && <MessageBubble message={{ id: 'typing', sender: 'bot', text: '...' }} />}
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
            placeholder={inEligibilityFlow ? eligibilitySteps[currentStep].question : "Ask about loans or eligibility..."}
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
