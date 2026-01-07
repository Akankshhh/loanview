
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/contexts/I18nContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LoanView',
  description: 'Manage and explore loan options with LoanView.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased", // Removed flex flex-col here, SidebarProvider will handle layout
          inter.variable
        )}
        suppressHydrationWarning={true}
      >
        <I18nProvider>
          <FirebaseClientProvider>
            <SidebarProvider defaultOpen={true}>
              <AppSidebar />
              <SidebarInset className="flex flex-col min-h-screen"> {/* Ensure SidebarInset takes full height and manages its children flex */}
                <Header />
                <main className="flex-grow container py-8">
                  {children}
                </main>
                <Footer />
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </FirebaseClientProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
