
// src/components/layout/AppSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, APP_NAME_KEY } from '@/constants/appConstants';
import { useI18n } from '@/hooks/useI18n';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  // SidebarFooter, // Not used for now
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { state: sidebarState, isMobile, openMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary hover:text-sidebar-primary/90 transition-colors">
          <Building className="h-7 w-7" />
          {sidebarState === 'expanded' && <span className="whitespace-nowrap">{t(APP_NAME_KEY)}</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                className={cn(
                  "justify-start w-full", // Ensure full width for proper text alignment
                  sidebarState === 'collapsed' && "justify-center" // Center icon when collapsed
                )}
                tooltip={sidebarState === 'collapsed' ? { children: t(item.labelKey), side: "right", align: "center", sideOffset: 8 } : undefined}
                onClick={handleLinkClick}
              >
                <Link href={item.href} prefetch={true} className="flex items-center gap-3"> {/* Increased gap for better spacing */}
                  {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                  {sidebarState === 'expanded' && <span className="whitespace-nowrap">{t(item.labelKey)}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* 
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        // Placeholder for footer items if needed, e.g., settings, user profile
      </SidebarFooter> 
      */}
    </Sidebar>
  );
}
