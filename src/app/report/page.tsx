// src/app/report/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateLoanReportPdf } from '@/lib/pdfUtils';
import type { LoanDetails } from '@/lib/loanUtils';
import type { DetailedApplicationData, LoanTypeId } from '@/types';
import { FileDown, DownloadCloud, AlertTriangle, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

// Define the shape of the data saved in localStorage
type LoanReportData = (LoanDetails & { loanAmount: number; interestRate: number; loanTenureMonths: number; loanType: LoanTypeId; });

export default function ReportPage() {
  const i18n = useI18n();
  const { t } = i18n;
  const [loanData, setLoanData] = useState<LoanReportData | null>(null);
  const [applicationData, setApplicationData] = useState<DetailedApplicationData | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userApplicationsRef = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'users', user.uid, 'loanApplications'), orderBy('submissionDate', 'desc'), limit(1)) : null),
    [user, firestore]
  );
  
  const { data: latestApplication, isLoading: areApplicationsLoading } = useCollection<DetailedApplicationData>(userApplicationsRef);

  useEffect(() => {
    // This effect should only run on the client after hydration
    // as localStorage is a browser-only API.
    try {
      const savedLoanData = localStorage.getItem('loanReportData');
      if (savedLoanData) {
        setLoanData(JSON.parse(savedLoanData));
      }
    } catch (error) {
      console.error("Failed to load loan data from local storage:", error);
      setLoanData(null);
    }
  }, []);

  useEffect(() => {
    // Set application data from Firestore query result
    if (latestApplication && latestApplication.length > 0) {
      setApplicationData(latestApplication[0]);
    } else {
      setApplicationData(null);
    }
  }, [latestApplication]);

  useEffect(() => {
    // Mark data as loaded once both auth and firestore loading are complete
    if (!isUserLoading && !areApplicationsLoading) {
      setIsDataLoaded(true);
    }
  }, [isUserLoading, areApplicationsLoading]);

  const handleDownloadPdf = () => {
    generateLoanReportPdf(i18n, loanData, applicationData);
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <FileDown className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('reportPage.title')}
        </h1>
      </div>

      <Card className="w-full max-w-xl mx-auto shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader>
          <CardTitle>{t('reportPage.generateTitle')}</CardTitle>
          <CardDescription>
            {t('reportPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-12">
          <DownloadCloud className="h-24 w-24 text-primary opacity-75" />
          
          {!isDataLoaded ? (
             <div className="flex items-center gap-2 text-sm text-secondary-foreground p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>{t('pdf.loadingReport')}</p>
            </div>
          ) : (
            <div className="text-center p-4 rounded-lg bg-secondary/70 max-w-md space-y-2">
                {applicationData ? (
                    <p className="text-sm text-secondary-foreground">{t('reportPage.infoText_v3_application')}</p>
                ) : (
                    <p className="text-sm text-secondary-foreground">{t('reportPage.infoText_v3_no_application')}</p>
                )}

                {loanData ? (
                    <p className="text-sm text-secondary-foreground">{t('reportPage.infoText_v1')}</p>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <p>{t('reportPage.infoText_v2')}</p>
                    </div>
                )}
            </div>
          )}

          <Button onClick={handleDownloadPdf} size="lg" className="shadow-md hover:shadow-lg transition-shadow" disabled={!isDataLoaded}>
            <DownloadCloud className="mr-2 h-5 w-5" />
            {loanData || applicationData ? t('reportPage.downloadButton_v1') : t('reportPage.downloadButton_v2')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
