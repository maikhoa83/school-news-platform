/**
 * Announcements Module Validation Schemas
 * School News Platform - Step 07 Thông báo điều hành
 */

import { z } from 'zod';

export const announcementFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Tiêu đề thông báo phải có ít nhất 3 ký tự')
      .max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
    content: z
      .string()
      .trim()
      .min(5, 'Nội dung thông báo phải có ít nhất 5 ký tự')
      .max(10000, 'Nội dung không được vượt quá 10.000 ký tự'),
    priority: z.enum(['normal', 'important', 'urgent']),
    is_pinned: z.boolean().default(false),
    publish_mode: z.enum(['draft', 'publish_now', 'schedule']),
    published_at: z.string().nullable().optional(),
    has_expiry: z.boolean().default(false),
    expires_at: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Schedule mode requires a valid published_at date
    if (data.publish_mode === 'schedule') {
      if (!data.published_at || data.published_at.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['published_at'],
          message: 'Vui lòng chọn thời gian lên lịch xuất bản',
        });
      }
    }

    // Expiry check
    if (data.has_expiry) {
      if (!data.expires_at || data.expires_at.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expires_at'],
          message: 'Vui lòng chọn thời gian hết hạn thông báo',
        });
      }
    }

    // Date relationship check: expires_at must be strictly after published_at
    if (data.has_expiry && data.expires_at) {
      const expiryTime = new Date(data.expires_at).getTime();
      let publishTime: number | null = null;

      if (data.publish_mode === 'schedule' && data.published_at) {
        publishTime = new Date(data.published_at).getTime();
      } else if (data.publish_mode === 'publish_now') {
        publishTime = Date.now();
      }

      if (publishTime && !isNaN(expiryTime) && !isNaN(publishTime)) {
        if (expiryTime <= publishTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['expires_at'],
            message: 'Thời gian hết hạn phải sau thời điểm xuất bản',
          });
        }
      }
    }
  });

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
