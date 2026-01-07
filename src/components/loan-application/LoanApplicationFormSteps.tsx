// src/components/loan-application/ApplicationFormSteps.tsx
"use client";

import type { Control } from "react-hook-form";
import type { DetailedApplicationData } from "@/types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type StepProps = {
  control: Control<DetailedApplicationData>;
  t: Function;
  formData?: DetailedApplicationData;
};

const FormInputField = ({ control, name, labelKey, placeholderKey, t }: { control: Control<DetailedApplicationData>, name: any, labelKey: string, placeholderKey?: string, t: Function }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{t(labelKey)}</FormLabel>
        <FormControl>
          <Input placeholder={placeholderKey ? t(placeholderKey) : ''} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const FormTextareaField = ({ control, name, labelKey, placeholderKey, t, className }: { control: Control<DetailedApplicationData>, name: any, labelKey: string, placeholderKey?: string, t: Function, className?: string }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{t(labelKey)}</FormLabel>
        <FormControl>
          <Textarea placeholder={placeholderKey ? t(placeholderKey) : ''} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);


export function PersonalDetailsStep({ control, t }: StepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInputField control={control} t={t} name="personalDetails.fullName" labelKey="applicationForm.sections.personalDetails.fullName" />
      <FormInputField control={control} t={t} name="personalDetails.fatherHusbandName" labelKey="applicationForm.sections.personalDetails.fatherHusbandName" />
      <FormInputField control={control} t={t} name="personalDetails.dob" labelKey="applicationForm.sections.personalDetails.dob" />
      <FormInputField control={control} t={t} name="personalDetails.gender" labelKey="applicationForm.sections.personalDetails.gender" />
      <FormInputField control={control} t={t} name="personalDetails.maritalStatus" labelKey="applicationForm.sections.personalDetails.maritalStatus" />
      <FormInputField control={control} t={t} name="personalDetails.phone" labelKey="applicationForm.sections.personalDetails.phone" />
      <FormInputField control={control} t={t} name="personalDetails.email" labelKey="applicationForm.sections.personalDetails.email" />
      <FormInputField control={control} t={t} name="personalDetails.idNumber" labelKey="applicationForm.sections.personalDetails.idNumber" />
      <FormTextareaField control={control} t={t} name="personalDetails.currentAddress" labelKey="applicationForm.sections.personalDetails.currentAddress" className="md:col-span-2" />
      <FormTextareaField control={control} t={t} name="personalDetails.permanentAddress" labelKey="applicationForm.sections.personalDetails.permanentAddress" className="md:col-span-2" />
    </div>
  );
}

export function LoanRequirementStep({ control, t }: StepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormTextareaField control={control} t={t} name="loanRequirement.purpose" labelKey="applicationForm.sections.loanRequirement.purpose" className="md:col-span-2" />
       <FormInputField control={control} t={t} name="loanRequirement.amount" labelKey="applicationForm.sections.loanRequirement.amount" />
       <FormInputField control={control} t={t} name="loanRequirement.repaymentPeriod" labelKey="applicationForm.sections.loanRequirement.repaymentPeriod" />
       <FormInputField control={control} t={t} name="loanRequirement.loanType" labelKey="applicationForm.sections.loanRequirement.loanType" />
    </div>
  );
}


const ReviewRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <div className="grid grid-cols-2 gap-2 text-sm py-1 border-b">
    <dt className="font-medium text-muted-foreground">{label}:</dt>
    <dd className="text-foreground text-right">{String(value || 'N/A')}</dd>
  </div>
);

export function ReviewSubmitStep({ t, formData }: StepProps) {
  if (!formData) return <div>{t('loanApplication.reviewSubmitForm.loading')}</div>;

  const allEntries = Object.entries(formData)
    .filter(([key]) => !['submissionDate', 'userId'].includes(key))
    .flatMap(([sectionKey, sectionValue]) => {
      if (typeof sectionValue !== 'object' || sectionValue === null) return [];
      return Object.entries(sectionValue).map(([fieldKey, fieldValue]) => ({
        sectionTitle: t(`applicationForm.sections.${sectionKey}.title`),
        label: t(`applicationForm.sections.${sectionKey}.${fieldKey}`),
        value: fieldValue
      }));
    });
    
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('loanApplication.reviewSubmitForm.reviewDetails')}</h3>
      <div className="space-y-2 p-4 border rounded-md bg-secondary/50 max-h-96 overflow-y-auto">
        {allEntries.map((entry, index) => (
          entry.value ? <ReviewRow key={index} label={entry.label} value={entry.value as string} /> : null
        ))}
      </div>
    </div>
  );
}
