// src/components/dashboard/KeyRateStats.tsx
"use client";

import type { FC } from 'react';
import type { FilteredBankLoanProduct, KeyRateStat, LoanType as LoanTypeInterface } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Percent, BarChartHorizontalBig, Banknote } from 'lucide-react'; // Added BarChartHorizontalBig, Banknote

interface KeyRateStatsProps {
  filteredLoanProducts: FilteredBankLoanProduct[];
  allLoanTypes: LoanTypeInterface[];
}

const StatCard: FC<{ stat: KeyRateStat }> = ({ stat }) => {
  const { t } = useI18n();
  const Icon = stat.icon;
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card/50 dark:bg-card/70">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t(stat.labelKey)}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-foreground">{stat.value}</div>
        {stat.descriptionKey && <p className="text-xs text-muted-foreground">{t(stat.descriptionKey)}</p>}
      </CardContent>
    </Card>
  );
};

export const KeyRateStats: FC<KeyRateStatsProps> = ({ filteredLoanProducts, allLoanTypes }) => {
  const { t, formatNumber } = useI18n();

  if (!filteredLoanProducts || filteredLoanProducts.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>{t('dashboard.keyRateStatistics.title')}</CardTitle>
          <CardDescription>{t('dashboard.keyRateStatistics.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dashboard.keyRateStatistics.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  const rates = filteredLoanProducts.map(p => p.interestRate);
  const averageRate = rates.reduce((acc, rate) => acc + rate, 0) / rates.length;
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);

  const loanTypeStats: { [key: string]: { sum: number; count: number; nameKey: string } } = {};
  filteredLoanProducts.forEach(product => {
    if (!loanTypeStats[product.loanTypeId]) {
      loanTypeStats[product.loanTypeId] = { sum: 0, count: 0, nameKey: product.loanTypeNameKey };
    }
    loanTypeStats[product.loanTypeId].sum += product.interestRate;
    loanTypeStats[product.loanTypeId].count += 1;
  });

  let lowestAvgRateLoanType: { name: string; rate: number } | null = null;
  let highestAvgRateLoanType: { name: string; rate: number } | null = null;

  Object.entries(loanTypeStats).forEach(([_, stat]) => {
    const avg = stat.sum / stat.count;
    const translatedName = t(stat.nameKey);
    if (!lowestAvgRateLoanType || avg < lowestAvgRateLoanType.rate) {
      lowestAvgRateLoanType = { name: translatedName, rate: avg };
    }
    if (!highestAvgRateLoanType || avg > highestAvgRateLoanType.rate) {
      highestAvgRateLoanType = { name: translatedName, rate: avg };
    }
  });
  
  const stats: KeyRateStat[] = [
    {
      labelKey: 'dashboard.keyRateStatistics.overallMinRate',
      value: `${formatNumber(minRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
      icon: TrendingDown,
    },
    {
      labelKey: 'dashboard.keyRateStatistics.overallAvgRate',
      value: `${formatNumber(averageRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
      icon: Percent,
    },
    {
      labelKey: 'dashboard.keyRateStatistics.overallMaxRate',
      value: `${formatNumber(maxRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
      icon: TrendingUp,
    },
  ];

  if (lowestAvgRateLoanType) {
    stats.push({
      labelKey: 'dashboard.keyRateStatistics.lowestAvgRateLoanType',
      value: `${lowestAvgRateLoanType.name} (${formatNumber(lowestAvgRateLoanType.rate, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%)`,
      icon: BarChartHorizontalBig,
      descriptionKey: 'dashboard.keyRateStatistics.avgRateSuffix'
    });
  }
   if (highestAvgRateLoanType && highestAvgRateLoanType.name !== lowestAvgRateLoanType?.name) { // Avoid duplicate if only one loan type
    stats.push({
      labelKey: 'dashboard.keyRateStatistics.highestAvgRateLoanType',
      value: `${highestAvgRateLoanType.name} (${formatNumber(highestAvgRateLoanType.rate, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%)`,
      icon: Banknote,
      descriptionKey: 'dashboard.keyRateStatistics.avgRateSuffix'
    });
  }


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>{t('dashboard.keyRateStatistics.title')}</CardTitle>
        <CardDescription>{t('dashboard.keyRateStatistics.description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(stat => (
          <StatCard key={stat.labelKey} stat={stat} />
        ))}
      </CardContent>
    </Card>
  );
};
