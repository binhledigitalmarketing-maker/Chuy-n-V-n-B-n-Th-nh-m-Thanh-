export interface SampleScript {
  id: string;
  title: string;
  category: string;
  recommendedVoice: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';
  recommendedStyle: string;
  text: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'movie-tiktok',
    title: 'Review Phim Giật Gân',
    category: 'TikTok / Review',
    recommendedVoice: 'Fenrir',
    recommendedStyle: 'Phong cách review phim giật gân, nhịp độ dồn dập hồi hộp, ngắt nhịp gay cấn',
    text: 'Cứ ngỡ đây chỉ là một chuyến dã ngoại bình thường, <gasp> cho đến khi chiếc điện thoại phát tín hiệu SOS kỳ lạ. <breath> Nhìn ra ngoài cửa sổ xe buýt... Không một bóng người, xung quanh chỉ toàn sương mù dày đặc! Liệu họ có thể sống sót trở về? Cùng đón xem đoạn kết bất ngờ này nhé!',
  },
  {
    id: 'podcast-healing',
    title: 'Tâm Sự Chữa Lành Đêm Khuya',
    category: 'Podcast / Thư giãn',
    recommendedVoice: 'Kore',
    recommendedStyle: 'Trầm ấm, dịu dàng, thì thầm thư thái như người bạn tâm tình',
    text: 'Chào bạn. <breath> Sau một ngày dài với bộn bề lo toan ngoài kia, bạn đã trở về với không gian yên tĩnh của chính mình chưa? Hãy thả lỏng bờ vai, hít một hơi thật sâu... Mọi chuyện hôm nay rồi cũng sẽ ổn thôi, bạn đã làm rất tốt rồi.',
  },
  {
    id: 'trend-comedy',
    title: 'TikTok Bí Mật Đời Sống',
    category: 'Viral Trend',
    recommendedVoice: 'Puck',
    recommendedStyle: 'Năng động, tươi vui, dí dỏm, nhấn nhá câu chữ sắc nét',
    text: 'Alo alo, 99% mọi người vẫn đang dùng điện thoại sai cách mà không hề hay biết! <laugh> Đố bạn biết tính năng ẩn này giúp tiết kiệm pin gấp đôi là gì? Nhìn vào màn hình và làm theo mình trong 3 giây nha, bảo đảm bất ngờ luôn!',
  },
  {
    id: 'news-tech',
    title: 'Bản Tin Trí Tuệ Nhân Tạo',
    category: 'Tin Tức / Tech',
    recommendedVoice: 'Zephyr',
    recommendedStyle: 'Chuẩn phát thanh viên truyền hình, đĩnh đạc, tròn vành rõ chữ',
    text: 'Thưa quý vị và các bạn, hôm nay kỷ nguyên trí tuệ nhân tạo thế hệ mới chính thức bước sang một cột mốc quan trọng. Với khả năng xử lý ngôn ngữ tự nhiên và ngữ điệu chân thực như người thật, công nghệ AI đang tái định hình cách con người sáng tạo nội dung trên toàn cầu.',
  },
  {
    id: 'quote-inspirational',
    title: 'Hạt Giống Tâm Hồn',
    category: 'Sách Nói',
    recommendedVoice: 'Charon',
    recommendedStyle: 'Trầm ấm, triết lý, vững chãi và đáng tin cậy',
    text: 'Cuộc đời không đo bằng số hơi thở chúng ta hít vào, mà đo bằng những khoảnh khắc khiến ta nghẹt thở vì xúc động. Đừng ngại thất bại, bởi mỗi vết sẹo hôm nay chính là huân chương của lòng can đảm ngày mai.',
  },
];
