// src/components/shared/LanguageSelector.tsx
"use client";

import type { Language } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { SUPPORTED_LANGUAGES } from '@/constants/appConstants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
