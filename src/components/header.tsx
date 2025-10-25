
'use client';

import Link from 'next/link';
import {
  LogIn,
  Menu,
  ShoppingCart,
  User,
  UserPlus,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import CartSheet from './cart-sheet';
import { useCart } from '@/hooks/use-cart';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { useMemo } from 'react';

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const isAdmin = user?.email === 'adamaber50@gmail.com';

  const isHomePage = pathname === '/';

  const headerClasses = cn(
    'top-0 w-full z-20',
    isHomePage
      ? 'absolute bg-transparent text-white'
      : 'sticky bg-card border-b shadow-sm text-foreground'
  );

  const mainNav = useMemo(() => {
    const nav = [
      { href: '/', label: 'Home' },
      { href: '/products', label: 'Products' },
      { href: '/offers', label: 'Offers' },
      { href: '/about', label: 'About Us' },
    ];
    return nav;
  }, []);

  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-3xl font-bold font-headline"
          >
            <ShoppingBag className="h-8 w-8" />
            <span>Koksi Kok</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {mainNav.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="link"
                className={cn(
                  'text-current/80 hover:text-current',
                  !isHomePage && 'text-foreground/80 hover:text-foreground'
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'relative hover:bg-current/10',
                  !isHomePage && 'text-foreground hover:bg-accent'
                )}
              >
                <ShoppingCart />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Open shopping cart</span>
              </Button>
            </SheetTrigger>
            <CartSheet />
          </Sheet>

          {isUserLoading ? (
            <div className="h-10 w-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'hover:bg-current/10',
                    !isHomePage && 'text-foreground hover:bg-accent'
                  )}
                >
                  <User />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem disabled>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                       <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => auth && signOut(auth)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'hover:bg-current/10',
                    !isHomePage && 'text-foreground hover:bg-accent'
                  )}
                >
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {mainNav.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
