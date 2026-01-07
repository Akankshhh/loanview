// src/components/dashboard/DashboardControls.tsx
"use client";

import type { FC } from 'react';
import { useI18n } from '@/hooks/useI18n';
import type { Bank, LoanType, BankCategory } from '@/types';
import { BANK_CATEGORIES } from '@/constants/appConstants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DashboardControlsProps {
  banks: Bank[];
  loanTypes: LoanType[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedBank: string;
  onSelectedBankChange: (bankId: string) => void;
  selectedLoanType: string;
  onSelectedLoanTypeChange: (loanTypeId: string) => void;
  selectedBankCategory: string;
  onSelectedBankCategoryChange: (category: string) => void;
  minRate: string;
  onMinRateChange: (rate: string) => void;
  maxRate: string;
  onMaxRateChange: (rate: string) => void;
  onDownloadCsv: () => void;
}

export const DashboardControls: FC<DashboardControlsProps> = ({
  banks,
  loanTypes,
  searchTerm,
  onSearchTermChange,
  selectedBank,
  onSelectedBankChange,
  selectedLoanType,
  onSelectedLoanTypeChange,
  selectedBankCategory,
  onSelectedBankCategoryChange,
  minRate,
  onMinRateChange,
  maxRate,
  onMaxRateChange,
  onDownloadCsv,
}) => {
  const { t } = useI18n();

  return (
    <div className="mb-6 p-4 border rounded-lg shadow bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Label htmlFor="search-loans" className="text-sm font-medium">{t('dashboard.bankLoanRates.filters.searchPlaceholder').split("...")[0]}</Label>
          <Input
            id="search-loans"
            type="text"
            placeholder={t('dashboard.bankLoanRates.filters.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Bank Filter */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Label htmlFor="bank-filter" className="text-sm font-medium">{t('dashboard.bankLoanRates.filters.selectBank')}</Label>
          <Select value={selectedBank} onValueChange={onSelectedBankChange}>
            <SelectTrigger id="bank-filter" className="mt-1">
              <SelectValue placeholder={t('dashboard.bankLoanRates.filters.allBanks')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.bankLoanRates.filters.allBanks')}</SelectItem>
              {banks.map(bank => (
                <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loan Type Filter */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Label htmlFor="loantype-filter" className="text-sm font-medium">{t('dashboard.bankLoanRates.filters.selectLoanType')}</Label>
          <Select value={selectedLoanType} onValueChange={onSelectedLoanTypeChange}>
            <SelectTrigger id="loantype-filter" className="mt-1">
              <SelectValue placeholder={t('dashboard.bankLoanRates.filters.allLoanTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.bankLoanRates.filters.allLoanTypes')}</SelectItem>
              {loanTypes.map(loanType => (
                <SelectItem key={loanType.id} value={loanType.id}>{t(loanType.nameKey)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bank Category Filter */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Label htmlFor="bankcategory-filter" className="text-sm font-medium">{t('dashboard.bankLoanRates.filters.selectBankCategory')}</Label>
          <Select value={selectedBankCategory} onValueChange={onSelectedBankCategoryChange}>
            <SelectTrigger id="bankcategory-filter" className="mt-1">
              <SelectValue placeholder={t('dashboard.bankLoanRates.filters.allBankCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.bankLoanRates.filters.allBankCategories')}</SelectItem>
              {BANK_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{t(`dashboard.bankLoanRates.filters.${category.toLowerCase().replace(/\s+/g, '')}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Interest Rate Range Filter */}
        <div className="grid grid-cols-2 gap-2 items-end md:col-span-1 xl:col-span-1">
            <div>
                <Label htmlFor="min-rate" className="text-sm font-medium">{t('dashboard.bankLoanRates.filters.minRate')}</Label>
                <Input
                    id="min-rate"
                    type="number"
                    placeholder="e.g., 5"
                    value={minRate}
                    onChange={(e) => onMinRateChange(e.target.value)}
                    className="mt-1"
                    step="0.1"
                />
            </div>
            <div>
                <Label htmlFor="max-rate" className="text-sm font-medium">{t('dashboard.bankLoanRates.filters.maxRate')}</Label>
                <Input
                    id="max-rate"
                    type="number"
                    placeholder="e.g., 15"
                    value={maxRate}
                    onChange={(e) => onMaxRateChange(e.target.value)}
                    className="mt-1"
                    step="0.1"
                />
            </div>
        </div>

        {/* Download CSV Button */}
        <div className="md:col-start-2 lg:col-start-auto xl:col-start-auto flex justify-end">
          <Button onClick={onDownloadCsv} variant="outline" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t('dashboard.bankLoanRates.downloadCsv')}
          </Button>
        </div>
      </div>
    </div>
  );
};
