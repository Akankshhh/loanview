// src/components/layout/Footer.tsx
"use client";

import { useI18n } from '@/hooks/useI18n';

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-6 text-center text-sm text-muted-foreground">
        {t('footer.copyRight', { year: currentYear.toString() })}
      </div>
    </footer>
  );
}
