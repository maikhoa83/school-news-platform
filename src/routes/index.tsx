/**
 * Application Routing Definition
 * School News Platform - Step 03 Foundation
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicShell } from '../layouts/public/PublicShell';
import { AdminShell } from '../layouts/admin/AdminShell';
import { AuthShell } from '../layouts/auth/AuthShell';
import { HomePageDemo } from '../pages/public/HomePageDemo';
import { HomePage } from '../pages/public/HomePage';
import { NewsPageDemo } from '../pages/public/NewsPageDemo';
import { NewsListPage } from '../pages/public/NewsListPage';
import { NewsDetailPage } from '../pages/public/NewsDetailPage';
import { NewsSearchPage } from '../pages/public/NewsSearchPage';
import { DocumentsPage } from '../pages/public/DocumentsPage';
import { AnnouncementsPage } from '../pages/public/AnnouncementsPage';
import { GenericPageDemo } from '../pages/public/GenericPageDemo';
import { AdminDashboardDemo } from '../pages/admin/AdminDashboardDemo';
import { AdminNewsListPage } from '../pages/admin/AdminNewsListPage';
import { AdminNewsEditorPage } from '../pages/admin/AdminNewsEditorPage';
import { AdminDocumentsListPage } from '../pages/admin/AdminDocumentsListPage';
import { AdminDocumentEditorPage } from '../pages/admin/AdminDocumentEditorPage';
import { AdminAnnouncementsListPage } from '../pages/admin/AdminAnnouncementsListPage';
import { AdminAnnouncementEditorPage } from '../pages/admin/AdminAnnouncementEditorPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminTagsPage } from '../pages/admin/AdminTagsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminHomepagePage } from '../pages/admin/AdminHomepagePage';
import { AdminHealthPage } from '../pages/admin/AdminHealthPage';
import { AdminRolesPage } from '../pages/admin/AdminRolesPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminMediaPage } from '../pages/admin/AdminMediaPage';
import { AdminAlbumsListPage } from '../pages/admin/AdminAlbumsListPage';
import { AdminAlbumEditorPage } from '../pages/admin/AdminAlbumEditorPage';
import { AdminPagesListPage } from '../pages/admin/AdminPagesListPage';
import { AdminPageEditorPage } from '../pages/admin/AdminPageEditorPage';
import { AdminMenusPage } from '../pages/admin/AdminMenusPage';
import { AdminSeoSettingsPage } from '../pages/admin/AdminSeoSettingsPage';
import { AdminAuditPage } from '../pages/admin/AdminAuditPage';
import { SetupWizardPage } from '../pages/setup/SetupWizardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { FoundationShowcase } from '../pages/FoundationShowcase';
import { PublicAlbumsListPage } from '../pages/public/PublicAlbumsListPage';
import { PublicAlbumDetailPage } from '../pages/public/PublicAlbumDetailPage';
import { PublicPage } from '../pages/public/PublicPage';
import { NotFoundState } from '../components/common/NotFoundState';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { ModuleGuard } from '../components/guards/ModuleGuard';
import { SetupGuard } from '../components/guards/SetupGuard';
import { AccessDeniedPage } from '../pages/common/AccessDeniedPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Setup Wizard Route - Protected by SetupGuard (locks when is_completed = true) */}
      <Route
        path="/setup"
        element={
          <SetupGuard>
            <SetupWizardPage />
          </SetupGuard>
        }
      />

      {/* Public Shell Routes */}
      <Route element={<PublicShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home-demo" element={<HomePageDemo />} />
        <Route
          path="/news"
          element={
            <ModuleGuard moduleKey="news" moduleName="Tin tức & Bài viết">
              <NewsListPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/news/search"
          element={
            <ModuleGuard moduleKey="news" moduleName="Tin tức & Bài viết">
              <NewsSearchPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/news/:slug"
          element={
            <ModuleGuard moduleKey="news" moduleName="Tin tức & Bài viết">
              <NewsDetailPage />
            </ModuleGuard>
          }
        />
        <Route path="/about" element={<GenericPageDemo />} />
        <Route
          path="/documents"
          element={
            <ModuleGuard moduleKey="documents" moduleName="Văn bản - Tài liệu">
              <DocumentsPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/tai-lieu"
          element={
            <ModuleGuard moduleKey="documents" moduleName="Văn bản - Tài liệu">
              <DocumentsPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/thong-bao"
          element={
            <ModuleGuard moduleKey="announcements" moduleName="Thông báo điều hành">
              <AnnouncementsPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/announcements"
          element={
            <ModuleGuard moduleKey="announcements" moduleName="Thông báo điều hành">
              <AnnouncementsPage />
            </ModuleGuard>
          }
        />
        <Route path="/activities" element={<GenericPageDemo />} />
        <Route path="/admissions" element={<GenericPageDemo />} />

        {/* Public Albums & Gallery Routes */}
        <Route
          path="/albums"
          element={
            <ModuleGuard moduleKey="albums" moduleName="Thư viện ảnh">
              <PublicAlbumsListPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/albums/:slug"
          element={
            <ModuleGuard moduleKey="albums" moduleName="Thư viện ảnh">
              <PublicAlbumDetailPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/gallery"
          element={
            <ModuleGuard moduleKey="albums" moduleName="Thư viện ảnh">
              <PublicAlbumsListPage />
            </ModuleGuard>
          }
        />
        <Route
          path="/gallery/:slug"
          element={
            <ModuleGuard moduleKey="albums" moduleName="Thư viện ảnh">
              <PublicAlbumDetailPage />
            </ModuleGuard>
          }
        />

        {/* Public Static Pages Dynamic Route */}
        <Route
          path="/page/:slug"
          element={
            <ModuleGuard moduleKey="pages" moduleName="Trang tĩnh">
              <PublicPage />
            </ModuleGuard>
          }
        />

        <Route path="/contact" element={<GenericPageDemo />} />
      </Route>

      {/* Auth Shell Route */}
      <Route
        path="/login"
        element={
          <AuthShell>
            <LoginPage />
          </AuthShell>
        }
      />

      {/* 403 Forbidden Route */}
      <Route path="/forbidden" element={<AccessDeniedPage />} />

      {/* Admin Shell Routes - Authoritatively Protected by ProtectedRoute */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardDemo />} />

        {/* System Settings & Module Management */}
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredPermission="settings.view">
              <ModuleGuard moduleKey="settings" moduleName="Cấu hình hệ thống">
                <AdminSettingsPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* System Health Check Dashboard */}
        <Route
          path="health"
          element={
            <ProtectedRoute requiredPermission="health.view">
              <ModuleGuard moduleKey="health" moduleName="Kiểm tra hệ thống">
                <AdminHealthPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* RBAC Roles View */}
        <Route
          path="roles"
          element={
            <ProtectedRoute requiredPermission="users.edit">
              <ModuleGuard moduleKey="roles" moduleName="Vai trò & Phân quyền">
                <AdminRolesPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="roles/*"
          element={
            <ProtectedRoute requiredPermission="users.edit">
              <ModuleGuard moduleKey="roles" moduleName="Vai trò & Phân quyền">
                <AdminRolesPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* Staff & Users View */}
        <Route
          path="users"
          element={
            <ProtectedRoute requiredPermission="users.view">
              <ModuleGuard moduleKey="users" moduleName="Tài khoản & Cán bộ">
                <AdminUsersPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="users/*"
          element={
            <ProtectedRoute requiredPermission="users.view">
              <ModuleGuard moduleKey="users" moduleName="Tài khoản & Cán bộ">
                <AdminUsersPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* News Module CMS Routes */}
        <Route
          path="news"
          element={
            <ProtectedRoute requiredPermission="news.view">
              <ModuleGuard moduleKey="news" moduleName="Tin tức & Bài viết">
                <AdminNewsListPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="news/new"
          element={
            <ProtectedRoute requiredPermission="news.create">
              <ModuleGuard moduleKey="news" moduleName="Tin tức & Bài viết">
                <AdminNewsEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="news/:id/edit"
          element={
            <ProtectedRoute requiredPermission="news.create">
              <ModuleGuard moduleKey="news" moduleName="Tin tức & Bài viết">
                <AdminNewsEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="categories"
          element={
            <ProtectedRoute requiredPermission="news.create">
              <ModuleGuard moduleKey="categories" moduleName="Chuyên mục tin">
                <AdminCategoriesPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="tags"
          element={
            <ProtectedRoute requiredPermission="news.create">
              <ModuleGuard moduleKey="news" moduleName="Thẻ tag tin tức">
                <AdminTagsPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        {/* Announcements Module CMS Routes */}
        <Route
          path="announcements"
          element={
            <ProtectedRoute requiredPermission={['announcements.view', 'announcements.create']}>
              <ModuleGuard moduleKey="announcements" moduleName="Thông báo điều hành">
                <AdminAnnouncementsListPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="announcements/new"
          element={
            <ProtectedRoute requiredPermission="announcements.create">
              <ModuleGuard moduleKey="announcements" moduleName="Thông báo điều hành">
                <AdminAnnouncementEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="announcements/:id/edit"
          element={
            <ProtectedRoute requiredPermission={['announcements.edit', 'announcements.create']}>
              <ModuleGuard moduleKey="announcements" moduleName="Thông báo điều hành">
                <AdminAnnouncementEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        {/* Documents Module CMS Routes */}
        <Route
          path="documents"
          element={
            <ProtectedRoute requiredPermission="documents.view">
              <ModuleGuard moduleKey="documents" moduleName="Văn bản - Tài liệu">
                <AdminDocumentsListPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="documents/new"
          element={
            <ProtectedRoute requiredPermission="documents.create">
              <ModuleGuard moduleKey="documents" moduleName="Văn bản - Tài liệu">
                <AdminDocumentEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="documents/:id/edit"
          element={
            <ProtectedRoute requiredPermission="documents.create">
              <ModuleGuard moduleKey="documents" moduleName="Văn bản - Tài liệu">
                <AdminDocumentEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        {/* Media Module CMS Routes */}
        <Route
          path="media"
          element={
            <ProtectedRoute requiredPermission="media.view">
              <ModuleGuard moduleKey="media" moduleName="Thư viện hình ảnh">
                <AdminMediaPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="media/*"
          element={
            <ProtectedRoute requiredPermission="media.view">
              <ModuleGuard moduleKey="media" moduleName="Thư viện hình ảnh">
                <AdminMediaPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        {/* Album Module CMS Routes */}
        <Route
          path="albums"
          element={
            <ProtectedRoute requiredPermission="media.view">
              <ModuleGuard moduleKey="media" moduleName="Bộ sưu tập Album">
                <AdminAlbumsListPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="albums/new"
          element={
            <ProtectedRoute requiredPermission="media.edit">
              <ModuleGuard moduleKey="media" moduleName="Bộ sưu tập Album">
                <AdminAlbumEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="albums/:id/edit"
          element={
            <ProtectedRoute requiredPermission="media.edit">
              <ModuleGuard moduleKey="media" moduleName="Bộ sưu tập Album">
                <AdminAlbumEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        {/* Pages Module CMS Routes */}
        <Route
          path="pages"
          element={
            <ProtectedRoute requiredPermission="pages.view">
              <ModuleGuard moduleKey="pages" moduleName="Trang thông tin tĩnh">
                <AdminPagesListPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="pages/new"
          element={
            <ProtectedRoute requiredPermission="pages.create">
              <ModuleGuard moduleKey="pages" moduleName="Trang thông tin tĩnh">
                <AdminPageEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="pages/:id/edit"
          element={
            <ProtectedRoute requiredPermission={['pages.edit', 'pages.create']}>
              <ModuleGuard moduleKey="pages" moduleName="Trang thông tin tĩnh">
                <AdminPageEditorPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="menus"
          element={
            <ProtectedRoute requiredPermission="settings.view">
              <ModuleGuard moduleKey="menu" moduleName="Menu & Điều hướng">
                <AdminMenusPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="menus/*"
          element={
            <ProtectedRoute requiredPermission="settings.view">
              <ModuleGuard moduleKey="menu" moduleName="Menu & Điều hướng">
                <AdminMenusPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="seo"
          element={
            <ProtectedRoute requiredPermission="settings.view">
              <ModuleGuard moduleKey="seo" moduleName="Cấu hình SEO & MXH">
                <AdminSeoSettingsPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="seo/*"
          element={
            <ProtectedRoute requiredPermission="settings.view">
              <ModuleGuard moduleKey="seo" moduleName="Cấu hình SEO & MXH">
                <AdminSeoSettingsPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="homepage/*"
          element={
            <ModuleGuard moduleKey="homepage" moduleName="Giao diện trang chủ">
              <ProtectedRoute requiredPermission="homepage.view">
                <AdminHomepagePage />
              </ProtectedRoute>
            </ModuleGuard>
          }
        />
        {/* Audit & Security Log Routes */}
        <Route
          path="audit"
          element={
            <ProtectedRoute requiredPermission="audit.view">
              <ModuleGuard moduleKey="audit" moduleName="Nhật ký hoạt động">
                <AdminAuditPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="audit/*"
          element={
            <ProtectedRoute requiredPermission="audit.view">
              <ModuleGuard moduleKey="audit" moduleName="Nhật ký hoạt động">
                <AdminAuditPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="logs"
          element={
            <ProtectedRoute requiredPermission="audit.view">
              <ModuleGuard moduleKey="audit" moduleName="Nhật ký hoạt động">
                <AdminAuditPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="logs/*"
          element={
            <ProtectedRoute requiredPermission="audit.view">
              <ModuleGuard moduleKey="audit" moduleName="Nhật ký hoạt động">
                <AdminAuditPage />
              </ModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* Fallback for admin subroutes */}
        <Route path="*" element={<AdminDashboardDemo />} />
      </Route>

      {/* Foundation & Design System Verification (Step 01 QA Audit) */}
      <Route path="/foundation" element={<FoundationShowcase />} />

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <PublicShell>
            <div className="py-12 px-4 max-w-xl mx-auto">
              <NotFoundState />
            </div>
          </PublicShell>
        }
      />
    </Routes>
  );
}
