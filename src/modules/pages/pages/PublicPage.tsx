/**
 * Public Static Page View
 * Resolves /page/:slug and renders template-aware content using usePublishedPage
 * School News Platform - Step 09.6A
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePublishedPage } from '../hooks/usePublishedPage';
import { SLUG_REGEX } from '../schemas/pageSchema';
import { PublicPageSkeleton } from '../components/PublicPageSkeleton';
import { PublicPageError } from '../components/PublicPageError';
import {
  DefaultPageTemplate,
  FullwidthPageTemplate,
  SidebarPageTemplate,
  ContactPageTemplate,
} from '../components/PublicPageTemplates';
import { NotFoundState } from '../../../components/common/NotFoundState';
import { useConfig } from '../../../hooks/useConfig';
import { defaultSchoolIdentity } from '../../../config/schoolIdentity';
import { useSetPublicSeo } from '../../seo';

export const PublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { schoolIdentity: configIdentity } = useConfig();
  const schoolIdentity = configIdentity || defaultSchoolIdentity;

  const isValidSlug = Boolean(slug && typeof slug === 'string' && SLUG_REGEX.test(slug));
  const { page, isLoading, isError, error, refetch } = usePublishedPage(slug);

  // Step 09.6C: Authoritative Public SEO Runtime Integration
  useSetPublicSeo({
    page,
    isNotFound: !slug || !isValidSlug || (!isLoading && !page),
    isError,
    canonicalPath: slug ? `/page/${slug}` : undefined,
  });

  // 1. Invalid slug format
  if (!slug || !isValidSlug) {
    return (
      <NotFoundState
        title="404 - Không tìm thấy trang"
        description="Đường dẫn trang tĩnh không đúng định dạng chuẩn hoặc không tồn tại."
        returnPath="/"
        returnText="Quay về Trang chủ"
      />
    );
  }

  // 2. Loading state
  if (isLoading) {
    return <PublicPageSkeleton />;
  }

  // 3. Error state
  if (isError) {
    return <PublicPageError error={error} onRetry={() => refetch()} />;
  }

  // 4. Page not found (unpublished, archived, draft, or non-existent)
  if (!page) {
    return (
      <NotFoundState
        title="404 - Không tìm thấy trang"
        description="Trang thông tin bạn đang tìm kiếm không tồn tại, đã bị gỡ bỏ hoặc chưa được xuất bản."
        returnPath="/"
        returnText="Quay về Trang chủ"
      />
    );
  }

  // 5. Render corresponding template
  switch (page.template) {
    case 'fullwidth':
      return <FullwidthPageTemplate page={page} />;
    case 'sidebar':
      return <SidebarPageTemplate page={page} />;
    case 'contact':
      return <ContactPageTemplate page={page} />;
    case 'default':
    default:
      return <DefaultPageTemplate page={page} />;
  }
};
