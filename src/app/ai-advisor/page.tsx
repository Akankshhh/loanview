
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Bot, User, Send, Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bankingAdvisorFlow, BankingAdvisorInput, BankingAdvisorOutput } from '@/ai/flows/banking-advisor-flow';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  flow?: 'none' | 'eligibilityCheck';
};

type EligibilityState = 'idle' | 'awaiting_cibil' | 'awaiting_income' | 'done';

const MessageBubble = ({ message }: { message: { text: string; sender: 'bot' | 'user' } }) => {
  const isBot = message.sender === 'bot';
  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mt-1 shadow-sm ${isBot ? 'bg-primary mr-3' : 'bg-slate-700 ml-3'}`}>
          {isBot ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
        </div>
        <div className="flex flex-col">
          {isBot && <span className="text-xs font-bold text-primary mb-1 ml-1">Banking & Loan Advisor</span>}
          <div className={cn(
            "p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-line border",
            isBot ? 'bg-white text-slate-800 rounded-tl-none border-slate-200' : 'bg-primary text-white rounded-tr-none border-primary'
          )}>
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AIAdvisorPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: "Hello! I am your AI Banking Advisor. You can ask me about loan processes like \"Explain the home loan process\" or check your eligibility by asking \"Am I eligible for a personal loan?\"" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityState, setEligibilityState] = useState<EligibilityState>('idle');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2); // Start message IDs from 2

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text: string, sender: 'bot' | 'user', flow: Message['flow'] = 'none') => {
    setMessages(prev => [...prev, { id: nextId.current++, text, sender, flow }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    addMessage(userMessage, 'user');
    setInputValue('');
    setIsLoading(true);

    try {
      if (eligibilityState !== 'idle') {
        processEligibility(userMessage);
      } else {
        const history = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'model' as const,
          content: [{ text: msg.text }],
        }));

        const input: BankingAdvisorInput = { query: userMessage, history: history.slice(1) };
        const response: BankingAdvisorOutput = await bankingAdvisorFlow(input);
        
        addMessage(response.text, 'bot', response.flow);

        if (response.flow === 'eligibilityCheck') {
          setEligibilityState('awaiting_cibil');
        }
      }
    } catch (error) {
      console.error("Error calling banking advisor flow:", error);
      addMessage("I'm sorry, but I encountered an error. Please try again later.", 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const processEligibility = (value: string) => {
    if (eligibilityState === 'awaiting_cibil') {
      const score = parseInt(value, 10);
      if (isNaN(score)) {
        addMessage("Please provide a valid number for your CIBIL score.", 'bot');
      } else if (score < 650) {
        addMessage(`A CIBIL score of ${score} is generally considered low. Based on this, you are likely not eligible for most loans at this time. I recommend improving your score before applying.`, 'bot');
        setEligibilityState('idle');
      } else {
        addMessage("Great! A score above 650 is a good start. What is your approximate monthly income in INR?", 'bot');
        setEligibilityState('awaiting_income');
      }
    } else if (eligibilityState === 'awaiting_income') {
        addMessage("Thank you for the information. Based on the initial details you've provided, you seem to be eligible to apply for a loan! For a formal decision, please proceed to our application page.", 'bot');
        setEligibilityState('idle');
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
      
      <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
         {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-primary mr-3">
                 <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
              <div className="p-4 rounded-2xl shadow-sm bg-white text-slate-500 border border-slate-200">
                Typing...
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <div className="bg-card border-t p-4 md:p-6 z-10 rounded-b-xl">
        <div className="w-full relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
          <input
            type="text"
            placeholder="Ask about loans or check your eligibility..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-transparent px-6 py-4 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={cn(
                "p-3 mr-2 rounded-full transition-colors",
                (isLoading || !inputValue.trim())
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
            )}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}
