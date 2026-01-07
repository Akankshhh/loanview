// src/hooks/useAllBankLoanProducts.ts
import { useState, useEffect, useMemo } from 'react';
import { BANKS_DATA, LOAN_TYPES } from '@/lib/data';
import type { FilteredBankLoanProduct } from '@/types';

/**
 * A hook to simulate fetching and processing all bank loan products.
 * Uses a delay to mimic a network request, making the UI feel more realistic.
 */
export function useAllBankLoanProducts() {
  const [products, setProducts] = useState<FilteredBankLoanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processProducts = () => {
      const allProducts = BANKS_DATA.flatMap(bank => 
        bank.loanProducts.map(product => {
          const loanTypeDetails = LOAN_TYPES.find(lt => lt.id === product.loanTypeId);
          return {
            ...product,
            bankId: bank.id,
            bankName: bank.name,
            bankLogoUrl: bank.logoUrl,
            bankCategory: bank.bankCategory,
            applicationUrl: bank.applicationUrl,
            reason: bank.reason,
            loanTypeNameKey: loanTypeDetails?.nameKey || product.loanTypeId,
            loanTypeDescriptionKey: loanTypeDetails?.descriptionKey || '',
            loanTypeIcon: loanTypeDetails?.icon,
            minTenure: loanTypeDetails?.minTenure || 0,
            maxTenure: loanTypeDetails?.maxTenure || 0,
            maxAmount: loanTypeDetails?.maxAmount || 0,
            typicalProcessingFeeKey: loanTypeDetails?.typicalProcessingFeeKey,
          };
        })
      );
      setProducts(allProducts);
      setIsLoading(false);
    };

    // Simulate a network delay for a more realistic loading experience
    const timer = setTimeout(processProducts, 500);

    return () => clearTimeout(timer);
  }, []);

  return { allBankLoanProducts: products, isLoading };
}

    