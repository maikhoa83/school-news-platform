/**
 * Public SEO Runtime Declarative Component
 * School News Platform - Step 09.6C
 *
 * Can be rendered at the root of public shell or layout.
 * Automatically handles synchronization when mounted inside or outside PublicSeoProvider.
 */

import React from 'react';
import { usePublicSeo } from '../context/PublicSeoContext';

export const PublicSeoRuntime: React.FC = () => {
  // Access resolved metadata to ensure reactivity
  const { resolvedMetadata } = usePublicSeo();

  // The DOM synchronization is handled by PublicSeoProvider's useEffect
  // This component serves as an explicit runtime anchor in the component tree
  return null;
};
