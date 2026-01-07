// src/lib/loanUtils.ts

export interface LoanDetails {
  emi: number;
  principal: number;
  totalInterest: number;
  totalPayment: number;
}


/**
 * Calculates the Equated Monthly Installment (EMI) for a loan.
 * @param principal The principal loan amount.
 * @param annualInterestRate The annual interest rate (e.g., 6.5 for 6.5%).
 * @param tenureInMonths The loan tenure in months.
 * @returns The calculated monthly EMI.
 */
export function calculateEMI(principal: number, annualInterestRate: number, tenureInMonths: number): number {
  if (principal <= 0 || annualInterestRate < 0 || tenureInMonths <= 0) {
    return 0;
  }

  const monthlyInterestRate = annualInterestRate / (12 * 100);

  if (monthlyInterestRate === 0) { // Interest-free loan
    return principal / tenureInMonths;
  }

  const emi =
    (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureInMonths)) /
    (Math.pow(1 + monthlyInterestRate, tenureInMonths) - 1);

  return parseFloat(emi.toFixed(2));
}


/**
 * Calculates detailed loan repayment information.
 * @param principal The principal loan amount.
 * @param annualInterestRate The annual interest rate (e.g., 8.5 for 8.5%).
 * @param tenureInMonths The loan tenure in months.
 * @returns An object containing EMI, principal, total interest, and total payment.
 */
export function calculateLoanDetails(principal: number, annualInterestRate: number, tenureInMonths: number): LoanDetails | null {
  if (principal <= 0 || annualInterestRate < 0 || tenureInMonths <= 0) {
    return null;
  }
  
  const emi = calculateEMI(principal, annualInterestRate, tenureInMonths);
  if (emi === 0) {
    return {
      emi: 0,
      principal: principal,
      totalInterest: 0,
      totalPayment: principal,
    };
  }

  const totalPayment = emi * tenureInMonths;
  const totalInterest = totalPayment - principal;

  return {
    emi: parseFloat(emi.toFixed(2)),
    principal: principal,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
  };
}