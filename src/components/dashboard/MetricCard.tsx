// src/components/dashboard/MetricCard.tsx
"use client";

import type { LoanMetric } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: LoanMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const { t, formatNumber } = useI18n();
  const { labelKey, value, icon: Icon, currency, percentage } = metric;

  const displayValue = typeof value === 'number' 
    ? formatNumber(value, currency ? { style: 'currency', currency: currency } : {})
    : value;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t(labelKey)}
        </CardTitle>
        {Icon && <Icon className="h-5 w-5 text-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {percentage ? `${displayValue}%` : displayValue}
        </div>
      </CardContent>
    </Card>
  );
}
