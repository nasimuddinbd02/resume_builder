'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  FileText,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Menu,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const userImage = session?.user?.image;

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <FileText className="size-4" />
          </div>
          <span className="gradient-text text-lg font-bold tracking-tight">
            ResumeAI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <link.icon className="size-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Desktop User Menu */}
        <div className="hidden items-center gap-3 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-2 rounded-full p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <Avatar size="sm">
                {userImage && <AvatarImage src={userImage} alt={userName ?? 'User'} />}
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              {userName && (
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                  {userName}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{userName ?? 'User'}</span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground">{userEmail}</span>
                    )}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/dashboard" />}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/settings" />}
              >
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <span className="gradient-text font-bold">ResumeAI</span>
                </SheetTitle>
              </SheetHeader>

              {/* User Info */}
              {session?.user && (
                <div className="flex items-center gap-3 border-b border-border/50 px-4 pb-4">
                  <Avatar>
                    {userImage && <AvatarImage src={userImage} alt={userName ?? 'User'} />}
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">
                      {userName ?? 'User'}
                    </span>
                    {userEmail && (
                      <span className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-1 px-2 py-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} render={<Link href={link.href} />}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <link.icon className="size-4" />
                      {link.label}
                    </Button>
                  </SheetClose>
                ))}
              </div>

              {/* Mobile Sign Out */}
              <div className="mt-auto border-t border-border/50 px-2 pt-4">
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
