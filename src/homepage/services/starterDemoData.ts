/**
 * Starter Demo Data Provider
 * Provides realistic demo content for starter blocks in Step 04 (Homepage Builder Foundation)
 * strictly WITHOUT creating future CRUD modules (News, Announcements, Documents).
 */

export interface DemoNewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

export interface DemoAnnouncementItem {
  id: string;
  title: string;
  date: string;
  sender: string;
  isUrgent?: boolean;
  target?: string;
}

export interface DemoDocumentItem {
  id: string;
  code: string;
  title: string;
  issuedDate: string;
  issuer: string;
  fileType: string;
  fileSize: string;
}

export const DEMO_NEWS_ITEMS: DemoNewsItem[] = [
  {
    id: 'demo-n-1',
    title: 'Lễ Khai giảng Năm học Mới & Phát động Phong trào Thi đua Dạy tốt - Học tốt',
    excerpt: 'Nhà trường long trọng tổ chức lễ khai giảng trong không khí hân hoan, đón chào hơn 600 tân học sinh khóa mới bước vào năm học với nhiều kỳ vọng đổi mới sáng tạo.',
    category: 'Sự kiện nhà trường',
    publishedAt: '05/09/2026',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  },
  {
    id: 'demo-n-2',
    title: 'Đoàn học sinh nhà trường đạt giải Nhất tại Hội thi Khoa học Kỹ thuật cấp Tỉnh',
    excerpt: 'Dự án ứng dụng trí tuệ nhân tạo hỗ trợ học tập của nhóm học sinh lớp 11A1 đã xuất sắc giành giải Nhất toàn đoàn và được chọn tham dự vòng quốc gia.',
    category: 'Thành tích học tập',
    publishedAt: '28/08/2026',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  {
    id: 'demo-n-3',
    title: 'Hội thảo Chuyên môn Đổi mới Phương pháp Giảng dạy theo Chương trình GDPT 2018',
    excerpt: 'Tập thể cán bộ giáo viên các tổ bộ môn thảo luận sâu về phương pháp đánh giá năng lực học sinh và tích hợp công nghệ chuyển đổi số vào từng tiết học.',
    category: 'Hoạt động chuyên môn',
    publishedAt: '20/08/2026',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  {
    id: 'demo-n-4',
    title: 'Giải bóng đá Nam - Nữ học sinh truyền thống Chào mừng Ngày Nhà giáo Việt Nam',
    excerpt: 'Khai mạc giải thể thao thường niên thu hút hơn 30 đội bóng đại diện các chi đoàn tham gia tranh tài trong tinh thần đoàn kết, rèn luyện thể chất.',
    category: 'Đoàn - Đội phong trào',
    publishedAt: '15/08/2026',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  {
    id: 'demo-n-5',
    title: 'Tập huấn Chuyển đổi số và An toàn Không gian mạng cho cán bộ giáo viên',
    excerpt: 'Trang bị kỹ năng bảo mật dữ liệu, khai thác kho học liệu điện tử phục vụ công tác giảng dạy và tương tác trực tuyến cùng phụ huynh học sinh.',
    category: 'Chuyển đổi số',
    publishedAt: '10/08/2026',
    isFeatured: false,
  },
  {
    id: 'demo-n-6',
    title: 'Chương trình Tình nguyện Mùa hè Xanh và trao học bổng cho học sinh vượt khó',
    excerpt: 'Đoàn trường phối hợp cùng Ban đại diện CMHS trao tặng 45 suất học bổng tiếp sức đến trường cho các em học sinh có hoàn cảnh khó khăn.',
    category: 'Công tác xã hội',
    publishedAt: '02/08/2026',
    isFeatured: false,
  },
];

export const DEMO_ANNOUNCEMENTS: DemoAnnouncementItem[] = [
  {
    id: 'demo-a-1',
    title: 'Kế hoạch tổ chức Tuần sinh hoạt công dân - học sinh đầu khóa',
    date: '30/08/2026',
    sender: 'Ban Giám hiệu',
    isUrgent: true,
    target: 'Toàn thể học sinh khối 10',
  },
  {
    id: 'demo-a-2',
    title: 'Lịch kiểm tra sức khỏe đầu năm học và phát đồng phục học sinh',
    date: '25/08/2026',
    sender: 'Y tế học đường',
    isUrgent: false,
    target: 'Các lớp 10, 11, 12',
  },
  {
    id: 'demo-a-3',
    title: 'Thông báo về việc đăng ký tham gia các Câu lạc bộ học thuật và năng khiếu',
    date: '20/08/2026',
    sender: 'Đoàn Thanh niên',
    isUrgent: false,
    target: 'Học sinh toàn trường',
  },
  {
    id: 'demo-a-4',
    title: 'Lịch họp Ban đại diện Cha mẹ học sinh toàn trường phiên đầu năm',
    date: '18/08/2026',
    sender: 'Văn phòng nhà trường',
    isUrgent: false,
    target: 'Phụ huynh các lớp',
  },
];

export const DEMO_DOCUMENTS: DemoDocumentItem[] = [
  {
    id: 'demo-d-1',
    code: '128/QĐ-THPT',
    title: 'Quyết định ban hành Kế hoạch Giáo dục Nhà trường Năm học 2026 - 2027',
    issuedDate: '28/08/2026',
    issuer: 'Hiệu trưởng',
    fileType: 'PDF',
    fileSize: '1.8 MB',
  },
  {
    id: 'demo-d-2',
    code: '45/KH-THPT',
    title: 'Kế hoạch triển khai công tác Kiểm định chất lượng giáo dục chu kỳ mới',
    issuedDate: '22/08/2026',
    issuer: 'Hội đồng Kiểm định',
    fileType: 'PDF',
    fileSize: '850 KB',
  },
  {
    id: 'demo-d-3',
    code: '12/TB-VP',
    title: 'Quy định quản lý nền nếp, chuyên cần và bảo quản tài sản phòng học chức năng',
    issuedDate: '15/08/2026',
    issuer: 'Văn phòng',
    fileType: 'DOCX',
    fileSize: '320 KB',
  },
  {
    id: 'demo-d-4',
    code: '08/BM-ĐT',
    title: 'Mẫu phiếu đăng ký môn học tự chọn và chuyên đề học tập lớp 10',
    issuedDate: '10/08/2026',
    issuer: 'Tổ Giáo vụ',
    fileType: 'DOCX',
    fileSize: '180 KB',
  },
];
