// src/lib/exportUtils.ts
import type { FilteredBankLoanProduct } from '@/types';
import type { I18nContextType } from '@/contexts/I18nContext';

// Function to convert array of objects to CSV string
function convertToCSV(data: any[], i18n: I18nContextType, headers: Record<string, string>): string {
  if (!data || data.length === 0) {
    return '';
  }
  const { t } = i18n;
  const headerKeys = Object.keys(headers);
  const translatedHeaders = headerKeys.map(key => headers[key]).join(',');
  
  const rows = data.map(row => {
    return headerKeys.map(key => {
      let cell = row[key] === null || row[key] === undefined ? '' : String(row[key]);
      if (key === 'interestRate') cell = `${cell}%`;
      // Escape commas and quotes
      cell = cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
      return cell;
    }).join(',');
  });

  return [translatedHeaders, ...rows].join('\n');
}


export function exportDataToCsv(
  data: FilteredBankLoanProduct[],
  filename: string,
  i18n: I18nContextType
): void {
  const { t, formatNumber } = i18n;

  const csvHeaders = {
    bankName: t('dashboard.bankLoanRates.bankName'),
    loanTypeNameKey: t('dashboard.bankLoanRates.loanType'), // This will be the key, map to translated name below
    interestRate: t('dashboard.bankLoanRates.interestRate'),
    minTenure: t('compareLoans.maxTenure'), // Assuming Max Tenure refers to general tenure info
    maxAmount: t('compareLoans.maxAmount'),
    typicalProcessingFeeKey: t('dashboard.bankLoanRates.tooltip.processingFee').split(':')[0].trim() // "Processing Fee"
  };
  
  const processedData = data.map(item => ({
    bankName: item.bankName,
    loanTypeNameKey: t(item.loanTypeNameKey), // Translate loan type name
    interestRate: formatNumber(item.interestRate, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
    minTenure: `${item.minTenure} - ${item.maxTenure}`, // Combine tenure
    maxAmount: formatNumber(item.maxAmount, {style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    typicalProcessingFeeKey: item.typicalProcessingFeeKey ? t(item.typicalProcessingFeeKey) : t('N/A')
  }));


  const csvString = convertToCSV(processedData, i18n, csvHeaders);
  if (!csvString) return;

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
