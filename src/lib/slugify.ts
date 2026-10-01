/**
 * Vietnamese SEO Slug Generator
 * Converts accented Vietnamese strings to normalized URL-friendly slugs
 * School News Platform - Step 05
 */

export function slugifyVietnamese(text: string): string {
  if (!text) return '';

  let slug = text.trim().toLowerCase();

  // Replace Vietnamese accents
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');

  // Remove special characters
  slug = slug.replace(/\`|\~|\!|\@|\#|\|\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');

  // Convert multiple spaces or dashes into single dash
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Trim dashes from start and end
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}
