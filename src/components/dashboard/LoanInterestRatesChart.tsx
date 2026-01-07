// src/components/dashboard/LoanInterestRatesChart.tsx
"use client";

import type { FC } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LOAN_TYPES } from '@/constants/appConstants';
import { useI18n } from '@/hooks/useI18n';
import { BarChart2 } from 'lucide-react';

export const LoanInterestRatesChart: FC = () => {
  const { t } = useI18n();

  const chartData = LOAN_TYPES.map(loan => ({
    name: t(loan.nameKey),
    interestRate: loan.interestRate,
  }));
  
  const chartConfig = {
    interestRate: {
      label: t('compareLoans.interestRate'), // Using existing key, translated
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            <CardTitle>{t('dashboard.loanInterestRatesChart.title')}</CardTitle>
        </div>
        <CardDescription>{t('dashboard.loanInterestRatesChart.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              accessibilityLayer 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 0, bottom: 70 }} // Adjusted margins for labels
              barCategoryGap="20%"
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
                // Height for XAxis labels is implicitly handled by bottom margin
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[0, (dataMax: number) => Math.ceil(dataMax / 2) * 2 + 2]} // Dynamic domain with padding
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--card))', opacity: 0.5 }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar 
                dataKey="interestRate" 
                fill="var(--color-interestRate)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
