// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";

// ============================================
// TYPES
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

// ============================================
// NAV ITEMS
// ============================================

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/diagnosis/new", label: "New Diagnosis", icon: Stethoscope },
  { href: "/diagnosis/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

// ============================================
// HELPERS
// ============================================

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ============================================
// SIDEBAR CONTENT COMPONENT
// ============================================

interface SidebarContentProps {
  user: User | null;
  pathname: string;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  handleSignOut: () => void;
  onItemClick?: () => void;
}

function SidebarContent({
  user,
  pathname,
  sidebarCollapsed,
  toggleSidebar,
  handleSignOut,
  onItemClick,
}: SidebarContentProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setMounted(true);
    }
  }, []);
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={onItemClick}
        >
          <Stethoscope className="h-6 w-6 text-primary" />
          {!sidebarCollapsed && <span>TriageAI</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                isActive
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground",
                sidebarCollapsed && "justify-center px-2",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="border-t p-4 space-y-3">
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg",
              sidebarCollapsed && "justify-center",
            )}
          >
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover rounded-full"
                  unoptimized
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              )}
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sign Out */}
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "default"}
          className={cn(
            "w-full justify-start",
            sidebarCollapsed && "justify-center",
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>

        {/* Theme Toggle + Collapse Toggle (Desktop) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size={sidebarCollapsed ? "icon" : "default"}
            className={cn(
              "flex-1 justify-start",
              sidebarCollapsed && "justify-center",
            )}
            onClick={toggleTheme}
          >
            {mounted &&
              (theme === "dark" ? (
                <Sun className="h-4 w-4 shrink-0" />
              ) : (
                <Moon className="h-4 w-4 shrink-0" />
              ))}
            {!sidebarCollapsed && <span className="ml-2">Theme</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex w-auto flex-shrink-0"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    sidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/sign-in");
            router.refresh();
          },
          onError: (error) => {
            toast.error("Failed to sign out");
            console.error("Sign out error:", error);
          },
        },
      });
    } catch (error) {
      toast.error("An error occurred during sign out");
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col border-r bg-card transition-all duration-300 sticky top-0 h-screen",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent
          user={user}
          pathname={pathname}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            user={user}
            pathname={pathname}
            sidebarCollapsed={false}
            toggleSidebar={toggleSidebar}
            handleSignOut={handleSignOut}
            onItemClick={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
