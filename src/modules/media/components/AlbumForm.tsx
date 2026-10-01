/**
 * Album Create / Edit Form Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Implements:
 * - React Hook Form + Zod validation with albumFormSchema
 * - Inputs: title, slug, description, cover_media_id, is_published
 * - Database-managed fields (id, created_by, created_at, updated_at, published_at) strictly omitted
 * - Vietnamese title -> URL slug auto-generation helper
 * - AlbumCoverSelector integration (Media Library selection only)
 * - Clear validation errors & submit loading states
 */

import React, { useEffect } from 'react';
import { useForm, Controller, type Resolver, type FieldErrors } from 'react-hook-form';
import { Save, Loader2, Globe, FileText, CheckCircle2, EyeOff } from 'lucide-react';
import { albumFormSchema, type AlbumFormValues } from '../schemas/mediaSchema';
import { AlbumCoverSelector } from './AlbumCoverSelector';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import type { Album } from '../../../types/media';

/**
 * Native Zod resolver for React Hook Form without extra npm packages
 */
const customZodResolver: Resolver<AlbumFormValues> = async (values) => {
  const result = albumFormSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const fieldErrors: FieldErrors<AlbumFormValues> = {};
  for (const issue of result.error.issues) {
    const fieldName = issue.path[0] as keyof AlbumFormValues;
    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = {
        type: issue.code,
        message: issue.message,
      };
    }
  }

  return {
    values: {},
    errors: fieldErrors,
  };
};

/**
 * Converts Vietnamese text with diacritics into a clean URL slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-') // collapse spaces into -
    .replace(/-+/g, '-'); // collapse multiple -
}

export interface AlbumFormProps {
  initialData?: Album | null;
  onSubmit: (values: AlbumFormValues) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function AlbumForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Lưu album',
}: AlbumFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<AlbumFormValues>({
    resolver: customZodResolver,
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      cover_media_id: initialData?.cover_media_id || null,
      is_published: initialData?.is_published ?? false,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        slug: initialData.slug,
        description: initialData.description || '',
        cover_media_id: initialData.cover_media_id || null,
        is_published: initialData.is_published,
      });
    }
  }, [initialData, reset]);

  const currentTitle = watch('title');
  const currentSlug = watch('slug');
  const isPublished = watch('is_published');

  // Auto-generate slug when title changes if slug is empty or user is creating a new album
  const handleTitleBlur = () => {
    if ((!currentSlug || !initialData) && currentTitle) {
      setValue('slug', slugify(currentTitle), { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleFormSubmit = async (values: AlbumFormValues) => {
    // Ensure slug is populated
    const finalValues: AlbumFormValues = {
      ...values,
      slug: values.slug ? slugify(values.slug) : slugify(values.title),
      description: values.description?.trim() || null,
    };
    await onSubmit(finalValues);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Title input */}
        <div>
          <label htmlFor="album-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Tiêu đề album <span className="text-red-500">*</span>
          </label>
          <Input
            id="album-title"
            {...register('title')}
            onBlur={handleTitleBlur}
            disabled={isLoading}
            placeholder="Ví dụ: Lễ Khai Giảng Năm Học Mới 2025 - 2026"
            className="text-xs h-9"
          />
          {errors.title && (
            <p className="text-[11px] text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Slug input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="album-slug" className="block text-xs font-semibold text-slate-700">
              Đường dẫn định danh (Slug) <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                if (currentTitle) {
                  setValue('slug', slugify(currentTitle), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-medium"
            >
              Tạo tự động từ tiêu đề
            </button>
          </div>
          <Input
            id="album-slug"
            {...register('slug')}
            disabled={isLoading}
            placeholder="le-khai-giang-nam-hoc-moi-2025-2026"
            leftIcon={<Globe className="h-3.5 w-3.5 text-slate-400" />}
            className="text-xs h-9 font-mono"
          />
          {errors.slug && (
            <p className="text-[11px] text-red-600 mt-1">{errors.slug.message}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-0.5">
            Slug chỉ gồm các chữ cái thường không dấu, số và dấu gạch ngang (-).
          </p>
        </div>

        {/* Description textarea */}
        <div>
          <label htmlFor="album-description" className="block text-xs font-semibold text-slate-700 mb-1">
            Mô tả album
          </label>
          <div className="relative">
            <textarea
              id="album-description"
              {...register('description')}
              rows={3}
              disabled={isLoading}
              placeholder="Giới thiệu đôi nét về hoạt động, sự kiện hoặc các khoảnh khắc trong album ảnh..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none text-slate-800"
            />
          </div>
          {errors.description && (
            <p className="text-[11px] text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Cover Media Selector */}
        <Controller
          name="cover_media_id"
          control={control}
          render={({ field }) => (
            <AlbumCoverSelector
              coverMediaId={field.value}
              onChange={(newId) => field.onChange(newId)}
              disabled={isLoading}
            />
          )}
        />
        {errors.cover_media_id && (
          <p className="text-[11px] text-red-600 mt-1">{errors.cover_media_id.message}</p>
        )}

        {/* Publication Status Toggle */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label
                htmlFor="album-is-published"
                className="text-xs font-semibold text-slate-900 cursor-pointer flex items-center gap-2"
              >
                {isPublished ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                )}
                Trạng thái xuất bản album
              </label>
              <p className="text-[11px] text-slate-500">
                {isPublished
                  ? 'Album đang được CÔNG KHAI và hiển thị trong Thư viện ảnh của trường.'
                  : 'Album đang ở trạng thái BẢN NHÁP (chỉ cán bộ quản trị mới xem được).'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="album-is-published"
                type="checkbox"
                {...register('is_published')}
                disabled={isLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Form Submission Action */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-200">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isLoading}
          className="text-xs h-9 px-4 bg-blue-800 hover:bg-blue-900 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {submitButtonText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
