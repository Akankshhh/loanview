// src/lib/data.ts

import type { Language, NavItem, LoanMetric, LoanType, Bank, BankCategory } from '@/types';
import { Home, User, GraduationCap, Car, Landmark, Percent, FileText, GitCompareArrows, HandCoins, FileDown, BadgeIndianRupee, Briefcase, Gem, Building, FileEdit, Calculator, Archive, Sparkles, LogIn, UserCircle, BarChart } from 'lucide-react';

export const APP_NAME_KEY = "appName";

export const SUPPORTED_LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'ur', name: 'اردو' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'অসমীয়া' },
  { code: 'sa', name: 'संस्कृतम्' },
  { code: 'kok', name: 'कोंकणी' },
  { code: 'ne', name: 'नेपाली' },
  { code: 'sd', name: 'سنڌي' },
  { code: 'mai', name: 'मैथिली' },
  { code: 'doi', name: 'डोगरी' },
  { code: 'ks', name: 'کٲشُر' },
  { code: 'mni', name: 'মৈতৈলোন্' },
  { code: 'brx', name: 'बर’' },
  { code: 'sat', name: 'संताली' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.dashboard', icon: Landmark },
  { href: '/apply', labelKey: 'nav.applyLoan', icon: FileText },
  { href: '/market-comparison', labelKey: 'nav.marketComparison', icon: BarChart },
  { href: '/compare', labelKey: 'nav.compareAndCalculate', icon: GitCompareArrows },
  { href: '/ai-advisor', labelKey: 'nav.bankingAdvisor', icon: Sparkles },
  { href: '/report', labelKey: 'nav.downloadReport', icon: FileDown },
  { href: '/profile', labelKey: 'nav.profile', icon: UserCircle },
];

export const DASHBOARD_METRICS: LoanMetric[] = [
  { labelKey: 'dashboard.totalLoans', value: 1250, icon: Building },
  { labelKey: 'dashboard.avgLoanSize', value: 500000, icon: BadgeIndianRupee, currency: 'INR' },
  { labelKey: 'dashboard.approvalRate', value: 75, icon: Percent, percentage: true },
];

export const BANK_CATEGORIES: BankCategory[] = ['Public Sector', 'Private Sector', 'Small Finance Bank', 'Foreign Bank', 'NBFC'];

export const LOAN_TYPES: LoanType[] = [
  { 
    id: 'home', 
    nameKey: 'loanTypes.home.name', 
    icon: Home, 
    descriptionKey: 'loanTypes.home.description',
    interestRate: 8.5, 
    rateType: 'floating',
    minTenure: 60, 
    maxTenure: 360, 
    maxAmount: 7500000,
    typicalProcessingFeeKey: 'loanTypes.home.processingFee'
  },
  { 
    id: 'personal', 
    nameKey: 'loanTypes.personal.name', 
    icon: User, 
    descriptionKey: 'loanTypes.personal.description',
    interestRate: 11.2, 
    rateType: 'fixed',
    minTenure: 12, 
    maxTenure: 60, 
    maxAmount: 1000000,
    typicalProcessingFeeKey: 'loanTypes.personal.processingFee'
  },
  { 
    id: 'education', 
    nameKey: 'loanTypes.education.name', 
    icon: GraduationCap, 
    descriptionKey: 'loanTypes.education.description',
    interestRate: 9.0, 
    rateType: 'fixed',
    minTenure: 24, 
    maxTenure: 180, 
    maxAmount: 4000000,
    typicalProcessingFeeKey: 'loanTypes.education.processingFee'
  },
  { 
    id: 'vehicle', 
    nameKey: 'loanTypes.vehicle.name', 
    icon: Car, 
    descriptionKey: 'loanTypes.vehicle.description',
    interestRate: 9.5, 
    rateType: 'fixed',
    minTenure: 12, 
    maxTenure: 84, 
    maxAmount: 2000000,
    typicalProcessingFeeKey: 'loanTypes.vehicle.processingFee'
  },
  {
    id: 'business',
    nameKey: 'loanTypes.business.name',
    icon: Briefcase,
    descriptionKey: 'loanTypes.business.description',
    interestRate: 12.5,
    rateType: 'floating',
    minTenure: 12,
    maxTenure: 120,
    maxAmount: 10000000, // 1 Crore INR
    typicalProcessingFeeKey: 'loanTypes.business.processingFee'
  },
  {
    id: 'gold',
    nameKey: 'loanTypes.gold.name',
    icon: Gem,
    descriptionKey: 'loanTypes.gold.description',
    interestRate: 7.0,
    rateType: 'fixed',
    minTenure: 6,
    maxTenure: 36,
    maxAmount: 5000000, // 50 Lakh INR
    typicalProcessingFeeKey: 'loanTypes.gold.processingFee'
  }
];

export const BANKS_DATA: Bank[] = [
  {
    id: 'sbi',
    name: 'State Bank of India', 
    logoUrl: 'https://picsum.photos/seed/sbi/40/40',
    bankCategory: 'Public Sector',
    applicationUrl: 'https://sbi.co.in/web/personal-banking/loans',
    reason: 'banks.sbi.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.60, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 11.15, rateType: 'fixed' },
      { loanTypeId: 'vehicle', interestRate: 8.85, rateType: 'fixed' },
      { loanTypeId: 'education', interestRate: 9.20, rateType: 'fixed' },
      { loanTypeId: 'business', interestRate: 12.00, rateType: 'floating' },
      { loanTypeId: 'gold', interestRate: 7.50, rateType: 'fixed' },
    ]
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank', 
    logoUrl: 'https://picsum.photos/seed/hdfc/40/40',
    bankCategory: 'Private Sector',
    applicationUrl: 'https://www.hdfcbank.com/personal/borrow',
    reason: 'banks.hdfc.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.70, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 10.50, rateType: 'fixed' },
      { loanTypeId: 'vehicle', interestRate: 9.40, rateType: 'fixed' },
      { loanTypeId: 'business', interestRate: 11.50, rateType: 'floating' },
      { loanTypeId: 'gold', interestRate: 9.00, rateType: 'fixed' },
    ]
  },
  {
    id: 'icici',
    name: 'ICICI Bank', 
    logoUrl: 'https://picsum.photos/seed/icici/40/40',
    bankCategory: 'Private Sector',
    applicationUrl: 'https://www.icicibank.com/personal-banking/loans',
    reason: 'banks.icici.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.75, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 10.75, rateType: 'fixed' },
      { loanTypeId: 'vehicle', interestRate: 9.00, rateType: 'fixed' },
      { loanTypeId: 'education', interestRate: 9.50, rateType: 'fixed' },
      { loanTypeId: 'business', interestRate: 12.25, rateType: 'floating' },
      { loanTypeId: 'gold', interestRate: 8.00, rateType: 'fixed' },
    ]
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    logoUrl: 'https://picsum.photos/seed/axis/40/40',
    bankCategory: 'Private Sector',
    applicationUrl: 'https://www.axisbank.com/retail/loans',
    reason: 'banks.axis.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.80, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 10.99, rateType: 'fixed' },
      { loanTypeId: 'vehicle', interestRate: 9.20, rateType: 'fixed' },
      { loanTypeId: 'business', interestRate: 11.75, rateType: 'floating' },
    ]
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    logoUrl: 'https://picsum.photos/seed/pnb/40/40',
    bankCategory: 'Public Sector',
    applicationUrl: 'https://www.pnbindia.in/loans-we-offer.html',
    reason: 'banks.pnb.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.50, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 11.80, rateType: 'fixed' },
      { loanTypeId: 'education', interestRate: 8.90, rateType: 'fixed' },
      { loanTypeId: 'business', interestRate: 12.50, rateType: 'floating' },
      { loanTypeId: 'gold', interestRate: 7.75, rateType: 'fixed' },
    ]
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    logoUrl: 'https://picsum.photos/seed/kotak/40/40',
    bankCategory: 'Private Sector',
    applicationUrl: 'https://www.kotak.com/en/personal-banking/loans.html',
    reason: 'banks.kotak.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.70, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 10.99, rateType: 'fixed' },
      { loanTypeId: 'vehicle', interestRate: 9.50, rateType: 'fixed' },
      { loanTypeId: 'business', interestRate: 11.90, rateType: 'floating' },
      { loanTypeId: 'gold', interestRate: 8.25, rateType: 'fixed' },
    ]
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    logoUrl: 'https://picsum.photos/seed/bob/40/40',
    bankCategory: 'Public Sector',
    applicationUrl: 'https://www.bankofbaroda.in/personal-banking/loans',
    reason: 'banks.bob.reason',
    loanProducts: [
      { loanTypeId: 'home', interestRate: 8.40, rateType: 'floating' },
      { loanTypeId: 'personal', interestRate: 11.50, rateType: 'fixed' },
      { loanTypeId: 'vehicle', interestRate: 8.75, rateType: 'fixed' },
      { loanTypeId: 'education', interestRate: 9.15, rateType: 'fixed' },
      { loanTypeId: 'gold', interestRate: 7.85, rateType: 'fixed' },
    ]
  }
];

export const RATE_THRESHOLDS = {
  low: 9.0,  // Rates <= 9.0% are considered low
  medium: 12.0, // Rates > 9.0% and <= 12.0% are medium
  // Rates > 12.0% are high
};
