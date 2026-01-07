// src/components/dashboard/BankLoanRatesTable.tsx
"use client";

import type { FC } from 'react';
import Image from 'next/image';
import type { FilteredBankLoanProduct } from '@/types';
import { RATE_THRESHOLDS } from '@/constants/appConstants';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Banknote, Info, Loader2 } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface BankLoanRatesTableProps {
  banksLoanProducts: FilteredBankLoanProduct[];
  isLoading: boolean;
}

export const BankLoanRatesTable: FC<BankLoanRatesTableProps> = ({ banksLoanProducts, isLoading }) => {
  const { t, formatNumber } = useI18n();

  const getRateColorClass = (rate: number): string => {
    if (rate <= RATE_THRESHOLDS.low) return "text-accent-foreground"; 
    if (rate <= RATE_THRESHOLDS.medium) return "text-yellow-600 dark:text-yellow-400"; 
    return "text-destructive"; 
  };

  const TableSkeleton = () => (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
          </div>
           <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" /> 
          <CardTitle>{t('dashboard.bankLoanRates.title')}</CardTitle>
        </div>
        <CardDescription>{t('dashboard.bankLoanRates.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : banksLoanProducts.length > 0 ? (
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.bankLoanRates.bankName')}</TableHead>
                  <TableHead>{t('dashboard.bankLoanRates.loanType')}</TableHead>
                  <TableHead className="text-right">{t('dashboard.bankLoanRates.interestRate')}</TableHead>
                  <TableHead className="text-center">Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banksLoanProducts.map((product) => {
                  const LoanIcon = product.loanTypeIcon;
                  const rateColor = getRateColorClass(product.interestRate);

                  return (
                    <TableRow key={`${product.bankId}-${product.loanTypeId}-${product.interestRate}-${product.rateType}`}>
                      <TableCell className="font-medium flex items-center">
                        {product.bankLogoUrl && (
                          <Image 
                            src={product.bankLogoUrl} 
                            alt={`${product.bankName} logo`} 
                            width={24} 
                            height={24} 
                            className="mr-2 rounded-full object-contain"
                            data-ai-hint="bank logo"
                          />
                        )}
                        {!product.bankLogoUrl && <Banknote className="mr-2 h-5 w-5 text-muted-foreground" />}
                        {product.bankName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {LoanIcon && <LoanIcon className="mr-2 h-5 w-5 text-primary" />}
                          {t(product.loanTypeNameKey)}
                        </div>
                      </TableCell>
                      <TableCell className={cn("text-right font-semibold", rateColor)}>
                        {formatNumber(product.interestRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-card text-card-foreground border shadow-lg p-3 rounded-md w-64">
                            <p className="font-semibold text-base">{t(product.loanTypeNameKey)}</p>
                            <p className="text-sm text-muted-foreground">{t(product.loanTypeDescriptionKey)}</p>
                            <hr className="my-2"/>
                             <p className="text-xs">
                              {t('dashboard.bankLoanRates.tooltip.rateType', { type: t(`loanTypes.rateTypes.${product.rateType}`) })}
                            </p>
                            <p className="text-xs">
                              {t('dashboard.bankLoanRates.tooltip.tenure', { min: product.minTenure, max: product.maxTenure })}
                            </p>
                            <p className="text-xs">
                              {t('dashboard.bankLoanRates.tooltip.maxAmount', { amount: formatNumber(product.maxAmount, { style: 'currency', currency: 'INR' })})}
                            </p>
                            {product.typicalProcessingFeeKey && (
                               <p className="text-xs">
                                {t('dashboard.bankLoanRates.tooltip.processingFee', { fee: t(product.typicalProcessingFeeKey) })}
                               </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('dashboard.bankLoanRates.noResults')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};