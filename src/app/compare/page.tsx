
// src/app/compare/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { LOAN_TYPES, BANKS_DATA } from '@/constants/appConstants';
import { calculateLoanDetails } from '@/lib/loanUtils';
import type { LoanTypeId, FilteredBankLoanProduct } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { GitCompareArrows, HandCoins, Tag, Calculator, BarChartHorizontalBig, TrendingUp, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { saveLoanReportData } from '@/lib/reportUtils';
import type { LoanDetails } from '@/lib/loanUtils';

interface AmortizationData {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}


export default function CompareAndCalculatePage() {
  const i18n = useI18n();
  const { t, formatNumber, formatDate } = i18n;
  const currentDate = new Date();

  // State for Comparison section
  const [selectedLoanType, setSelectedLoanType] = useState<LoanTypeId>('home');
  const [comparisonLoanAmount] = useState<number>(1000000); 
  const [comparisonLoanTenure] = useState<number>(240);

  // State for Calculator section
  const [calcLoanAmount, setCalcLoanAmount] = useState<number>(1000000);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(8.5);
  const [calcLoanTenure, setCalcLoanTenure] = useState<number>(20);
  const [calcLoanType, setCalcLoanType] = useState<LoanTypeId>('home');
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationData[]>([]);

  // Memoized calculation for comparison table
  const loanProducts = useMemo((): (FilteredBankLoanProduct & { emi: number })[] => {
    return BANKS_DATA
      .map(bank => {
        const product = bank.loanProducts.find(p => p.loanTypeId === selectedLoanType);
        if (!product) return null;

        const loanTypeDetails = LOAN_TYPES.find(lt => lt.id === selectedLoanType);
        const details = calculateLoanDetails(comparisonLoanAmount, product.interestRate, comparisonLoanTenure);
        
        return {
          ...product,
          bankId: bank.id,
          bankName: bank.name,
          bankCategory: bank.bankCategory,
          bankLogoUrl: bank.logoUrl,
          applicationUrl: bank.applicationUrl,
          reason: bank.reason, // Now a translation key
          loanTypeNameKey: loanTypeDetails?.nameKey || '',
          loanTypeDescriptionKey: loanTypeDetails?.descriptionKey || '',
          loanTypeIcon: loanTypeDetails?.icon,
          minTenure: loanTypeDetails?.minTenure || 0,
          maxTenure: loanTypeDetails?.maxTenure || 0,
          maxAmount: loanTypeDetails?.maxAmount || 0,
          typicalProcessingFeeKey: loanTypeDetails?.typicalProcessingFeeKey || '',
          emi: details?.emi || 0
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.interestRate - b.interestRate);
  }, [selectedLoanType, comparisonLoanAmount, comparisonLoanTenure]);

  const bestOfferBankId = loanProducts.length > 0 ? loanProducts[0].bankId : null;

  // Handler for EMI calculation
  const handleCalculate = () => {
    const tenureInMonths = calcLoanTenure * 12;
    if (calcLoanAmount > 0 && calcInterestRate > 0 && tenureInMonths > 0) {
      const details = calculateLoanDetails(calcLoanAmount, calcInterestRate, tenureInMonths);
      setLoanDetails(details);

      if (details) {
        // Save the complete data required for the report
        saveLoanReportData({
          ...details,
          loanAmount: calcLoanAmount,
          interestRate: calcInterestRate,
          loanTenureMonths: tenureInMonths,
          loanType: calcLoanType
        }, i18n);

        let balance = calcLoanAmount;
        const schedule: AmortizationData[] = [];
        const monthlyRate = calcInterestRate / 12 / 100;
        for (let i = 1; i <= tenureInMonths; i++) {
          const interestPayment = balance * monthlyRate;
          const principalPayment = details.emi - interestPayment;
          balance -= principalPayment;
          schedule.push({
            month: i,
            principal: principalPayment,
            interest: interestPayment,
            totalPayment: details.emi,
            remainingBalance: Math.max(0, balance),
          });
        }
        setAmortizationSchedule(schedule);
      }
    } else {
      setLoanDetails(null);
      setAmortizationSchedule([]);
    }
  };
  
  useEffect(() => {
    handleCalculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <GitCompareArrows className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('nav.compareAndCalculate')}
        </h1>
      </div>
      
      {/* Indicative Interest Rates Section */}
      <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Percent className="h-8 w-8 text-primary" />
             <div>
                <CardTitle>{t('interestRatesPage.title')}</CardTitle>
                <CardDescription>
                  {t('interestRatesPage.updatedOn', { date: formatDate(currentDate, { year: 'numeric', month: 'long', day: 'numeric' }) })}
                </CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('interestRatesPage.loanCategory')}</TableHead>
                <TableHead className="text-right">{t('interestRatesPage.rate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOAN_TYPES.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium flex items-center">
                    {loan.icon && <loan.icon className="mr-2 h-5 w-5 text-primary" />}
                    {t(loan.nameKey)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(loan.interestRate)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption>{t('interestRatesPage.updatedOn', { date: formatDate(currentDate) })}</TableCaption>
          </Table>
        </CardContent>
      </Card>
      
      {/* Market Comparison Section */}
      <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
             <HandCoins className="h-8 w-8 text-primary" />
             <div>
                <CardTitle>{t('liveMarketAnalysis.title')}</CardTitle>
                <CardDescription>{t('liveMarketAnalysis.description')}</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
              value={selectedLoanType}
              onValueChange={(value) => setSelectedLoanType(value as LoanTypeId)}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder={t('dashboard.bankLoanRates.filters.selectLoanType')} />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPES.map(loanType => (
                  <SelectItem key={loanType.id} value={loanType.id}>
                    {t(loanType.nameKey)}
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">{t('liveMarketAnalysis.bank')}</TableHead>
                <TableHead className="w-[15%] text-center">{t('liveMarketAnalysis.interestRate')}</TableHead>
                <TableHead className="w-[15%] text-center">{t('liveMarketAnalysis.estMonthlyEMI')}</TableHead>
                <TableHead className="w-[35%]">{t('liveMarketAnalysis.whyChooseThis')}</TableHead>
                <TableHead className="w-[15%] text-center">{t('liveMarketAnalysis.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanProducts.map((product) => (
                <TableRow key={product.bankId} className={cn(bestOfferBankId === product.bankId && 'bg-accent/50')}>
                  <TableCell className="font-semibold">{product.bankName}</TableCell>
                  <TableCell className="text-center font-medium">
                      <div className={cn("flex items-center justify-center gap-2", bestOfferBankId === product.bankId && "text-primary font-bold")}>
                        {bestOfferBankId === product.bankId && <Tag className="h-4 w-4" />}
                        {formatNumber(product.interestRate, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </div>
                  </TableCell>
                  <TableCell className="text-center">{formatNumber(product.emi, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t(product.reason)}</TableCell>
                  <TableCell className="text-center">
                    <Button asChild size="sm">
                      <a href={product.applicationUrl} target="_blank" rel="noopener noreferrer">{t('liveMarketAnalysis.applyNow')}</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* EMI Calculator Section */}
      <div className="space-y-8 mt-12">
          <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calculator className="h-8 w-8 text-primary" />
                    <CardTitle>{t('emiCalculator.calculatorTitle')}</CardTitle>
                </div>
                <CardDescription>{t('emiCalculator.calculatorDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="calc-loan-type">{t('dashboard.bankLoanRates.filters.selectLoanType')}</Label>
                 <Select value={calcLoanType} onValueChange={(v) => setCalcLoanType(v as LoanTypeId)}>
                    <SelectTrigger id="calc-loan-type">
                      <SelectValue placeholder={t('dashboard.bankLoanRates.filters.allLoanTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map(loanType => (
                        <SelectItem key={loanType.id} value={loanType.id}>{t(loanType.nameKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
              <div className="space-y-2">
                <div className='flex justify-between'>
                    <Label htmlFor="loanAmount">{t('compareLoans.loanAmount')}</Label>
                    <span className="text-primary font-semibold">{formatNumber(calcLoanAmount, { style: 'currency', currency: 'INR' })}</span>
                </div>
                <Slider
                  id="loanAmount"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={[calcLoanAmount]}
                  onValueChange={(value) => setCalcLoanAmount(value[0])}
                />
              </div>
               <div className="space-y-2">
                 <div className='flex justify-between'>
                    <Label htmlFor="interestRate">{t('compareLoans.interestRate')} (%)</Label>
                    <span className="text-primary font-semibold">{formatNumber(calcInterestRate, { minimumFractionDigits: 2 })}%</span>
                </div>
                 <Slider
                  id="interestRate"
                  min={5}
                  max={15}
                  step={0.05}
                  value={[calcInterestRate]}
                  onValueChange={(value) => setCalcInterestRate(value[0])}
                />
              </div>
               <div className="space-y-2">
                 <div className='flex justify-between'>
                    <Label htmlFor="loanTenure">{t('emiCalculator.tenureInYears')}</Label>
                    <span className="text-primary font-semibold">{calcLoanTenure} {t('pdf.years')}</span>
                </div>
                 <Slider
                  id="loanTenure"
                  min={1}
                  max={30}
                  step={1}
                  value={[calcLoanTenure]}
                  onValueChange={(value) => setCalcLoanTenure(value[0])}
                />
              </div>
              <div className="flex justify-center">
                <Button onClick={handleCalculate} size="lg">
                  <BarChartHorizontalBig className="mr-2 h-5 w-5" />
                  {t('compareLoans.calculateEMIButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {loanDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-50 duration-500">
                <Card className="shadow-lg lg:col-span-1 transition-all duration-300 hover:shadow-xl">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <CardTitle>{t('compareLoans.emiDetails')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="text-center p-4 bg-primary/10 rounded-lg">
                            <p className="text-sm text-primary font-medium">{t('compareLoans.monthlyEMI')}</p>
                            <p className="text-3xl font-bold text-primary">
                                {formatNumber(loanDetails.emi, { style: 'currency', currency: 'INR' })}
                            </p>
                        </div>
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between p-2 rounded-md hover:bg-muted/50">
                                <span className="text-muted-foreground">{t('compareLoans.principalAmount')}</span>
                                <span className="font-medium text-foreground">{formatNumber(loanDetails.principal, { style: 'currency', currency: 'INR' })}</span>
                            </div>
                             <div className="flex justify-between p-2 rounded-md hover:bg-muted/50">
                                <span className="text-muted-foreground">{t('compareLoans.totalInterest')}</span>
                                <span className="font-medium text-foreground">{formatNumber(loanDetails.totalInterest, { style: 'currency', currency: 'INR' })}</span>
                            </div>
                             <div className="flex justify-between p-2 rounded-md hover:bg-muted/50 text-base font-semibold">
                                <span className="text-foreground">{t('compareLoans.totalPayment')}</span>
                                <span className="text-primary">{formatNumber(loanDetails.totalPayment, { style: 'currency', currency: 'INR' })}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg lg:col-span-2 transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>{t('pdf.paymentPlan.title')}</CardTitle>
                    <CardDescription>{t('emiCalculator.amortizationDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                       <Table>
                          <TableHeader className="sticky top-0 bg-card">
                              <TableRow>
                                  <TableHead>#</TableHead>
                                  <TableHead className="text-right">{t('pdf.loanSummary.principalAmount')}</TableHead>
                                  <TableHead className="text-right">{t('compareLoans.totalInterest')}</TableHead>
                                  <TableHead className="text-right">{t('pdf.paymentPlan.balance')}</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {amortizationSchedule.map(row => (
                                  <TableRow key={row.month}>
                                      <TableCell>{row.month}</TableCell>
                                      <TableCell className="text-right">{formatNumber(row.principal, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</TableCell>
                                      <TableCell className="text-right">{formatNumber(row.interest, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</TableCell>
                                      <TableCell className="text-right">{formatNumber(row.remainingBalance, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
                </Card>
            </div>
          )}
      </div>
    </div>
  );
}
