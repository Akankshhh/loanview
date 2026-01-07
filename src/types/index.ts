export type Language =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'hi'
  | 'bn'
  | 'te'
  | 'mr'
  | 'ta'
  | 'ur'
  | 'gu'
  | 'kn'
  | 'or'
  | 'ml'
  | 'pa'
  | 'as'
  | 'sa'
  | 'kok'
  | 'ne'
  | 'sd'
  | 'mai'
  | 'doi'
  | 'ks'
  | 'mni'
  | 'brx'
  | 'sat';

export interface NavItem {
  href: string;
  labelKey: string;
  icon?: React.ElementType;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  preferredLanguage?: string;
}

export interface LoanMetric {
  labelKey: string;
  value: string | number;
  icon?: React.ElementType;
  currency?: string;
  percentage?: boolean;
  textClass?: string; // Optional class for text styling
}

export type LoanTypeId = 'home' | 'personal' | 'education' | 'vehicle' | 'business' | 'gold';

export type RateType = 'fixed' | 'floating';
export type BankCategory = 'Public Sector' | 'Private Sector' | 'Small Finance Bank' | 'Foreign Bank' | 'NBFC';


export interface LoanType {
  id: LoanTypeId;
  nameKey: string;
  icon?: React.ElementType;
  descriptionKey: string;
  interestRate: number; // Default/representative annual percentage
  rateType: RateType;
  minTenure: number; // In months
  maxTenure: number; // In months
  maxAmount: number; // In INR
  typicalProcessingFeeKey?: string; // Translation key for processing fee info
}

export interface DetailedApplicationData {
  id?: string; // Firestore document ID
  userId: string; // ID of the user who owns this application
  personalDetails: {
    fullName: string;
    fatherHusbandName: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    currentAddress: string;
    permanentAddress: string;
    phone: string;
    email: string;
    idNumber: string;
  };
  loanRequirement: {
    purpose: string;
    amount: string;
    repaymentPeriod: string;
    loanType: string;
  };
  employmentIncome?: {
    occupation: string;
    employerName: string;
    monthlyIncome: string;
    additionalIncome: string;
  };
  financialPosition?: {
    assets: string;
    liabilities: string;
    netWorth: string;
  };
  bankDetails?: {
    bankNameBranch: string;
    accountNumber: string;
    accountType: string;
    avgBalance: string;
  };
  creditworthiness?: {
    creditScore: string;
    collateral: string;
    guarantor: string;
  };
  govSchemes?: {
    eligibleSchemes: string;
  };
  verification?: {
    borrowerSignature: string;
    communityVerification: string;
    bankOfficerVerification: string;
  };
  submissionDate: string;
}


export interface BankLoanProduct {
  loanTypeId: LoanTypeId; 
  interestRate: number; // Bank-specific interest rate
  rateType: RateType;
}

export interface Bank {
  id: string;
  name: string; 
  logoUrl?: string; 
  bankCategory: BankCategory;
  applicationUrl: string;
  reason: string;
  loanProducts: BankLoanProduct[];
}

export interface FilteredBankLoanProduct extends BankLoanProduct {
  bankId: string;
  bankName: string;
  bankLogoUrl?: string;
  bankCategory: BankCategory;
  applicationUrl: string;
  reason: string;
  loanTypeNameKey: string;
  loanTypeDescriptionKey: string;
  loanTypeIcon?: React.ElementType;
  minTenure: number;
  maxTenure: number;
  maxAmount: number;
  typicalProcessingFeeKey?: string;
}

export interface KeyRateStat {
    labelKey: string;
    value: string;
    icon?: React.ElementType;
    descriptionKey?: string;
}
