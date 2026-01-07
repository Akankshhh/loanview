// src/lib/form-validation.ts
import * as z from 'zod';

export const getValidationSchema = (stepIndex: number, t: Function) => {
  const requiredMsg = t('formValidation.required');
  const emailMsg = t('formValidation.invalidEmail');
  
  const schemas = [
    // Step 0: Personal Details
    z.object({
      personalDetails: z.object({
        fullName: z.string().min(1, requiredMsg),
        fatherHusbandName: z.string().optional(),
        dob: z.string().min(1, requiredMsg),
        gender: z.string().min(1, requiredMsg),
        maritalStatus: z.string().min(1, requiredMsg),
        currentAddress: z.string().min(1, requiredMsg),
        permanentAddress: z.string().optional(),
        phone: z.string().min(10, requiredMsg),
        email: z.string().email(emailMsg).min(1, requiredMsg),
        idNumber: z.string().min(1, requiredMsg),
      }),
    }),
    // Step 1: Loan Requirement
    z.object({
        loanRequirement: z.object({
            purpose: z.string().min(1, requiredMsg),
            amount: z.string().min(1, requiredMsg),
            repaymentPeriod: z.string().min(1, requiredMsg),
            loanType: z.string().min(1, requiredMsg),
        })
    }),
  ];

  if (stepIndex >= 0 && stepIndex < schemas.length) {
    return schemas[stepIndex];
  }

  // For review step, merge all schemas
  return schemas.reduce((acc, schema) => acc.merge(schema), z.object({}));
};
