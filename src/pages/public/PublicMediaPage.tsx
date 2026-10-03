import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  Images,
  Film,
  FileText,
  Search,
  Eye,
  Calendar,
  Download,
  Play,
  X,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { usePublicAlbums } from '../../modules/media/hooks/usePublicAlbums';
import {
  INITIAL_SEED_VIDEOS,
  INITIAL_SEED_DOCS,
  VideoResourceItem,
  DocumentResourceItem,
} from '../../data/seedMediaData';
import { PublicAlbumCard } from '../../modules/media/components/PublicAlbumCard';
import { Badge } from '../../components/ui/Badge';

export function PublicMediaPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'doc'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoResourceItem | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResourceItem | null>(null);

  // Fetch albums from hook (falls back to seed data if database is empty)
  const { albums, isLoading } = usePublicAlbums({ pageSize: 20 });

  // Filter items according to search query
  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    const q = searchQuery.toLowerCase().trim();
    return albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }, [albums, searchQuery]);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_SEED_VIDEOS;
    const q = searchQuery.toLowerCase().trim();
    return INITIAL_SEED_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_SEED_DOCS;
    const q = searchQuery.toLowerCase().trim();
    return INITIAL_SEED_DOCS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalResultsCount =
    (activeTab === 'all' || activeTab === 'image' ? filteredAlbums.length : 0) +
    (activeTab === 'all' || activeTab === 'video' ? filteredVideos.length : 0) +
    (activeTab === 'all' || activeTab === 'doc' ? filteredDocs.length : 0);

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 gap-1.5">
          <Link to="/" className="hover:text-[#003B8E] flex items-center gap-1 transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900">Thư viện Media</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-[#002b66] via-[#003B8E] to-[#0284c7] text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-xs font-bold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>HỌC LIỆU SỐ & KHOẢNH KHẮC HỌC ĐƯỜNG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              Thư viện Đa phương tiện
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
              Cổng lưu trữ tài nguyên số chính thức của Trường THCS & THPT Vĩnh Phong bao gồm: Album hình ảnh các sự kiện giáo dục, video phóng sự học đường và tài liệu ôn tập, học liệu điện tử chất lượng cao.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
            <Layers className="h-72 w-72 text-white" />
          </div>
        </div>

        {/* Filter Controls: Tabs & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#003B8E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Tất cả tài nguyên</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'image'
                    ? 'bg-[#003B8E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Images className="h-4 w-4" />
                <span>📷 Album Hình ảnh ({filteredAlbums.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#003B8E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Film className="h-4 w-4" />
                <span>🎬 Video clip ({filteredVideos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('doc')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'doc'
                    ? 'bg-[#003B8E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>📁 Tài liệu & Học liệu ({filteredDocs.length})</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài nguyên, album..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B8E] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: ALBUM HÌNH ẢNH */}
        {(activeTab === 'all' || activeTab === 'image') && filteredAlbums.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#003B8E] flex items-center justify-center">
                  <Images className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                    Album Hình ảnh & Hoạt động
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kho lưu trữ hình ảnh sinh động các sự kiện, lễ hội và phong trào trường lớp
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredAlbums.map((album) => (
                <PublicAlbumCard
                  key={album.id}
                  album={album}
                  basePath="/media"
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: VIDEO CLIP & PHÓNG SỰ */}
        {(activeTab === 'all' || activeTab === 'video') && filteredVideos.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                    Video & Phóng sự Học đường
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bản tin truyền hình học đường, hội thi văn nghệ và tư liệu giáo dục
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                >
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[11px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{video.duration}</span>
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {video.publishedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views.toLocaleString()} lượt xem
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                        {video.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {video.author}
                      </span>
                      <span className="text-xs font-bold text-[#003B8E] group-hover:underline inline-flex items-center gap-1">
                        <span>Xem video</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: TÀI LIỆU & HỌC LIỆU SỐ */}
        {(activeTab === 'all' || activeTab === 'doc') && filteredDocs.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                    Tài liệu & Học liệu số
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cẩm nang ôn thi tốt nghiệp, sổ tay kỹ năng sống và kỷ yếu truyền thống
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all p-5 flex flex-col justify-between group cursor-pointer space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        {doc.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-red-100 text-red-700 font-mono text-[10px] font-bold">
                        {doc.fileFormat} {doc.fileSize}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                      {doc.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[10px] text-slate-400">
                      <div>{doc.author}</div>
                      <div className="mt-0.5">{doc.publishedAt}</div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#003B8E] group-hover:bg-[#003B8E] group-hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Tải về</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty Search State */}
        {totalResultsCount === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              Không tìm thấy tài nguyên phù hợp với từ khóa "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-500">
              Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc tìm kiếm.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
            >
              Xem tất cả tài nguyên
            </button>
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full bg-black relative">
              <video
                src={selectedVideo.videoUrl}
                poster={selectedVideo.thumbnail}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Trình duyệt của bạn không hỗ trợ phát thẻ video.
              </video>
            </div>

            {/* Video Description */}
            <div className="p-5 sm:p-6 text-white space-y-2 bg-slate-900">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Thời lượng: {selectedVideo.duration}</span>
                <span>•</span>
                <span>{selectedVideo.publishedAt}</span>
                <span>•</span>
                <span>{selectedVideo.views.toLocaleString()} lượt xem</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                    {selectedDoc.fileFormat} • {selectedDoc.fileSize}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {selectedDoc.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedDoc.description}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block">Đơn vị ban hành / tác giả:</span>
                <span className="font-semibold text-slate-800">{selectedDoc.author}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Ngày phát hành:</span>
                <span className="font-semibold text-slate-800">{selectedDoc.publishedAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Chuyên mục:</span>
                <span className="font-semibold text-slate-800">{selectedDoc.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Lượt tải về:</span>
                <span className="font-semibold text-slate-800">
                  {selectedDoc.downloads.toLocaleString()} lượt
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                  `TÀI LIỆU TRƯỜNG THCS & THPT VĨNH PHONG\n\nTiêu đề: ${selectedDoc.title}\nTác giả: ${selectedDoc.author}\nNgày: ${selectedDoc.publishedAt}\n\nNội dung tóm tắt:\n${selectedDoc.description}`
                )}`}
                download={`${selectedDoc.slug}.txt`}
                className="px-5 py-2 rounded-xl bg-[#003B8E] hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải tài liệu ({selectedDoc.fileSize})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
