// src/app/apply/page.tsx
"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PersonalDetailsStep, 
  LoanRequirementStep, 
  ReviewSubmitStep 
} from '@/components/loan-application/LoanApplicationFormSteps';
import { getValidationSchema } from '@/lib/form-validation';
import type { DetailedApplicationData } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileText, Loader2, FileSearch, Trash2, Archive } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addLoanApplication } from '@/firebase/firestore/data-service';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';


// --- Components for "My Applications" Tab ---

const DetailRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <div className="grid grid-cols-2 gap-2 text-sm py-1">
    <dt className="font-medium text-muted-foreground">{label}:</dt>
    <dd className="text-foreground">{value || 'N/A'}</dd>
  </div>
);

const ApplicationDetails = ({ application }: { application: DetailedApplicationData }) => {
  const { t } = useI18n();
  const allSections = Object.entries(application).filter(([key]) => !['submissionDate', 'id', 'userId'].includes(key));

  return (
    <Accordion type="single" collapsible className="w-full">
      {allSections.map(([sectionKey, sectionValue]) => {
        if (typeof sectionValue !== 'object' || sectionValue === null) return null;
        const fields = Object.entries(sectionValue);
        if (fields.length === 0) return null;

        const sectionTitleKey = `applicationForm.sections.${sectionKey}.title`;
        const sectionTitle = t(sectionTitleKey);
        if (sectionTitle === sectionTitleKey) return null; // Don't render if translation is missing

        return (
          <AccordionItem value={sectionKey} key={sectionKey}>
            <AccordionTrigger>{sectionTitle}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 p-4 bg-secondary/50 rounded-md">
                {fields.map(([fieldKey, fieldValue]) => {
                  const fieldLabelKey = `applicationForm.sections.${sectionKey}.${fieldKey}`;
                   const fieldLabel = t(fieldLabelKey);
                   if(fieldLabel === fieldLabelKey) return null;
                   
                  return (
                    <DetailRow
                      key={fieldKey}
                      label={fieldLabel}
                      value={String(fieldValue)}
                    />
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

const MyApplicationsView = () => {
    const { t, formatDate } = useI18n();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userApplicationsRef = useMemoFirebase(
        () => (user && firestore ? collection(firestore, 'users', user.uid, 'loanApplications') : null),
        [user, firestore]
    );

    const { data: applications, isLoading: areApplicationsLoading } = useCollection<DetailedApplicationData>(userApplicationsRef);

    const handleDelete = (applicationId: string) => {
        if (!user || !firestore || !applicationId) return;
        if (window.confirm(t('viewApplications.confirmDelete'))) {
            const docRef = doc(firestore, 'users', user.uid, 'loanApplications', applicationId);
            deleteDoc(docRef)
                .then(() => {
                    toast({ title: t('viewApplications.deleteSuccess') });
                })
                .catch((serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: docRef.path,
                        operation: 'delete',
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    // Don't show a toast here, let the global listener handle it
                });
        }
    };

    const isLoading = isUserLoading || areApplicationsLoading;
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {t('nav.viewApplications')}
            </h2>
             <Separator />
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : applications && applications.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-1">
                {applications.map((app) => {
                  const submissionDate = app.submissionDate && !isNaN(new Date(app.submissionDate).getTime()) 
                                            ? new Date(app.submissionDate) 
                                            : null;
                  return (
                    <Card key={app.id} className="shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <CardHeader>
                          <CardTitle>{app.personalDetails.fullName || `Application ${app.id}`}</CardTitle>
                          <CardDescription>
                          {t('viewApplications.purpose')}: {app.loanRequirement?.purpose || 'N/A'} | {t('viewApplications.submittedOn')}: {submissionDate ? formatDate(submissionDate) : 'N/A'}
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <ApplicationDetails application={app} />
                      </CardContent>
                      <CardFooter className="flex justify-end border-t pt-4">
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(app.id!)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('viewApplications.delete')}
                          </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
                </div>
            ) : (
                 <Card className="shadow-lg">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <Archive className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">{t('viewApplications.noApplicationsTitle')}</h3>
                        <p className="text-muted-foreground mt-2">{t('viewApplications.noApplicationsDesc')}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};


// --- Main Page Component ---

const stepsConfig = [
  { id: 'personalDetails', labelKey: 'applicationForm.sections.personalDetails.title', component: PersonalDetailsStep },
  { id: 'loanRequirement', labelKey: 'applicationForm.sections.loanRequirement.title', component: LoanRequirementStep },
  { id: 'reviewSubmit', labelKey: 'loanApplication.steps.reviewSubmit', component: ReviewSubmitStep },
];

const initialFormState: DetailedApplicationData = {
    personalDetails: { fullName: '', fatherHusbandName: '', dob: '', gender: '', maritalStatus: '', currentAddress: '', permanentAddress: '', phone: '', email: '', idNumber: '' },
    loanRequirement: { purpose: '', amount: '', repaymentPeriod: '', loanType: '' },
    submissionDate: new Date().toISOString(),
    userId: ''
};

const NewApplicationForm = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();


  const totalSteps = stepsConfig.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const currentValidationSchema = getValidationSchema(currentStep, t);
  
  const methods = useForm<DetailedApplicationData>({
    resolver: zodResolver(currentValidationSchema),
    mode: 'onChange', 
    defaultValues: initialFormState
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    const fieldsToValidate = Object.keys(getValidationSchema(currentStep, t).shape);
    const isValid = await trigger(fieldsToValidate as any);
    
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: DetailedApplicationData) => {
    if (!user || !firestore) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to submit an application.",
            variant: "destructive"
        });
        router.push('/login');
        return;
    }

    setIsSubmitting(true);
    
    const finalData = {
      ...data,
      submissionDate: new Date().toISOString(),
      userId: user.uid,
    };
    
    addLoanApplication(firestore, user.uid, finalData)
      .then(() => {
        toast({
          title: t('loanApplication.applicationSubmitted'),
          description: t('viewApplications.saveSuccess'),
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent-foreground"
        });
        setIsSubmitted(true);
      })
      .catch((error) => {
        // The contextual error is already emitted by addLoanApplication
        // We can show a generic toast here for the user if we want
        toast({
          title: "Error",
          description: "Failed to save application. You may not have the required permissions.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  if (isUserLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center animate-in fade-in-50 duration-500">
        <CheckCircle className="w-24 h-24 text-accent mb-4" />
        <h2 className="text-2xl font-semibold mb-2">{t('loanApplication.applicationSubmitted')}</h2>
        <p className="text-muted-foreground mb-6">{t('viewApplications.saveSuccess')}</p>
        <div className="flex gap-4">
            <Button variant="outline" onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(0);
              methods.reset(initialFormState);
            }}>{t('viewApplications.submitAnother')}</Button>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = stepsConfig[currentStep].component;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>{t(stepsConfig[currentStep].labelKey)}</CardTitle>
        <CardDescription>Step {currentStep + 1} of {totalSteps}</CardDescription>
        <Progress value={progress} className="mt-2 h-2" />
      </CardHeader>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 min-h-[350px]">
            <CurrentStepComponent control={methods.control} formData={getValues()} t={t} />
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isSubmitting}>
              {t('loanApplication.previous')}
            </Button>
            {currentStep < totalSteps - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {t('loanApplication.next')}
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('loanApplication.reviewSubmitForm.submitting')}
                  </>
                ) : (
                  t('loanApplication.submit')
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
};


export default function ApplyLoanPage() {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState("new-application");

    return (
        <div className="space-y-8 animate-in fade-in-0 duration-500">
             <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t('nav.applyLoan')}
                </h1>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="new-application">{t('nav.applyLoan')}</TabsTrigger>
                    <TabsTrigger value="my-applications">{t('nav.viewApplications')}</TabsTrigger>
                </TabsList>
                <TabsContent value="new-application">
                    {activeTab === 'new-application' && <NewApplicationForm />}
                </TabsContent>
                <TabsContent value="my-applications">
                    {activeTab === 'my-applications' && <MyApplicationsView />}
                </TabsContent>
            </Tabs>
        </div>
    );
}
