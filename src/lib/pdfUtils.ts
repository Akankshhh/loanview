// src/lib/pdfUtils.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { I18nContextType } from '@/contexts/I18nContext';
import type { LoanDetails } from './loanUtils';
import type { DetailedApplicationData, LoanTypeId } from '@/types';
import { BANKS_DATA, LOAN_TYPES } from '@/constants/appConstants';
import { calculateLoanDetails } from './loanUtils';

type LoanReportData = (LoanDetails & { loanAmount: number; interestRate: number; loanTenureMonths: number; loanType?: LoanTypeId; }) | null;

const PRIMARY_COLOR = '#008080';
const HEADER_COLOR = '#2F4F4F';
const TEXT_COLOR = '#333333';
const BORDER_COLOR = '#CCCCCC';

// This function will be used as a hook in autoTable to ensure every cell uses the safe font.
const forceHelveticaFontHook = (data: any) => {
  // Set font for all cells in the table to Helvetica. This is critical.
  data.doc.setFont('Helvetica', data.cell.styles.fontStyle);
};

const createSampleLoanData = (): NonNullable<LoanReportData> => ({
  loanAmount: 500000,
  interestRate: 8.5,
  loanTenureMonths: 60,
  loanType: 'personal',
  emi: 10258,
  principal: 500000,
  totalInterest: 115480,
  totalPayment: 615480,
});

export const generateLoanReportPdf = (i18n: I18nContextType, loanCalculationData: LoanReportData, applicationData: DetailedApplicationData | null) => {
  const { t, formatNumber, formatDate } = i18n;
  
  // Reset the document for fresh generation
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  doc.setProperties({
    title: t('appName') + ' Loan Report'
  });

  // Set the universal font that is guaranteed to work.
  doc.setFont('Helvetica');

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let finalY = 40;

  // --- HELPER FUNCTIONS ---
  const addHeaderFooter = () => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // All text must use Helvetica to avoid garbage values
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(PRIMARY_COLOR);
      doc.text(t('appName'), 15, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`${t('pdf.reportGenerated')}: ${formatDate(new Date())}`, pageWidth - 15, 15, { align: 'right' });
      doc.text(`${t('pdf.page')} ${i} / ${pageCount}`, pageWidth - 15, 20, { align: 'right' });

      doc.setDrawColor(BORDER_COLOR);
      doc.line(15, 25, pageWidth - 15, 25);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150);
      const footerText = `${t('footer.copyRight', { year: new Date().getFullYear().toString() })}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  };

  const addSectionTitle = (title: string, y: number) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(HEADER_COLOR);
    doc.text(title, 15, y);
    doc.setDrawColor(PRIMARY_COLOR);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, 65, y + 2); // Shorter line under title
    return y + 10;
  };

  const createTwoColumnTable = (data: Record<string, any>, y: number) => {
     (doc as any).autoTable({
        startY: y,
        theme: 'plain',
        body: Object.entries(data).map(([key, value]) => [key, value || t('N/A')]),
        styles: { fontSize: 9, cellPadding: 1.5, textColor: TEXT_COLOR, font: 'Helvetica' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        didParseCell: forceHelveticaFontHook // Apply font hook here
    });
    return (doc as any).lastAutoTable.finalY;
  }

  // --- LOAN APPLICATION SUMMARY ---
  if (applicationData) {
    finalY = addSectionTitle(t('pdf.applicationSummary.title'), finalY);

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
    finalY = createTwoColumnTable(personalDetails, finalY);

    const loanRequirements = {
      [t('applicationForm.sections.loanRequirement.purpose')]: applicationData.loanRequirement.purpose,
      [t('applicationForm.sections.loanRequirement.amount')]: applicationData.loanRequirement.amount,
      [t('applicationForm.sections.loanRequirement.repaymentPeriod')]: applicationData.loanRequirement.repaymentPeriod,
      [t('applicationForm.sections.loanRequirement.loanType')]: applicationData.loanRequirement.loanType,
    };
    finalY = createTwoColumnTable(loanRequirements, finalY + 5);

    finalY += 10;
  }

  // --- KEY FACTS STATEMENT from Calculation ---
  const loanData = loanCalculationData || createSampleLoanData();

  if (pageHeight - finalY < 80 && applicationData) {
    doc.addPage();
    finalY = 40;
  }
  finalY = addSectionTitle(t('pdf.keyFacts.title'), finalY);
  
  const keyFactsBody = [
    [t('pdf.loanSummary.loanAmount'), formatNumber(loanData.loanAmount, { style: 'currency', currency: 'INR' })],
    [t('pdf.loanSummary.interestRate'), `${formatNumber(loanData.interestRate, { minimumFractionDigits: 2 })}%`],
    [t('pdf.loanSummary.tenure'), `${loanData.loanTenureMonths / 12} ${t('pdf.years')}`],
    [t('pdf.loanSummary.monthlyEMI'), formatNumber(loanData.emi, { style: 'currency', currency: 'INR' })],
    [t('pdf.loanSummary.totalInterest'), formatNumber(loanData.totalInterest, { style: 'currency', currency: 'INR' })],
    [t('pdf.loanSummary.totalPayment'), formatNumber(loanData.totalPayment, { style: 'currency', currency: 'INR' })]
  ];

  (doc as any).autoTable({
    startY: finalY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3, textColor: TEXT_COLOR, lineWidth: 0.1, lineColor: BORDER_COLOR, font: 'Helvetica' },
    headStyles: { fontStyle: 'bold', fillColor: '#F5F5F5', textColor: HEADER_COLOR  },
    body: keyFactsBody,
    columnStyles: { 0: { fontStyle: 'bold' } },
    didParseCell: forceHelveticaFontHook // Apply font hook here
  });
  finalY = (doc as any).lastAutoTable.finalY + 15;


  // --- MARKET COMPARISON ---
  const loanTypeId = loanData.loanType || (applicationData?.loanRequirement?.loanType as LoanTypeId) || 'home';
  const loanTypeName = LOAN_TYPES.find(lt => lt.id === loanTypeId)?.nameKey || '';

  if (pageHeight - finalY < 60) {
    doc.addPage();
    finalY = 40;
  }
  finalY = addSectionTitle(t('pdf.marketComparison.title', { loanType: t(loanTypeName) }), finalY);

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
    headStyles: { fillColor: HEADER_COLOR, textColor: 255, fontSize: 10, cellPadding: 2, font: 'Helvetica', fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 2, font: 'Helvetica' },
    head: [[ t('liveMarketAnalysis.bank'), t('liveMarketAnalysis.interestRate'), t('liveMarketAnalysis.estMonthlyEMI')]],
    body: comparisonProducts.map(p => [
      p.bankName,
      `${formatNumber(p.interestRate, { minimumFractionDigits: 2 })}%`,
      formatNumber(p.emi, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
    ]),
    didParseCell: forceHelveticaFontHook // Apply font hook here
  });
  finalY = (doc as any).lastAutoTable.finalY + 15;


  // --- AMORTIZATION SCHEDULE ---
  if (pageHeight - finalY < 60) {
    doc.addPage();
    finalY = 40;
  }
  finalY = addSectionTitle(t('pdf.paymentPlan.title'), finalY);

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
          formatNumber(principalPayment, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }),
          formatNumber(interestPayment, { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }),
          formatNumber(Math.max(0, balance), { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }),
      ]);
    } else if (i === initialMonthsToShow + 1) {
       scheduleBody.push(['...', '...', '...', '...']);
    }
  }

  (doc as any).autoTable({
    startY: finalY,
    theme: 'grid',
    headStyles: { fillColor: HEADER_COLOR, textColor: 255, fontSize: 10, cellPadding: 2, font: 'Helvetica', fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, cellPadding: 2, font: 'Helvetica' },
    head: [[
      t('pdf.paymentPlan.month'),
      t('pdf.paymentPlan.principal'),
      t('pdf.paymentPlan.interest'),
      t('pdf.paymentPlan.balance')
    ]],
    body: scheduleBody,
    didParseCell: forceHelveticaFontHook, // Apply font hook here
    didDrawPage: (data: any) => { 
        if (data.pageNumber > 1) {
            finalY = 40;
        }
    }
  });

  // --- DISCLAIMERS AND SUPPORT ---
  finalY = (doc as any).lastAutoTable.finalY;
  if (pageHeight - finalY < 60) { 
    doc.addPage();
    finalY = 40;
  } else {
    finalY += 15;
  }

  // --- NEXT STEPS ---
  finalY = addSectionTitle(t('pdf.nextSteps.title'), finalY);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_COLOR);
  const nextStepsText = doc.splitTextToSize(`${t('pdf.nextSteps.contactBank')}\n\n${t('pdf.nextSteps.prepareDocuments')}`, pageWidth - 30);
  doc.text(nextStepsText, 15, finalY);
  finalY += nextStepsText.length * 4 + 10;

  finalY = addSectionTitle(t('pdf.disclaimers.title'), finalY);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_COLOR);
  const disclaimerText = doc.splitTextToSize(`${t('pdf.disclaimers.discrepancy')}\n\n${t('pdf.disclaimers.fraudWarning')}`, pageWidth - 30);
  doc.text(disclaimerText, 15, finalY);
  finalY += disclaimerText.length * 4 + 10;

  doc.setFont('Helvetica', 'bold');
  doc.text(t('pdf.support.title'), 15, finalY);
  finalY += 5;
  doc.setFont('Helvetica', 'normal');
  doc.text(`${t('pdf.support.helpline')}: 1-800-LOAN-VIEW`, 15, finalY);

  // --- FINALIZATION ---
  addHeaderFooter();

  const filename = `${t('appName')}_Report_${formatDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');
  doc.save(filename);
};
