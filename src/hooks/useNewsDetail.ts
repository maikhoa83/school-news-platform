/**
 * Hook for Public News Detail View
 * Manages article retrieval, Table of Contents (TOC) extraction, Related News, and Older News
 * School News Platform - Step 05 News Module
 */

import { useState, useEffect, useMemo } from 'react';
import { NewsItem, TableOfContentItem } from '../types/news';
import { getNewsBySlug, getRelatedNews, getOlderNews } from '../services/newsService';
import { slugifyVietnamese } from '../lib/slugify';

export function useNewsDetail(slug?: string) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [olderNews, setOlderNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadDetail() {
      try {
        const item = await getNewsBySlug(slug!);
        if (!isMounted) return;

        if (!item) {
          setError('Không tìm thấy bài viết hoặc bài viết chưa được xuất bản.');
          setIsLoading(false);
          return;
        }

        setNews(item);

        // Fetch related news (1–4 items) and older news concurrently
        const [related, older] = await Promise.all([
          getRelatedNews(item.id, item.category_id, 4),
          getOlderNews(item.id, item.category_id, item.published_at, 5),
        ]);

        if (isMounted) {
          setRelatedNews(related);
          setOlderNews(older);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Lỗi tải bài viết');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /**
   * Automatic Table of Contents parser
   * Extracts H2, H3, H4 from the article content
   */
  const { toc, processedContent } = useMemo(() => {
    if (!news?.content) {
      return { toc: [], processedContent: '' };
    }

    const items: TableOfContentItem[] = [];
    const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
    if (!parser) {
      return { toc: [], processedContent: news.content };
    }

    try {
      const doc = parser.parseFromString(news.content, 'text/html');
      const headings = doc.querySelectorAll('h2, h3, h4');
      const occurrences = new Map<string, number>();

      headings.forEach((heading, idx) => {
        const text = heading.textContent?.trim() || '';
        if (!text) return;

        const level = parseInt(heading.tagName.charAt(1), 10) as 2 | 3 | 4;
        const baseId = slugifyVietnamese(text) || `heading-${idx + 1}`;
        const count = occurrences.get(baseId) || 0;
        occurrences.set(baseId, count + 1);

        const anchorId = count === 0 ? `section-${baseId}` : `section-${baseId}-${count + 1}`;

        heading.id = anchorId;
        items.push({
          id: anchorId,
          text,
          level,
        });
      });

      return {
        toc: items,
        processedContent: doc.body.innerHTML,
      };
    } catch {
      return { toc: [], processedContent: news.content };
    }
  }, [news?.content]);

  return {
    news,
    relatedNews,
    olderNews,
    toc,
    processedContent,
    isLoading,
    error,
  };
}
