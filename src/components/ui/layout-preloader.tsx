'use client';

import { useCallback, useState } from 'react';
import Preloader from '@/components/ui/preloader';

export default function LayoutPreloader() {
  // Show on initial mount (first load / refresh). Will not re-show on client navigations.
  const [show, setShow] = useState(true);

  const handleDone = useCallback(() => {
    setShow(false);
  }, []);

  if (!show) return null;

  return <Preloader active onDone={handleDone} />;
}

