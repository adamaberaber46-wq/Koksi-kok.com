'use client';

import Link from 'next/link';
import { LogIn, Menu, ShoppingCart, User, UserPlus, Shirt, LogOut, LayoutDashboard, Package } from 'lucide-react';

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
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/use-admin';

const mainNav = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/offers', label: 'Offers' },
  { href: '/about', label: 'About Us' },
];

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useAdmin();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const isHomePage = pathname === '/';
  const isTransparent = isHomePage && !scrolled;

  return (
    <header className={cn(
      "fixed top-0 z-40 w-full transition-colors duration-300",
      isTransparent ? 'bg-transparent text-primary-foreground' : 'bg-card border-b shadow-sm text-foreground'
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold font-headline")}>
            <Shirt className="h-6 w-6" />
            <span className={cn(isTransparent ? "text-white" : "")}>Koksi Kok</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {mainNav.map((item) => (
              <Button key={item.href} asChild variant="link" className={cn('text-sm font-semibold', isTransparent ? 'text-white/80 hover:text-white' : 'text-foreground/80 hover:text-foreground' )}>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className={cn("flex items-center gap-1")}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("relative", isTransparent ? 'text-white hover:bg-white/20' : 'text-foreground hover:bg-accent' )}>
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

          {!isUserLoading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(isTransparent ? 'text-white hover:bg-white/20' : 'text-foreground hover:bg-accent' )}>
                  <User />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                   <>
                    <DropdownMenuItem disabled>
                      <div className="flex flex-col">
                        <span className='font-medium'>{user.email}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     {!isAdminLoading && isAdmin && (
                        <>
                            <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                            <Link href="/admin/orders">
                                <Package className="mr-2 h-4 w-4" />
                                <span>Orders</span>
                            </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                     )}
                    <DropdownMenuItem onClick={handleLogout}>
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
                <Button variant="ghost" size="icon" className={cn(isTransparent ? 'text-white hover:bg-white/20' : 'text-foreground hover:bg-accent' )}>
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
