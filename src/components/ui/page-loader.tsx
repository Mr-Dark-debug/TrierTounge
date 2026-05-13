'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Loader from './loader';

function NavigationHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Short delay to show the animation

    return () => clearTimeout(timer);
  }, [pathname, searchParams, isInitialLoad]);

  if (!isLoading) return null;

  return <Loader />;
}

export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationHandler />
    </Suspense>
  );
}
