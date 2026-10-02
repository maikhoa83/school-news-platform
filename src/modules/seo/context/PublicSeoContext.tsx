/**
 * Public SEO Runtime Context & Hooks
 * School News Platform - Step 09.6C
 *
 * Architecture:
 * PublicShell -> PublicSeoProvider -> PublicSeoHead -> DOM
 *
 * Invariants:
 * - Single code-path for document.title, meta, OpenGraph, Twitter, and JSON-LD
 * - Automatically clears page-specific metadata on route navigation
 * - Preserves module boundaries (Zero direct DB calls, consumes existing hooks)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useSeoSettings } from '../hooks/useSeoSettings';
import { useConfig } from '../../../hooks/useConfig';
import {
  resolvePublicSeo,
  applyPublicSeoMetadata,
} from '../utils/seoRuntimeUtils';
import type {
  PageSeoPayload,
  ResolvedPublicSeoMetadata,
} from '../types/runtimeSeo';

interface PublicSeoContextValue {
  resolvedMetadata: ResolvedPublicSeoMetadata;
  setPagePayload: (payload: PageSeoPayload | null) => void;
  pagePayload: PageSeoPayload | null;
  isLoading: boolean;
}

const PublicSeoContext = createContext<PublicSeoContextValue | undefined>(undefined);

export interface PublicSeoProviderProps {
  children: React.ReactNode;
}

export const PublicSeoProvider: React.FC<PublicSeoProviderProps> = ({ children }) => {
  const location = useLocation();
  const { seoSettings, isLoading } = useSeoSettings();
  const { schoolIdentity } = useConfig();

  const [pagePayload, setPagePayloadState] = useState<PageSeoPayload | null>(null);

  // Clear page-specific payload on route changes to prevent stale leakage
  useEffect(() => {
    setPagePayloadState(null);
  }, [location.pathname]);

  const setPagePayload = useCallback((payload: PageSeoPayload | null) => {
    setPagePayloadState(payload);
  }, []);

  const resolvedMetadata = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return resolvePublicSeo({
      seoSettings,
      schoolIdentity,
      pathname: location.pathname,
      origin,
      pagePayload,
    });
  }, [seoSettings, schoolIdentity, location.pathname, pagePayload]);

  // Synchronize with DOM <head>
  useEffect(() => {
    const cleanup = applyPublicSeoMetadata(resolvedMetadata);
    return cleanup;
  }, [resolvedMetadata]);

  const contextValue = useMemo(
    () => ({
      resolvedMetadata,
      setPagePayload,
      pagePayload,
      isLoading,
    }),
    [resolvedMetadata, setPagePayload, pagePayload, isLoading]
  );

  return (
    <PublicSeoContext.Provider value={contextValue}>
      {children}
    </PublicSeoContext.Provider>
  );
};

/**
 * Access the active resolved SEO metadata from any public component
 */
export function usePublicSeo() {
  const context = useContext(PublicSeoContext);
  if (!context) {
    throw new Error('usePublicSeo must be used within a PublicSeoProvider.');
  }
  return context;
}

/**
 * Route-level hook allowing page views (e.g. PublicPage, NewsDetailPage)
 * to register page-specific SEO attributes with the runtime owner.
 */
export function useSetPublicSeo(payload: PageSeoPayload | null) {
  const context = useContext(PublicSeoContext);

  // If outside provider, do not fail hard
  const setPagePayload = context?.setPagePayload;

  useEffect(() => {
    if (!setPagePayload) return;
    setPagePayload(payload);

    return () => {
      setPagePayload(null);
    };
  }, [
    setPagePayload,
    payload?.page?.id,
    payload?.page?.updated_at,
    payload?.customTitle,
    payload?.customDescription,
    payload?.customKeywords,
    payload?.customOgImage,
    payload?.canonicalPath,
    payload?.isNotFound,
    payload?.isError,
    payload?.noIndex,
    payload?.ogType,
  ]);
}
