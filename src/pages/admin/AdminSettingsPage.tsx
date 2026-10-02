/**
 * Admin Settings & Module Configuration Page
 * School News Platform - Step 03 Foundation
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Palette,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { usePermissions } from '../../hooks/usePermissions';
import { getAllModules } from '../../lib/moduleRegistry';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

export function AdminSettingsPage() {
  const {
    schoolIdentity,
    branding,
    isModuleEnabled,
    toggleModule,
    updateSchoolIdentity,
    updateBranding,
    refreshConfig,
  } = useConfig();
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission('settings.edit');

  // Form states
  const [identityForm, setIdentityForm] = useState(schoolIdentity);
  const [brandingForm, setBrandingForm] = useState(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const modules = getAllModules();

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setSaveNotice(null);

    const res = await updateSchoolIdentity(identityForm);
    setIsSaving(false);

    if (res.success) {
      setSaveNotice({ type: 'success', message: 'Cập nhật thông tin nhận diện trường học thành công!' });
    } else {
      setSaveNotice({ type: 'error', message: res.error || 'Lỗi cập nhật cấu hình trường học.' });
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setSaveNotice(null);

    const res = await updateBranding(brandingForm);
    setIsSaving(false);

    if (res.success) {
      setSaveNotice({ type: 'success', message: 'Cập nhật nhận diện thương hiệu thành công!' });
    } else {
      setSaveNotice({ type: 'error', message: res.error || 'Lỗi cập nhật bảng màu thương hiệu.' });
    }
  };

  const handleToggleModule = async (moduleKey: string, currentEnabled: boolean) => {
    if (!canEdit) return;

    setSaveNotice(null);
    const newEnabled = !currentEnabled;
    const res = await toggleModule(moduleKey, newEnabled);

    if (res.success) {
      setSaveNotice({
        type: 'success',
        message: `Đã ${newEnabled ? 'kích hoạt' : 'vô hiệu hóa'} module [${moduleKey}] thành công!`,
      });
    } else {
      setSaveNotice({
        type: 'error',
        message: res.error || 'Không thể cập nhật trạng thái module.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" className="text-[10px] py-0.5 px-2">
              CẤU HÌNH HỆ THỐNG
            </Badge>
            <span className="text-xs text-slate-500">• Step 03 Configuration Foundation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Trị Cấu Hình & Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tùy biến hồ sơ trường học, giao diện nhận diện thương hiệu và bật/tắt các module chức năng độc lập.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refreshConfig()}>
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Làm mới cấu hình
        </Button>
      </div>

      {saveNotice && (
        <Alert
          variant={saveNotice.type === 'success' ? 'success' : 'danger'}
          title={saveNotice.type === 'success' ? 'Thành công' : 'Lưu ý'}
        >
          {saveNotice.message}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="identity" className="text-xs sm:text-sm">
            <GraduationCap className="h-4 w-4 mr-1.5" />
            Hồ Sơ Nhận Diện Trường
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs sm:text-sm">
            <Palette className="h-4 w-4 mr-1.5" />
            Màu Sắc & Thương Hiệu
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs sm:text-sm">
            <Layers className="h-4 w-4 mr-1.5" />
            Bật/Tắt Module ({modules.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: School Identity */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông Tin Nhận Diện Trường Học</CardTitle>
              <CardDescription>
                Dữ liệu này được hiển thị tự động trên Header, Footer, Trang chủ và các văn bản điều hành.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveIdentity} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tên đầy đủ của nhà trường"
                    value={identityForm.school_name}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, school_name: e.target.value }))
                    }
                    disabled={!canEdit}
                    required
                  />
                  <Input
                    label="Tên viết tắt (Short Name)"
                    value={identityForm.short_name}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, short_name: e.target.value }))
                    }
                    disabled={!canEdit}
                    required
                  />
                </div>

                <Input
                  label="Khẩu hiệu sư phạm (Slogan)"
                  value={identityForm.slogan}
                  onChange={(e) =>
                    setIdentityForm((prev) => ({ ...prev, slogan: e.target.value }))
                  }
                  disabled={!canEdit}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Số điện thoại / Hotline"
                    value={identityForm.phone}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                  <Input
                    label="Email liên hệ công vụ"
                    type="email"
                    value={identityForm.email}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Địa chỉ trụ sở"
                    value={identityForm.address}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                  <Input
                    label="Địa chỉ Website"
                    value={identityForm.website}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, website: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Đường dẫn Logo URL"
                    value={identityForm.logo_url}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, logo_url: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                  <Input
                    label="Đường dẫn Favicon URL"
                    value={identityForm.favicon_url}
                    onChange={(e) =>
                      setIdentityForm((prev) => ({ ...prev, favicon_url: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                </div>

                {canEdit && (
                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                      <Save className="h-4 w-4 mr-1.5" />
                      Lưu Hồ Sơ Nhận Diện
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Màu Sắc & Nhận Diện Thương Hiệu</CardTitle>
              <CardDescription>
                Bảng màu chuẩn sư phạm áp dụng trên toàn bộ thanh điều hướng, nút bấm và biểu tượng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700 block">
                      Màu sắc chủ đạo (Primary Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandingForm.primary_color}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({ ...prev, primary_color: e.target.value }))
                        }
                        disabled={!canEdit}
                        className="h-10 w-16 rounded border border-slate-300 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingForm.primary_color}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({ ...prev, primary_color: e.target.value }))
                        }
                        disabled={!canEdit}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-700 block">
                      Màu sắc điểm nhấn (Secondary / Accent Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandingForm.secondary_color}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({ ...prev, secondary_color: e.target.value }))
                        }
                        disabled={!canEdit}
                        className="h-10 w-16 rounded border border-slate-300 p-1 cursor-pointer"
                      />
                      <Input
                        value={brandingForm.secondary_color}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({ ...prev, secondary_color: e.target.value }))
                        }
                        disabled={!canEdit}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                      <Save className="h-4 w-4 mr-1.5" />
                      Lưu Thiết Lập Màu Sắc
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Module Registry Management */}
        <TabsContent value="modules">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Quản Lý Danh Mục Module Chức Năng</CardTitle>
                  <CardDescription>
                    Khi vô hiệu hóa một module, mục điều hướng sẽ được ẩn và các tuyến đường tương ứng sẽ bị khóa an toàn; dữ liệu gốc trong cơ sở dữ liệu luôn được bảo toàn nguyên vẹn.
                  </CardDescription>
                </div>
                <Badge variant="primary" className="text-[10px]">
                  {modules.filter((m) => isModuleEnabled(m.key)).length} / {modules.length} Đang bật
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {modules.map((mod) => {
                  const enabled = isModuleEnabled(mod.key);

                  return (
                    <div
                      key={mod.key}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{mod.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            ({mod.key})
                          </span>
                          <Badge
                            variant={mod.category === 'core' ? 'primary' : 'outline'}
                            className="text-[9px] py-0 px-1.5 uppercase"
                          >
                            {mod.category}
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-[11px] truncate">{mod.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Quyền yêu cầu:</span>
                          <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">
                            {mod.requiredPermissions.join(', ')}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`font-semibold text-xs ${
                            enabled ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {enabled ? 'Đang kích hoạt' : 'Đã vô hiệu hóa'}
                        </span>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleToggleModule(mod.key, enabled)}
                            aria-label={`Bật tắt module ${mod.name}`}
                            className={`p-1 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                              enabled
                                ? 'text-blue-800 hover:text-blue-900'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {enabled ? (
                              <ToggleRight className="h-8 w-8" />
                            ) : (
                              <ToggleLeft className="h-8 w-8" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
