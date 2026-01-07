// src/app/market-comparison/page.tsx
"use client";

import { useState, useMemo, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { BANKS_DATA, LOAN_TYPES } from '@/constants/appConstants';
import type { FilteredBankLoanProduct } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpDown, BarChart, TrendingUp, Handshake, LayoutList } from 'lucide-react';
import { BankRatesComparisonChart } from '@/components/dashboard/BankRatesComparisonChart';
import { cn } from '@/lib/utils';

type SortKey = 'bankName' | 'loanTypeNameKey' | 'interestRate' | 'maxTenure';

export default function MarketComparisonPage() {
  const i18n = useI18n();
  const { t, formatNumber } = i18n;
  const [activeTab, setActiveTab] = useState("full-comparison");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'interestRate', direction: 'ascending' });

  const allBankLoanProducts = useMemo((): FilteredBankLoanProduct[] => {
    return BANKS_DATA.flatMap(bank => 
      bank.loanProducts.map(product => {
        const loanTypeDetails = LOAN_TYPES.find(lt => lt.id === product.loanTypeId);
        return {
          ...product,
          bankId: bank.id,
          bankName: bank.name,
          bankLogoUrl: bank.logoUrl,
          bankCategory: bank.bankCategory,
          applicationUrl: bank.applicationUrl,
          reason: bank.reason,
          loanTypeNameKey: loanTypeDetails?.nameKey || product.loanTypeId,
          loanTypeDescriptionKey: loanTypeDetails?.descriptionKey || '',
          loanTypeIcon: loanTypeDetails?.icon,
          minTenure: loanTypeDetails?.minTenure || 0,
          maxTenure: loanTypeDetails?.maxTenure || 0,
          maxAmount: loanTypeDetails?.maxAmount || 0,
          typicalProcessingFeeKey: loanTypeDetails?.typicalProcessingFeeKey,
        };
      })
    );
  }, []);
  
  const sortedProducts = useMemo(() => {
    let sortableItems = [...allBankLoanProducts];
    sortableItems.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortConfig.key === 'loanTypeNameKey') {
        aValue = t(a[sortConfig.key]);
        bValue = t(b[sortConfig.key]);
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [allBankLoanProducts, sortConfig, t]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };
  
  const marketStats = useMemo(() => {
    const totalProducts = allBankLoanProducts.length;
    const avgInterestRate = allBankLoanProducts.reduce((acc, p) => acc + p.interestRate, 0) / totalProducts;
    
    const bankOfferingsCount = allBankLoanProducts.reduce((acc, p) => {
      acc[p.bankName] = (acc[p.bankName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bankWithMostOfferings = Object.entries(bankOfferingsCount).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];

    return { totalProducts, avgInterestRate, bankWithMostOfferings };
  }, [allBankLoanProducts]);


  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <BarChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('marketComparison.fullMarketComparison')}
        </h1>
      </div>

       <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-0 slide-in-from-top-8 duration-500 delay-100">
          <Card className="shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('marketComparison.totalProducts')}</CardTitle>
              <LayoutList className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{marketStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Across all partner banks</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('marketComparison.avgInterestRate')}</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatNumber(marketStats.avgInterestRate, { minimumFractionDigits: 2, maximumFractionDigits: 2})}%</div>
              <p className="text-xs text-muted-foreground">Based on current listings</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('marketComparison.bankWithMostOfferings')}</CardTitle>
              <Handshake className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{marketStats.bankWithMostOfferings}</div>
              <p className="text-xs text-muted-foreground">Most active lender</p>
            </CardContent>
          </Card>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="full-comparison">{t('marketComparison.fullMarketComparison')}</TabsTrigger>
          <TabsTrigger value="visual-comparison">{t('dashboard.bankRatesComparisonChart.title')}</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <div className={cn(activeTab !== 'full-comparison' && 'hidden')}>
            <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader>
                <CardTitle>{t('marketComparison.fullMarketComparison')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('marketComparison.description')}</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Button variant="ghost" onClick={() => requestSort('bankName')} className="px-2">{t('dashboard.bankLoanRates.bankName')} {getSortIcon('bankName')}</Button></TableHead>
                      <TableHead><Button variant="ghost" onClick={() => requestSort('loanTypeNameKey')} className="px-2">{t('dashboard.bankLoanRates.loanType')} {getSortIcon('loanTypeNameKey')}</Button></TableHead>
                      <TableHead className="text-right"><Button variant="ghost" onClick={() => requestSort('interestRate')} className="px-2">{t('interestRatesPage.rate')} {getSortIcon('interestRate')}</Button></TableHead>
                      <TableHead className="text-right"><Button variant="ghost" onClick={() => requestSort('maxTenure')} className="px-2">{t('compareLoans.maxTenure')} {getSortIcon('maxTenure')}</Button></TableHead>
                      <TableHead className="text-right">{t('compareLoans.maxAmount')}</TableHead>
                      <TableHead>{t('marketComparison.processingFee')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product, index) => (
                      <TableRow key={`${product.bankId}-${product.loanTypeId}-${index}`}>
                        <TableCell className="font-medium">{product.bankName}</TableCell>
                        <TableCell>{t(product.loanTypeNameKey)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatNumber(product.interestRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</TableCell>
                        <TableCell className="text-right">{product.maxTenure / 12} Yrs</TableCell>
                        <TableCell className="text-right">{formatNumber(product.maxAmount, { style: 'currency', currency: 'INR', notation: 'compact' })}</TableCell>
                        <TableCell className="text-sm">{product.typicalProcessingFeeKey ? t(product.typicalProcessingFeeKey) : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className={cn(activeTab !== 'visual-comparison' && 'hidden')}>
            <BankRatesComparisonChart filteredLoanProducts={allBankLoanProducts} allLoanTypes={LOAN_TYPES} />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
