// src/app/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useI18n } from '@/hooks/useI18n';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle } from "lucide-react";
import type { UserProfile } from "@/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const profileSchema = (t: Function) => z.object({
  firstName: z.string().min(1, t('formValidation.required')),
  lastName: z.string().min(1, t('formValidation.required')),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<ReturnType<typeof profileSchema>>;

export default function ProfilePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phoneNumber: userProfile.phoneNumber || '',
        address: userProfile.address || '',
      });
    }
  }, [userProfile, form]);
  
  const onSubmit = (data: ProfileFormData) => {
    if (!userDocRef) return;
    
    form.clearErrors();
    form.setValue('formState', { isSubmitting: true });

    // Use a non-blocking write with specific error handling
    setDoc(userDocRef, data, { merge: true })
      .then(() => {
        toast({
          title: t('profilePage.updateSuccess'),
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent-foreground"
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);

        // Also show a toast for direct user feedback
        toast({
          title: t('profilePage.updateError'),
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
      }).finally(() => {
        form.setValue('formState', { isSubmitting: false });
      });
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <UserCircle className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t('profilePage.title')}
        </h1>
      </div>

      <Card className="w-full max-w-2xl mx-auto shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader>
          <CardTitle>{t('profilePage.personalInfo')}</CardTitle>
          <CardDescription>{t('profilePage.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profilePage.firstName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profilePage.lastName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profilePage.phoneNumber')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profilePage.address')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('profilePage.saving')}
                    </>
                  ) : (
                    t('profilePage.saveChanges')
                  )}
                </Button>
              </form>
            </FormProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
