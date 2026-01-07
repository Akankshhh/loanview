// src/app/page.tsx
"use client";

import { useState, useMemo, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { DASHBOARD_METRICS, BANKS_DATA, LOAN_TYPES } from '@/lib/data';
import type { Bank, FilteredBankLoanProduct } from '@/types';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { KeyRateStats } from '@/components/dashboard/KeyRateStats';
import { BankRatesComparisonChart } from '@/components/dashboard/BankRatesComparisonChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Activity, Building } from 'lucide-react';
import { LoanInterestRatesChart } from '@/components/dashboard/LoanInterestRatesChart';
import { BankLoanRatesTable } from '@/components/dashboard/BankLoanRatesTable';
import { exportDataToCsv } from '@/lib/exportUtils';
import { useAllBankLoanProducts } from '@/hooks/useAllBankLoanProducts';

export default function DashboardPage() {
  const i18n = useI18n();
  const { t, formatNumber } = i18n;
  const { allBankLoanProducts, isLoading: productsLoading } = useAllBankLoanProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [selectedLoanType, setSelectedLoanType] = useState('all');
  const [selectedBankCategory, setSelectedBankCategory] = useState('all');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const filteredLoanProducts = useMemo(() => {
    if (!allBankLoanProducts) return [];
    return allBankLoanProducts.filter(product => {
      const bankNameMatch = product.bankName.toLowerCase().includes(searchTerm.toLowerCase());
      const loanTypeNameMatch = t(product.loanTypeNameKey).toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = searchTerm === '' || bankNameMatch || loanTypeNameMatch;

      const bankFilterMatch = selectedBank === 'all' || product.bankId === selectedBank;
      const loanTypeFilterMatch = selectedLoanType === 'all' || product.loanTypeId === selectedLoanType;
      const bankCategoryFilterMatch = selectedBankCategory === 'all' || product.bankCategory === selectedBankCategory;
      
      const minRateFilter = minRate === '' || product.interestRate >= parseFloat(minRate);
      const maxRateFilter = maxRate === '' || product.interestRate <= parseFloat(maxRate);

      return searchMatch && bankFilterMatch && loanTypeFilterMatch && bankCategoryFilterMatch && minRateFilter && maxRateFilter;
    });
  }, [allBankLoanProducts, searchTerm, selectedBank, selectedLoanType, selectedBankCategory, minRate, maxRate, t]);

  const filteredBanks = useMemo((): Bank[] => {
    if (!searchTerm) {
      return BANKS_DATA;
    }
    const searchLower = searchTerm.toLowerCase();
    return BANKS_DATA.filter(bank =>
      bank.name.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  const handleDownloadCsv = useCallback(() => {
    const filename = t('appName') + '_' + t('dashboard.bankLoanRates.title');
    exportDataToCsv(filteredLoanProducts, filename.replace(/\s+/g, '_'), i18n);
  }, [filteredLoanProducts, t, i18n]);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('dashboard.title')}
          </h1>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
        {DASHBOARD_METRICS.map((metric) => (
          <MetricCard key={metric.labelKey} metric={metric} />
        ))}
      </section>

      <section className="animate-in fade-in-0 slide-in-from-top-12 duration-500 delay-200">
        <KeyRateStats filteredLoanProducts={filteredLoanProducts} allLoanTypes={LOAN_TYPES} />
      </section>
      
      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-top-16 duration-500 delay-300">
        <Card className="shadow-lg lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40 space-y-2 text-center">
              <Image 
                src="https://picsum.photos/seed/activity/200/100" 
                alt="Abstract activity representation"
                width={200}
                height={100}
                className="rounded-md opacity-75"
                data-ai-hint="abstract graph"
              />
              <p className="text-sm text-muted-foreground">{t('dashboard.noRecentActivity')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="animate-in fade-in-0 slide-in-from-top-20 duration-500 delay-400">
        <DashboardControls
            banks={filteredBanks}
            loanTypes={LOAN_TYPES}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedBank={selectedBank}
            onSelectedBankChange={setSelectedBank}
            selectedLoanType={selectedLoanType}
            onSelectedLoanTypeChange={setSelectedLoanType}
            selectedBankCategory={selectedBankCategory}
            onSelectedBankCategoryChange={setSelectedBankCategory}
            minRate={minRate}
            onMinRateChange={setMinRate}
            maxRate={maxRate}
            onMaxRateChange={setMaxRate}
            onDownloadCsv={handleDownloadCsv}
        />
        <BankLoanRatesTable banksLoanProducts={filteredLoanProducts} isLoading={productsLoading} />
      </section>

      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-top-24 duration-500 delay-500">
         <LoanInterestRatesChart />
         <BankRatesComparisonChart filteredLoanProducts={filteredLoanProducts} allLoanTypes={LOAN_TYPES} />
      </section>
    </div>
  );
}

    