
// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { signUpWithEmailAndPassword, signInWithEmail } from '@/firebase/auth/auth-operations';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const signInSchema = (t: Function) => z.object({
  email: z.string().email(t('formValidation.invalidEmail')),
  password: z.string().min(1, t('formValidation.required')),
});

const signUpSchema = (t: Function) => z.object({
  fullName: z.string().min(2, t('formValidation.minLength', { length: 2 })),
  email: z.string().email(t('formValidation.invalidEmail')),
  password: z.string().min(6, t('formValidation.minLength', { length: 6 })),
});

export default function LoginPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState("sign-in");

  const signInForm = useForm<z.infer<ReturnType<typeof signInSchema>>>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<z.infer<ReturnType<typeof signUpSchema>>>({
    resolver: zodResolver(signUpSchema(t)),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (values: z.infer<ReturnType<typeof signInSchema>>) => {
    try {
      if (!auth) throw new Error("Auth service is not available.");
      await signInWithEmail(auth, values.email, values.password);
      toast({
        title: t('login.signInSuccessTitle'),
        description: t('login.signInSuccessDesc'),
        variant: "default",
        className: "bg-accent text-accent-foreground border-accent-foreground"
      });
      router.push('/');
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: t('login.signInFailed'),
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (values: z.infer<ReturnType<typeof signUpSchema>>) => {
    try {
      if (!auth) throw new Error("Auth service is not available.");
      await signUpWithEmailAndPassword(auth, values.email, values.password, values.fullName);
      toast({
        title: t('login.signUpSuccess'),
        description: t('login.signUpSuccessDesc'),
        variant: "default",
        className: "bg-accent text-accent-foreground border-accent-foreground"
      });
      router.push('/');
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: t('login.signUpFailed'),
        description: error.message || "An unexpected error occurred during sign-up.",
        variant: "destructive",
      });
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SignInForm = (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(handleLogin)} className="space-y-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
              {signInForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('login.signInButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const SignUpForm = (
     <Card>
      <CardHeader>
        <CardTitle>{t('login.createAccount')}</CardTitle>
        <CardDescription>{t('login.signUpDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...signUpForm}>
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <FormField
              control={signUpForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('personalDetailsForm.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('personalDetailsForm.fullNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
              {signUpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('login.createAccount')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex items-center justify-center min-h-screen -m-8 bg-background p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">{t('login.signInButton')}</TabsTrigger>
          <TabsTrigger value="sign-up">{t('login.signUp')}</TabsTrigger>
        </TabsList>
        <div className="mt-2">
            <div className={cn(activeTab !== 'sign-in' && 'hidden')}>
                {SignInForm}
            </div>
             <div className={cn(activeTab !== 'sign-up' && 'hidden')}>
                {SignUpForm}
            </div>
        </div>
      </Tabs>
    </div>
  );
}
