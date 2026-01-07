// src/lib/pdfUtils.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { I18nContextType } from '@/contexts/I18nContext';
import type { LoanDetails } from './loanUtils';
import type { DetailedApplicationData, LoanTypeId } from '@/types';
import { BANKS_DATA, LOAN_TYPES } from '@/lib/data';
import { calculateLoanDetails } from './loanUtils';
import { RobotoRegular } from '@/assets/fonts/Roboto-Regular-normal';

type LoanReportData = (LoanDetails & { loanAmount: number; interestRate: number; loanTenureMonths: number; loanType?: LoanTypeId; }) | null;

const PRIMARY_COLOR = '#008080';
const HEADER_COLOR = '#2F4F4F';
const TEXT_COLOR = '#333333';
const BORDER_COLOR = '#CCCCCC';

// This function will be used as a hook in autoTable to ensure every cell uses the safe font.
const forceCustomFontHook = (data: any) => {
  // Set font for all cells in the table to Roboto. This is critical.
  data.doc.setFont('Roboto', 'normal');
};

const createSampleLoanData = (i18n: I18nContextType): NonNullable<LoanReportData> => {
    const details = calculateLoanDetails(500000, 8.5, 60);
    return {
      loanAmount: 500000,
      interestRate: 8.5,
      loanTenureMonths: 60,
      loanType: 'personal',
      emi: details?.emi || 0,
      principal: 500000,
      totalInterest: details?.totalInterest || 0,
      totalPayment: details?.totalPayment || 0,
    };
};


// A simple, safe number formatter specifically for the PDF to avoid special characters.
const formatPdfNumber = (value: number | string | undefined, currency = false): string => {
    if (value === undefined || value === null || value === '') return 'N/A';
    
    const num = Number(String(value).replace(/[^0-9.-]/g, ''));
    
    if (isNaN(num)) {
        return String(value);
    }
  
    const fixedValue = num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: false
    });
    
    return currency ? `INR ${fixedValue}` : fixedValue;
};


export const generateLoanReportPdf = (i18n: I18nContextType, loanCalculationData: LoanReportData, applicationData: DetailedApplicationData | null) => {
  const { t, formatDate } = i18n;
  
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  
  // --- FONT SETUP ---
  doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  
  // Set Roboto as the universal font for the entire document.
  doc.setFont("Roboto", "normal");

  doc.setProperties({
    title: t('appName') + ' Loan Report'
  });


  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let finalY = 40;

  // --- HELPER FUNCTIONS ---
  const addHeaderFooter = (docInstance: jsPDF) => {
    const pageCount = (docInstance as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      docInstance.setPage(i);
      
      // All text must use the embedded font to avoid garbage values
      docInstance.setFont('Roboto', 'normal');
      docInstance.setFontSize(18);
      docInstance.setTextColor(PRIMARY_COLOR);
      docInstance.text(t('appName'), 15, 20);

      docInstance.setFont('Roboto', 'normal');
      docInstance.setFontSize(10);
      docInstance.setTextColor(150);
      docInstance.text(`${t('pdf.reportGenerated')}: ${formatDate(new Date())}`, pageWidth - 15, 15, { align: 'right' });
      docInstance.text(`${t('pdf.page')} ${i} / ${pageCount}`, pageWidth - 15, 20, { align: 'right' });

      docInstance.setDrawColor(BORDER_COLOR);
      docInstance.line(15, 25, pageWidth - 15, 25);

      docInstance.setFont('Roboto', 'normal');
      docInstance.setFontSize(8);
      docInstance.setTextColor(150);
      const footerText = `${t('footer.copyRight', { year: new Date().getFullYear().toString() })}`;
      docInstance.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  };

  const addSectionTitle = (docInstance: jsPDF, title: string, y: number) => {
    docInstance.setFont('Roboto', 'normal');
    docInstance.setFontSize(14);
    docInstance.setTextColor(HEADER_COLOR);
    docInstance.text(title, 15, y);
    docInstance.setDrawColor(PRIMARY_COLOR);
    docInstance.setLineWidth(0.5);
    docInstance.line(15, y + 2, 65, y + 2); // Shorter line under title
    return y + 10;
  };

  const createTwoColumnTable = (docInstance: jsPDF, data: Record<string, any>, y: number) => {
     (docInstance as any).autoTable({
        startY: y,
        theme: 'plain',
        body: Object.entries(data).map(([key, value]) => [key, value || t('N/A')]),
        styles: { fontSize: 9, cellPadding: 1.5, textColor: TEXT_COLOR, font: 'Roboto', fontStyle: 'normal' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        didParseCell: forceCustomFontHook
    });
    return (docInstance as any).lastAutoTable.finalY;
  }

  // --- LOAN APPLICATION SUMMARY ---
  if (applicationData) {
    finalY = addSectionTitle(doc, t('pdf.applicationSummary.title'), finalY);

    const personalDetails = {
      [t('applicationForm.sections.personalDetails.fullName')]: applicationData.personalDetails.fullName,
      [t('applicationForm.sections.personalDetails.fatherHusbandName')]: applicationData.personalDetails.fatherHusbandName,
      [t('applicationForm.sections.personalDetails.dob')]: applicationData.personalDetails.dob,
      [t('applicationForm.sections.personalDetails.gender')]: applicationData.personalDetails.gender,
      [t('applicationForm.sections.personalDetails.maritalStatus')]: applicationData.personalDetails.maritalStatus,
      [t('applicationForm.sections.personalDetails.phone')]: applicationData.personalDetails.phone,
      [t('applicationForm.sections.personalDetails.email')]: applicationData.personalDetails.email,
      [t('applicationForm.sections.personalDetails.idNumber')]: applicationData.personalDetails.idNumber,
      [t('applicationForm.sections.personalDetails.currentAddress')]: applicationData.personalDetails.currentAddress,
      [t('applicationForm.sections.personalDetails.permanentAddress')]: applicationData.personalDetails.permanentAddress,
    };
    finalY = createTwoColumnTable(doc, personalDetails, finalY);

    const loanRequirements = {
      [t('applicationForm.sections.loanRequirement.purpose')]: applicationData.loanRequirement.purpose,
      [t('applicationForm.sections.loanRequirement.amount')]: formatPdfNumber(applicationData.loanRequirement.amount, true),
      [t('applicationForm.sections.loanRequirement.repaymentPeriod')]: applicationData.loanRequirement.repaymentPeriod,
      [t('applicationForm.sections.loanRequirement.loanType')]: applicationData.loanRequirement.loanType,
    };
    finalY = createTwoColumnTable(doc, loanRequirements, finalY + 5);

    finalY += 10;
  }

  // --- KEY FACTS STATEMENT from Calculation ---
  const loanData = loanCalculationData || createSampleLoanData(i18n);

  if (pageHeight - finalY < 80 && applicationData) {
    doc.addPage();
    finalY = 40;
  }
  finalY = addSectionTitle(doc, t('pdf.keyFacts.title'), finalY);
  
  const keyFactsBody = [
    [t('pdf.loanSummary.loanAmount'), formatPdfNumber(loanData.loanAmount, true)],
    [t('pdf.loanSummary.interestRate'), `${loanData.interestRate.toFixed(2)}%`],
    [t('pdf.loanSummary.tenure'), `${loanData.loanTenureMonths / 12} ${t('pdf.years')}`],
    [t('pdf.loanSummary.monthlyEMI'), formatPdfNumber(loanData.emi, true)],
    [t('pdf.loanSummary.totalInterest'), formatPdfNumber(loanData.totalInterest, true)],
    [t('pdf.loanSummary.totalPayment'), formatPdfNumber(loanData.totalPayment, true)]
  ];

  (doc as any).autoTable({
    startY: finalY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3, textColor: TEXT_COLOR, lineWidth: 0.1, lineColor: BORDER_COLOR, font: 'Roboto', fontStyle: 'normal' },
    headStyles: { fontStyle: 'bold', fillColor: '#F5F5F5', textColor: HEADER_COLOR  },
    body: keyFactsBody,
    columnStyles: { 0: { fontStyle: 'bold' } },
    didParseCell: forceCustomFontHook
  });
  finalY = (doc as any).lastAutoTable.finalY + 15;


  // --- MARKET COMPARISON ---
  const loanTypeId = loanData.loanType || (applicationData?.loanRequirement?.loanType as LoanTypeId) || 'home';
  const loanTypeName = LOAN_TYPES.find(lt => lt.id === loanTypeId)?.nameKey || '';

  if (pageHeight - finalY < 60) {
    doc.addPage();
    finalY = 40;
  }
  finalY = addSectionTitle(doc, t('pdf.marketComparison.title', { loanType: t(loanTypeName) }), finalY);

  const comparisonProducts = BANKS_DATA
      .map(bank => {
        const product = bank.loanProducts.find(p => p.loanTypeId === loanTypeId);
        if (!product) return null;
        const details = calculateLoanDetails(loanData.loanAmount, product.interestRate, loanData.loanTenureMonths);
        return {
          bankName: bank.name,
          interestRate: product.interestRate,
          emi: details?.emi || 0
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.interestRate - b.interestRate);

  (doc as any).autoTable({
    startY: finalY,
    theme: 'striped',
    headStyles: { fillColor: HEADER_COLOR, textColor: 255, fontSize: 10, cellPadding: 2, font: 'Roboto', fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 2, font: 'Roboto', fontStyle: 'normal' },
    head: [[ t('liveMarketAnalysis.bank'), t('liveMarketAnalysis.interestRate'), t('liveMarketAnalysis.estMonthlyEMI')]],
    body: comparisonProducts.map(p => [
      p.bankName,
      `${p.interestRate.toFixed(2)}%`,
      formatPdfNumber(p.emi, true)
    ]),
    didParseCell: forceCustomFontHook
  });
  finalY = (doc as any).lastAutoTable.finalY + 15;


  // --- AMORTIZATION SCHEDULE ---
  if (pageHeight - finalY < 60) {
    doc.addPage();
    finalY = 40;
  }
  finalY = addSectionTitle(doc, t('pdf.paymentPlan.title'), finalY);

  const scheduleBody: (string | number)[][] = [];
  let balance = loanData.loanAmount;
  const monthlyRate = loanData.interestRate / 12 / 100;
  
  const totalMonths = loanData.loanTenureMonths;
  const initialMonthsToShow = Math.min(12, totalMonths);
  const finalMonthsStart = Math.max(initialMonthsToShow + 1, totalMonths - 11);

  for (let i = 1; i <= totalMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = loanData.emi - interestPayment;
    balance -= principalPayment;

    const showRow = totalMonths <= 25 || i <= initialMonthsToShow || i >= finalMonthsStart;

    if (showRow) {
      scheduleBody.push([
          i,
          formatPdfNumber(principalPayment, true),
          formatPdfNumber(interestPayment, true),
          formatPdfNumber(Math.max(0, balance), true),
      ]);
    } else if (i === initialMonthsToShow + 1) {
       scheduleBody.push(['...', '...', '...', '...']);
    }
  }

  (doc as any).autoTable({
    startY: finalY,
    theme: 'grid',
    headStyles: { fillColor: HEADER_COLOR, textColor: 255, fontSize: 10, cellPadding: 2, font: 'Roboto', fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 2, font: 'Roboto', fontStyle: 'normal' },
    head: [[
      t('pdf.paymentPlan.month'),
      t('pdf.paymentPlan.principal'),
      t('pdf.paymentPlan.interest'),
      t('pdf.paymentPlan.balance')
    ]],
    body: scheduleBody,
    didParseCell: forceCustomFontHook,
    didDrawPage: (data: any) => { 
        if (data.pageNumber > 1) {
            finalY = 40;
        }
    }
  });
  finalY = (doc as any).lastAutoTable.finalY;

  // --- DISCLAIMERS AND SUPPORT ---
  if (pageHeight - finalY < 60) { 
    doc.addPage();
    finalY = 40;
  } else {
    finalY += 15;
  }

  // --- NEXT STEPS ---
  finalY = addSectionTitle(doc, t('pdf.nextSteps.title'), finalY);
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_COLOR);
  const nextStepsText = doc.splitTextToSize(`${t('pdf.nextSteps.contactBank')}\n\n${t('pdf.nextSteps.prepareDocuments')}`, pageWidth - 30);
  doc.text(nextStepsText, 15, finalY);
  finalY += nextStepsText.length * 4 + 10;

  finalY = addSectionTitle(doc, t('pdf.disclaimers.title'), finalY);
  doc.setFont('Roboto', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_COLOR);
  const disclaimerText = doc.splitTextToSize(`${t('pdf.disclaimers.discrepancy')}\n\n${t('pdf.disclaimers.fraudWarning')}`, pageWidth - 30);
  doc.text(disclaimerText, 15, finalY);
  finalY += disclaimerText.length * 4 + 10;
  
  if (pageHeight - finalY < 20) {
    doc.addPage();
    finalY = 40;
  }

  doc.setFont('Roboto', 'normal');
  doc.text(t('pdf.support.title'), 15, finalY);
  finalY += 5;
  doc.setFont('Roboto', 'normal');
  doc.text(`${t('pdf.support.helpline')}: 1-800-LOAN-VIEW`, 15, finalY);

  // --- FINALIZATION ---
  addHeaderFooter(doc);

  const filename = `${t('appName')}_Report_${formatDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');
  doc.save(filename);
};
