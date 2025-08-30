'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on dashboard page
  const isDashboard = pathname === '/dashboard';
  
  if (isDashboard) {
    return null;
  }
  
  return <Navbar />;
}

export function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Remove padding on dashboard page
  const isDashboard = pathname === '/dashboard';
  
  return (
    <>
      <ConditionalNavbar />
      <main className={isDashboard ? 'pt-0' : 'pt-20'}>
        {children}
      </main>
    </>
  );
}
