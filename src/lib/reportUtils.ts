// src/lib/reportUtils.ts
import type { I18nContextType } from '@/contexts/I18nContext';
import { toast } from "@/hooks/use-toast";
import type { LoanDetails } from './loanUtils';
import type { LoanTypeId } from '@/types';

type LoanReportData = LoanDetails & {
  loanAmount: number;
  interestRate: number;
  loanTenureMonths: number;
  loanType: LoanTypeId;
};


/**
 * Saves loan report data to local storage and shows a toast notification.
 * @param data The loan data to save.
 * @param i18n The i18n context for translation.
 */
export function saveLoanReportData(data: LoanReportData, i18n: I18nContextType) {
  try {
    localStorage.setItem('loanReportData', JSON.stringify(data));
    toast({
      title: i18n.t('compareLoans.calculationSavedTitle'),
      description: i18n.t('compareLoans.calculationSavedDesc'),
    });
  } catch (error) {
    console.error("Failed to save loan report data to local storage:", error);
  }
}
