// src/components/dashboard/BankRatesComparisonChart.tsx
"use client";

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FilteredBankLoanProduct, LoanTypeId } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { BarChart3 } from 'lucide-react';
import { LOAN_TYPES } from '@/lib/data';

interface BankRatesComparisonChartProps {
  filteredLoanProducts: FilteredBankLoanProduct[];
}

export const BankRatesComparisonChart: FC<BankRatesComparisonChartProps> = ({ filteredLoanProducts }) => {
  const { t, formatNumber } = useI18n();
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState<LoanTypeId | 'all'>('home');

  const availableLoanTypesInProducts = useMemo(() => {
    const uniqueLoanTypeIds = new Set(filteredLoanProducts.map(p => p.loanTypeId));
    return LOAN_TYPES.filter(lt => uniqueLoanTypeIds.has(lt.id));
  }, [filteredLoanProducts]);

  const chartData = useMemo(() => {
    let typeId = selectedLoanTypeId;
    if (typeId === 'all' || !availableLoanTypesInProducts.find(lt => lt.id === typeId)) {
        if (availableLoanTypesInProducts.length > 0) {
            typeId = availableLoanTypesInProducts[0].id;
            // Update state asynchronously to avoid issues during render
            setTimeout(() => setSelectedLoanTypeId(typeId as LoanTypeId), 0);
        } else {
            return [];
        }
    }
    
    return filteredLoanProducts
      .filter(product => product.loanTypeId === typeId)
      .map(product => ({
        bankName: product.bankName,
        interestRate: product.interestRate,
      }))
      .sort((a,b) => a.interestRate - b.interestRate); // Sort by interest rate
  }, [filteredLoanProducts, selectedLoanTypeId, availableLoanTypesInProducts]);

  const chartConfig = {
    interestRate: {
      label: t('compareLoans.interestRate'),
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <CardTitle>{t('dashboard.bankRatesComparisonChart.title')}</CardTitle>
        </div>
        <CardDescription>{t('dashboard.bankRatesComparisonChart.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedLoanTypeId}
          onValueChange={(value) => setSelectedLoanTypeId(value as LoanTypeId | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder={t('dashboard.bankRatesComparisonChart.selectLoanTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {availableLoanTypesInProducts.map(loanType => (
              <SelectItem key={loanType.id} value={loanType.id}>
                {t(loanType.nameKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300 + Math.max(0, chartData.length - 5) * 20}> {/* Dynamic height */}
              <BarChart 
                layout="vertical" // For better readability of bank names
                accessibilityLayer 
                data={chartData} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  dataKey="bankName"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120} // Adjust as needed for bank names
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  content={<ChartTooltipContent 
                              formatter={(value, name, props) => {
                                if (name === 'interestRate' && typeof value === 'number') {
                                  return `${formatNumber(value, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`;
                                }
                                return value;
                              }}
                              indicator="dot" 
                          />}
                />
                <Bar 
                  dataKey="interestRate" 
                  fill="var(--color-interestRate)" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
           selectedLoanTypeId !== 'all' && <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.bankRatesComparisonChart.noData')}</p>
        )}
      </CardContent>
    </Card>
  );
};
