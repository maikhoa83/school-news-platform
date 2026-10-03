import { NewsItem } from '../types/news';
import { INITIAL_CATEGORIES } from '../services/categoryService';
import { INITIAL_TAGS } from '../services/tagService';

/**
 * 14 authentic seed news items for Trường THCS & THPT Vĩnh Phong
 * Exactly 2 articles per sub-category across all 7 sub-categories
 */
export const INITIAL_PUBLISHED_NEWS: NewsItem[] = [
  // 1.1 Hoạt động chuyên môn - Bài 1 (Xuất hiện ở khối Hoạt động nhà trường nổi bật)
  {
    id: 'news-00000000-0000-0000-0000-000000000001',
    title: 'Sinh hoạt chuyên môn cụm trường lần thứ II năm học 2024 – 2025',
    slug: 'sinh-hoat-chuyen-mon-cum-truong-lan-thu-ii-nam-hoc-2024-2025',
    excerpt:
      'Ngày 27/05/2025, Trường THCS & THPT Vĩnh Phong đã tổ chức sinh hoạt chuyên môn cụm trường lần thứ II năm học 2024 – 2025. Chương trình nhằm chia sẻ kinh nghiệm, đổi mới phương pháp giảng dạy và nâng cao chất lượng giáo dục.',
    content: `
      <h2>1. Tăng cường giao lưu và chia sẻ chuyên môn sư phạm</h2>
      <p>Nhằm thực hiện hiệu quả Chương trình Giáo dục phổ thông 2018, ngày 27/05/2025, Trường THCS & THPT Vĩnh Phong đã đăng cai tổ chức buổi sinh hoạt chuyên môn cụm trường lần thứ II năm học 2024 – 2025 với sự tham gia của các trường THCS và THPT trong huyện Vĩnh Thuận.</p>
      <h2>2. Nội dung các tiết dạy thể nghiệm minh họa</h2>
      <p>Các tổ chuyên môn Toán - Tin, Ngữ văn, Khoa học Tự nhiên và Tiếng Anh đã tiến hành các tiết dạy minh họa có ứng dụng công nghệ thông tin và học liệu số thông minh, chú trọng phát triển phẩm chất và năng lực tự học của học sinh.</p>
      <h2>3. Thảo luận và thống nhất giải pháp nâng cao chất lượng dạy học</h2>
      <p>Đại diện các trường tham dự đã tích cực đóng góp ý kiến, trao đổi về công tác kiểm tra đánh giá theo định hướng mới, chia sẻ ngân hàng câu hỏi và phương pháp bồi dưỡng học sinh mũi nhọn.</p>
    `,
    thumbnail: '/education_slide_study.jpg',
    category_id: 'cat-00000000-0000-0000-0000-000000000011',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Tổ Chuyên môn Nhà trường',
    status: 'published',
    is_featured: true,
    is_highlight: true,
    view_count: 1420,
    published_at: '2025-05-27T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-27T07:30:00.000Z',
    updated_at: '2025-05-27T08:00:00.000Z',
    category: INITIAL_CATEGORIES[0]?.children?.[0],
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[2]],
  },
  // 1.1 Hoạt động chuyên môn - Bài 2
  {
    id: 'news-00000000-0000-0000-0000-000000000002',
    title: 'Đổi mới phương pháp dạy học và kiểm tra đánh giá theo Chương trình GDPT 2018',
    slug: 'doi-moi-phuong-phap-day-hoc-va-kiem-tra-danh-gia-theo-chuong-trinh-gdpt-2018',
    excerpt:
      'Hội đồng sư phạm nhà trường tổ chức hội thảo chuyên đề về xây dựng ma trận đề kiểm tra định kỳ và tổ chức hoạt động trải nghiệm sáng tạo cho học sinh các khối lớp.',
    content: `
      <h2>1. Mục tiêu đổi mới phương pháp giảng dạy</h2>
      <p>Buổi hội thảo tập trung làm rõ các yêu cầu cần đạt theo chuẩn chương trình mới, chú trọng chuyển từ truyền thụ kiến thức một chiều sang hướng dẫn học sinh chủ động khám phá, giải quyết vấn đề.</p>
      <h2>2. Xây dựng ngân hàng đề kiểm tra đánh giá năng lực</h2>
      <p>Các tổ bộ môn hoàn thành việc thẩm định và bổ sung ngân hàng câu hỏi mở, gắn lý thuyết với thực tiễn sản xuất, đời sống tại địa phương huyện Vĩnh Thuận.</p>
    `,
    thumbnail: '/education_slide_growth.jpg',
    category_id: 'cat-00000000-0000-0000-0000-000000000011',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban Giám hiệu',
    status: 'published',
    is_featured: false,
    is_highlight: false,
    view_count: 680,
    published_at: '2025-05-15T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-15T07:00:00.000Z',
    updated_at: '2025-05-15T08:00:00.000Z',
    category: INITIAL_CATEGORIES[0]?.children?.[0],
    tags: [INITIAL_TAGS[1]],
  },

  // 1.2 Hoạt động đoàn thể - Bài 1
  {
    id: 'news-00000000-0000-0000-0000-000000000003',
    title: 'Đoàn trường tổ chức chương trình "Tiếp sức mùa thi 2025"',
    slug: 'doan-truong-to-chuc-chuong-trinh-tiep-suc-mua-thi-2025',
    excerpt:
      'Đoàn trường THCS & THPT Vĩnh Phong thành lập các đội hình thanh niên tình nguyện hỗ trợ nước uống, hướng dẫn sơ đồ phòng thi và động viên tinh thần thí sinh tham dự kỳ thi tốt nghiệp.',
    content: `
      <h2>1. Tinh thần xung kích của tuổi trẻ học đường</h2>
      <p>Chiến dịch Tiếp sức mùa thi năm 2025 được Đoàn trường phát động với sự tham gia nhiệt tình của hơn 50 đoàn viên, thanh niên học sinh khối 10 và 11.</p>
      <h2>2. Các hoạt động đồng hành cùng thí sinh</h2>
      <p>Các đội hình tình nguyện đã bố trí điểm phát nước suối miễn phí, che dù đưa đón thí sinh khi trời mưa, đảm bảo trật tự an toàn giao thông tại cổng trường.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000012',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Đoàn Thanh niên',
    status: 'published',
    is_featured: true,
    is_highlight: true,
    view_count: 980,
    published_at: '2025-05-26T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-26T07:00:00.000Z',
    updated_at: '2025-05-26T08:00:00.000Z',
    category: INITIAL_CATEGORIES[0]?.children?.[1],
    tags: [INITIAL_TAGS[0]],
  },
  // 1.2 Hoạt động đoàn thể - Bài 2
  {
    id: 'news-00000000-0000-0000-0000-000000000004',
    title: 'Trường tổ chức giao lưu thể thao chào mừng ngày 30/4 – 1/5',
    slug: 'truong-to-chuc-giao-luu-the-thao-chao-mung-ngay-30-4-1-5',
    excerpt:
      'Công đoàn phối hợp cùng Đoàn trường tổ chức giải bóng chuyền hơi và thi đấu cầu lông cho cán bộ giáo viên, nhân viên nhà trường nhân dịp kỷ niệm ngày Giải phóng miền Nam.',
    content: `
      <h2>1. Sôi nổi phong trào rèn luyện thể dục thể thao</h2>
      <p>Hoạt động giao lưu thể thao là dịp để các thầy cô giáo giao lưu, tăng cường thể lực và tình đoàn kết gắn bó sau những giờ lên lớp miệt mài.</p>
      <h2>2. Kết quả các trận thi đấu</h2>
      <p>Sau 2 ngày tranh tài sôi nổi, giải Nhất bóng chuyền hơi đã thuộc về liên quân Tổ Toán - Tin và Tổ KHTN.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000012',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Công đoàn trường',
    status: 'published',
    is_featured: false,
    is_highlight: false,
    view_count: 530,
    published_at: '2025-04-28T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-28T07:00:00.000Z',
    updated_at: '2025-04-28T08:00:00.000Z',
    category: INITIAL_CATEGORIES[0]?.children?.[1],
    tags: [INITIAL_TAGS[3]],
  },

  // 2.1 Điểm tin giáo dục - Bài 1 (Tin tiêu điểm & nổi bật lớn nhất trang chủ)
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai',
    slug: 'le-tong-ket-nam-hoc-2024-2025',
    excerpt:
      'Sáng ngày 29/05/2025, Trường THCS & THPT Vĩnh Phong đã long trọng tổ chức Lễ tổng kết năm học 2024 – 2025. Buổi lễ là dịp để thầy và trò cùng nhìn lại một chặng đường nỗ lực, phấn đấu và ghi nhận những thành tích nổi bật trong năm học vừa qua...',
    content: `
      <h2>1. Nhìn lại chặng đường vẻ vang đã qua</h2>
      <p>Năm học 2024 – 2025 là một năm học đầy nỗ lực và nhiều dấu ấn của thầy và trò Trường THCS & THPT Vĩnh Phong. Với sự quan tâm, chỉ đạo sát sao của Ban Giám hiệu, sự đồng hành của phụ huynh và tinh thần đoàn kết, trách nhiệm của toàn thể cán bộ, giáo viên, học sinh, nhà trường đã đạt được nhiều thành tích đáng khích lệ trong học tập, rèn luyện và các hoạt động phong trào.</p>
      <h2>2. Vinh danh những bông hoa đẹp trong vườn hoa học tốt</h2>
      <p>Tại buổi lễ, nhà trường đã tuyên dương, khen thưởng các tập thể, cá nhân có thành tích xuất sắc trong kỳ thi học sinh giỏi, các hội thao thể dục thể thao và các hoạt động tình nguyện vì cộng đồng.</p>
      <h2>3. Kỳ vọng vào chặng đường mới</h2>
      <p>Lễ tổng kết khép lại trong không khí trang trọng, ấm áp và đầy cảm xúc. Những nụ cười rạng rỡ của học sinh là minh chứng cho một năm học thành công, mở ra hành trình mới với nhiều kỳ vọng.</p>
    `,
    thumbnail: '/campus_facade.jpg',
    category_id: 'cat-00000000-0000-0000-0000-000000000021',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban Truyền thông',
    status: 'published',
    is_featured: true,
    is_highlight: true,
    view_count: 2450,
    published_at: '2025-05-29T08:30:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-29T08:00:00.000Z',
    updated_at: '2025-05-29T08:30:00.000Z',
    category: INITIAL_CATEGORIES[1]?.children?.[0],
    tags: INITIAL_TAGS.slice(0, 3),
  },
  // 2.1 Điểm tin giáo dục - Bài 2 (Tin Truyền thông lớn)
  {
    id: 'news-00000000-0000-0000-0000-000000000006',
    title: 'Hội thi chuyên môn và sinh hoạt văn nghệ chào mừng ngày truyền thống nhà trường',
    slug: 'hoi-thi-chuyen-mon-va-sinh-hoat-van-nghe-chao-mung-ngay-truyen-thong-nha-truong',
    excerpt:
      'Phong trào thi đua là sân chơi bổ ích, tạo cơ hội để học sinh thể hiện tài năng, nuôi dưỡng niềm đam mê nghệ thuật và tăng cường sự đoàn kết, gắn bó trong toàn trường.',
    content: `
      <h2>1. Sắc màu văn nghệ học đường tươi sáng</h2>
      <p>Ngày 24/05/2025, Hội diễn văn nghệ chào mừng ngày truyền thống nhà trường đã diễn ra với sự tham gia của hàng trăm tiết mục ca múa nhạc đặc sắc ngợi ca quê hương, thầy cô và mái trường.</p>
      <h2>2. Lan tỏa giá trị nhân văn và tinh thần học hỏi</h2>
      <p>Các tiết mục kịch ngắn về lịch sử nhà trường và lòng biết ơn cha mẹ đã để lại nhiều ấn tượng sâu sắc, xúc động trong lòng các đại biểu và phụ huynh tham dự.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000021',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban Truyền thông',
    status: 'published',
    is_featured: true,
    is_highlight: true,
    view_count: 1890,
    published_at: '2025-05-24T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-24T07:00:00.000Z',
    updated_at: '2025-05-24T08:00:00.000Z',
    category: INITIAL_CATEGORIES[1]?.children?.[0],
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[2]],
  },

  // 2.2 Gương sáng GD - Bài 1
  {
    id: 'news-00000000-0000-0000-0000-000000000007',
    title: 'Giáo viên nhà trường đạt danh hiệu Giáo viên giỏi cấp Tỉnh',
    slug: 'giao-vien-nha-truong-dat-danh-hieu-giao-vien-gioi-cap-tinh',
    excerpt:
      'Nhiệt liệt chúc mừng các thầy cô giáo tiêu biểu của Trường THCS & THPT Vĩnh Phong đã xuất sắc vượt qua các vòng thi và được công nhận Giáo viên dạy giỏi cấp Tỉnh năm học 2024 – 2025.',
    content: `
      <h2>1. Niềm vinh dự và tự hào của nhà trường</h2>
      <p>Sở Giáo dục và Đào tạo tỉnh Kiên Giang vừa công bố kết quả Hội thi Giáo viên dạy giỏi cấp tỉnh năm học 2024 – 2025. Trường THCS & THPT Vĩnh Phong vinh dự có 4 giáo viên được vinh danh.</p>
      <h2>2. Tinh thần trách nhiệm và lòng yêu nghề</h2>
      <p>Các thầy cô giáo đã đem đến hội thi những tiết dạy sáng tạo, ứng dụng phương pháp dạy học tích cực, tạo hứng thú cho học sinh và được Hội đồng giám khảo đánh giá cao.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000022',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban Thi đua',
    status: 'published',
    is_featured: true,
    is_highlight: false,
    view_count: 1120,
    published_at: '2025-04-10T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-10T07:00:00.000Z',
    updated_at: '2025-04-10T08:00:00.000Z',
    category: INITIAL_CATEGORIES[1]?.children?.[1],
    tags: [INITIAL_TAGS[1]],
  },
  // 2.2 Gương sáng GD - Bài 2
  {
    id: 'news-00000000-0000-0000-0000-000000000008',
    title: 'Học sinh tham gia hội thi Khoa học Kỹ thuật và đạt giải Nhì cấp Tỉnh',
    slug: 'hoc-sinh-tham-gia-hoi-thi-khoa-hoc-ky-thuat',
    excerpt:
      'Dự án nghiên cứu giải pháp bảo vệ nguồn nước ngọt vùng nhiễm mặn của nhóm học sinh khối 11 đã xuất sắc đạt giải Nhì cuộc thi KHKT dành cho học sinh trung học cấp tỉnh.',
    content: `
      <h2>1. Tinh thần đam mê nghiên cứu khoa học từ ghế nhà trường</h2>
      <p>Dưới sự hướng dẫn tận tình của giáo viên Tổ KHTN, nhóm học sinh đã dành nhiều tháng nghiên cứu, thử nghiệm các mô hình lọc nước thông minh phục vụ cộng đồng địa phương.</p>
      <h2>2. Ý nghĩa thực tiễn của đề tài</h2>
      <p>Ban giám khảo đánh giá cao tính khả thi, chi phí thấp và khả năng ứng dụng thực tế của dự án đối với đời sống nhân dân vùng sông nước Kiên Giang.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000022',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'CLB Nghiên cứu Khoa học',
    status: 'published',
    is_featured: true,
    is_highlight: false,
    view_count: 890,
    published_at: '2025-05-24T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-24T07:00:00.000Z',
    updated_at: '2025-05-24T08:00:00.000Z',
    category: INITIAL_CATEGORIES[1]?.children?.[1],
    tags: [INITIAL_TAGS[1]],
  },

  // 2.3 Phổ biến pháp luật - Bài 1
  {
    id: 'news-00000000-0000-0000-0000-000000000009',
    title: 'Tuyên truyền Luật An toàn giao thông và xây dựng văn hóa giao thông học đường',
    slug: 'tuyen-truyen-luat-an-toan-giao-thong-hoc-duong',
    excerpt:
      'Trường THCS & THPT Vĩnh Phong phối hợp cùng Đội CSGT Công an huyện Vĩnh Thuận tổ chức buổi tuyên truyền pháp luật và ký cam kết chấp hành ATGT cho 100% học sinh.',
    content: `
      <h2>1. Nâng cao ý thức tự giác chấp hành luật khi tham gia giao thông</h2>
      <p>Các em học sinh được nghe phổ biến quy định về độ tuổi đi xe máy điện, bắt buộc đội mũ bảo hiểm đạt chuẩn và quy tắc nhường đường an toàn.</p>
      <h2>2. Trao tặng 50 mũ bảo hiểm cho học sinh có hoàn cảnh khó khăn</h2>
      <p>Chương trình cũng trao tặng mũ bảo hiểm và các phần quà ý nghĩa nhằm khích lệ tinh thần các em học sinh vươn lên trong học tập.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000023',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban An toàn trường học',
    status: 'published',
    is_featured: false,
    is_highlight: false,
    view_count: 620,
    published_at: '2025-04-18T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-18T07:00:00.000Z',
    updated_at: '2025-04-18T08:00:00.000Z',
    category: INITIAL_CATEGORIES[1]?.children?.[2],
    tags: [INITIAL_TAGS[2]],
  },
  // 2.3 Phổ biến pháp luật - Bài 2
  {
    id: 'news-00000000-0000-0000-0000-000000000010',
    title: 'Chuyên đề phòng chống bạo lực học đường và sử dụng mạng xã hội văn minh',
    slug: 'chuyen-de-phong-chong-bao-luc-hoc-duong-mang-xa-hoi',
    excerpt:
      'Tập huấn trang bị kiến thức pháp lý và kỹ năng nhận diện, phòng tránh các cạm bẫy lừa đảo trực tuyến, xây dựng tình bạn đẹp và nói không với bạo lực học đường.',
    content: `
      <h2>1. Nhận diện các hình thức bạo lực và bắt nạt trên không gian mạng</h2>
      <p>Buổi tọa đàm giúp các em học sinh hiểu rõ các hành vi vi phạm Luật An ninh mạng, tác hại của tin giả và cách thức bảo vệ dữ liệu cá nhân an toàn.</p>
      <h2>2. Xây dựng môi trường lớp học yêu thương</h2>
      <p>Học sinh được tham gia xử lý các tình huống thực tế, học cách lắng nghe, chia sẻ và tìm kiếm sự trợ giúp từ thầy cô, cha mẹ khi gặp khó khăn tâm lý.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000023',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Tổ Tư vấn Tâm lý học đường',
    status: 'published',
    is_featured: false,
    is_highlight: false,
    view_count: 580,
    published_at: '2025-04-12T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-12T07:00:00.000Z',
    updated_at: '2025-04-12T08:00:00.000Z',
    category: INITIAL_CATEGORIES[1]?.children?.[2],
    tags: [INITIAL_TAGS[2]],
  },

  // 3.1 Tuyển sinh đầu cấp - Bài 1
  {
    id: 'news-00000000-0000-0000-0000-000000000011',
    title: 'Thông báo tuyển sinh vào lớp 6 và lớp 10 năm học mới',
    slug: 'thong-bao-tuyen-sinh-vao-lop-6-va-lop-10-nam-hoc-moi',
    excerpt:
      'Hội đồng tuyển sinh Trường THCS & THPT Vĩnh Phong thông báo chỉ tiêu, phương thức tuyển sinh, thời gian nhận hồ sơ xét tuyển và thi tuyển vào lớp 6 THCS và lớp 10 THPT.',
    content: `
      <h2>1. Chỉ tiêu tuyển sinh</h2>
      <p>Năm học mới, nhà trường dự kiến tuyển sinh 04 lớp 6 hệ THCS (180 chỉ tiêu) và 08 lớp 10 hệ THPT (360 chỉ tiêu) phân theo các tổ hợp môn khoa học tự nhiên và khoa học xã hội.</p>
      <h2>2. Thời gian và hình thức nộp hồ sơ</h2>
      <p>Phụ huynh học sinh có thể nộp hồ sơ trực tuyến qua cổng thông tin hoặc nộp trực tiếp tại Văn phòng tuyển sinh nhà trường từ ngày 15/06 đến hết ngày 10/07.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000031',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Hội đồng Tuyển sinh',
    status: 'published',
    is_featured: true,
    is_highlight: true,
    view_count: 2150,
    published_at: '2025-04-10T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-10T07:00:00.000Z',
    updated_at: '2025-04-10T08:00:00.000Z',
    category: INITIAL_CATEGORIES[2]?.children?.[0],
    tags: [INITIAL_TAGS[0]],
  },
  // 3.1 Tuyển sinh đầu cấp - Bài 2
  {
    id: 'news-00000000-0000-0000-0000-000000000012',
    title: 'Hướng dẫn chuẩn bị hồ sơ và thủ tục đăng ký tuyển sinh trực tuyến',
    slug: 'huong-dan-chuan-bi-ho-so-tuyen-sinh-truc-tuyen',
    excerpt:
      'Các bước hướng dẫn chi tiết dành cho phụ huynh và học sinh khi chuẩn bị giấy tờ, mã định danh cá nhân và quy trình đăng ký xét tuyển trực tuyến tại nhà.',
    content: `
      <h2>1. Danh mục giấy tờ cần chuẩn bị</h2>
      <ul>
        <li>Học bạ THCS hoặc bằng tốt nghiệp THCS tạm thời.</li>
        <li>Bản sao giấy khai sinh hợp lệ.</li>
        <li>Giấy xác nhận thông tin cư trú hoặc mã định danh VNeID mức 2.</li>
        <li>Các giấy tờ chứng nhận ưu tiên, khuyến khích (nếu có).</li>
      </ul>
      <h2>2. Các bước thao tác trên phần mềm</h2>
      <p>Phụ huynh quét mã QR trên giấy báo hoặc truy cập cổng tuyển sinh của trường để nhập liệu thông tin và đính kèm bản quét hồ sơ.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000031',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Hội đồng Tuyển sinh',
    status: 'published',
    is_featured: false,
    is_highlight: false,
    view_count: 820,
    published_at: '2025-04-05T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-05T07:00:00.000Z',
    updated_at: '2025-04-05T08:00:00.000Z',
    category: INITIAL_CATEGORIES[2]?.children?.[0],
    tags: [INITIAL_TAGS[0]],
  },

  // 3.2 Thi TN THPT - Bài 1
  {
    id: 'news-00000000-0000-0000-0000-000000000013',
    title: 'Kế hoạch tổ chức ôn tập và thi thử Tốt nghiệp THPT năm 2025',
    slug: 'ke-hoach-on-tap-va-thi-thu-tot-nghiep-thpt-2025',
    excerpt:
      'Kế hoạch phân công giáo viên ôn luyện, thời khóa biểu tăng cường và lịch thi thử tốt nghiệp THPT giúp học sinh khối 12 làm quen với cấu trúc đề thi chuẩn của Bộ Giáo dục & Đào tạo.',
    content: `
      <h2>1. Mục đích tổ chức các đợt thi thử</h2>
      <p>Kỳ thi thử nhằm giúp các em học sinh khối 12 cọ xát thực tế, rèn luyện kỹ năng làm bài thi trắc nghiệm trên phiếu trả lời và tự đánh giá năng lực cá nhân để điều chỉnh chiến thuật ôn thi.</p>
      <h2>2. Lịch thi thử đợt 1 và đợt 2</h2>
      <p>Đợt 1 diễn ra vào trung tuần tháng 5/2025; Đợt 2 tổ chức chung cụm thi thử liên trường vào đầu tháng 6/2025 với ngân hàng đề bám sát ma trận đề minh họa mới nhất.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000032',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban Ôn thi Tốt nghiệp',
    status: 'published',
    is_featured: true,
    is_highlight: false,
    view_count: 1680,
    published_at: '2025-04-22T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-22T07:00:00.000Z',
    updated_at: '2025-04-22T08:00:00.000Z',
    category: INITIAL_CATEGORIES[2]?.children?.[1],
    tags: [INITIAL_TAGS[1]],
  },
  // 3.2 Thi TN THPT - Bài 2
  {
    id: 'news-00000000-0000-0000-0000-000000000014',
    title: 'Những điểm mới và lưu ý đặc biệt trong Quy chế thi Tốt nghiệp THPT Quốc gia 2025',
    slug: 'nhung-diem-moi-trong-quy-che-thi-tot-nghiep-thpt-2025',
    excerpt:
      'Tổng hợp các nội dung điều chỉnh về danh mục máy tính bỏ túi được phép mang vào phòng thi, thời gian đăng ký nguyện vọng xét tuyển đại học và các mốc thời gian phụ huynh cần ghi nhớ.',
    content: `
      <h2>1. Các mốc thời gian quan trọng</h2>
      <p>Thí sinh bắt đầu kiểm tra thông tin cá nhân và đăng ký dự thi trực tuyến từ ngày 02/05 đến ngày 13/05/2025. Mọi sai sót cần báo ngay cho bộ phận giáo vụ trường để kịp thời chỉnh lý.</p>
      <h2>2. Quy định về kỷ luật phòng thi</h2>
      <p>Tuyệt đối không mang điện thoại di động, đồng hồ thông minh, thiết bị thu phát sóng vào phòng thi. Thí sinh vi phạm sẽ bị đình chỉ thi và hủy toàn bộ kết quả.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000032',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    author_name: 'Ban Tư vấn Tuyển sinh',
    status: 'published',
    is_featured: false,
    is_highlight: false,
    view_count: 940,
    published_at: '2025-04-15T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-04-15T07:00:00.000Z',
    updated_at: '2025-04-15T08:00:00.000Z',
    category: INITIAL_CATEGORIES[2]?.children?.[1],
    tags: [INITIAL_TAGS[1]],
  },
];
