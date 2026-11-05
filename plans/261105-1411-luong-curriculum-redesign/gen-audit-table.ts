// Mechanically renders the VI-facing taxonomy audit table from the live TS module (no hand transcription).
import { ALL_24_REAL_LIFE_PROBLEMS } from '/Users/nad/ai4u/ai4UCheE/src/lib/problem-library-registry';
import {
  CAUSE_DOMAIN_META, COURSE_TOPIC_META, COURSE_TOPIC_ORDER, LIFECYCLE_PHASE_META, PROBLEM_TAXONOMY,
} from '/Users/nad/ai4u/ai4UCheE/src/lib/problem-taxonomy';

const byTopic: Record<string, number> = {};
for (const id of Object.keys(PROBLEM_TAXONOMY)) byTopic[PROBLEM_TAXONOMY[id].courseTopic] = (byTopic[PROBLEM_TAXONOMY[id].courseTopic] ?? 0) + 1;

const lines: string[] = [];
lines.push('# Bảng phân loại 24 sự cố — duyệt bởi Lương (plan 261105-1411, phase 2)');
lines.push('');
lines.push('Trục trực giao: **Buổi thực hành (courseTopic × 6)** · **Giai đoạn (× 2)** · **Lĩnh vực nguyên nhân (× 6)** · huy hiệu ⭐ = bài nghiên cứu tình huống (case study). Mỗi bài đúng 1 nhãn trội (quy tắc E).');
lines.push('');
lines.push('| # | Bài | Buổi (courseTopic) | Giai đoạn | Lĩnh vực nguyên nhân | ⭐ |');
lines.push('|---|-----|---------------------|-----------|----------------------|---|');
for (const p of ALL_24_REAL_LIFE_PROBLEMS) {
  const t = PROBLEM_TAXONOMY[p.problemId]!;
  lines.push(`| ${p.number} | ${p.problemId} | ${COURSE_TOPIC_META[t.courseTopic].label.vi} | ${LIFECYCLE_PHASE_META[t.lifecyclePhase].label.vi} | ${CAUSE_DOMAIN_META[t.causeDomain].label.vi} | ${t.caseStudy ? '⭐' : '—'} |`);
}
lines.push('');
lines.push(`Tổng theo buổi: ${COURSE_TOPIC_ORDER.map((t) => `${COURSE_TOPIC_META[t].label.vi} ${byTopic[t]}`).join(' · ')} = ${ALL_24_REAL_LIFE_PROBLEMS.length}`);
lines.push('');
lines.push('## Khoảng trống lộ trình (roadmap)');
lines.push('');
lines.push('- Buổi Truyền nhiệt mới có 2 bài — sẽ bổ sung bài trao đổi nhiệt/nồi hơi khi có nội dung mới.');
lines.push('- Lĩnh vực Điều khiển chỉ có 1 bài (FCV-101 ISA) — cố ý để trống dạng lộ trình, tham chiếu lớp sự cố kho lạnh thực phẩm EU; kế hoạch bổ sung.');
lines.push('- Mức L4 chỉ nằm ở buổi Kỹ thuật Phản ứng (2 bài) và Thiết kế-Điều khiển-An toàn (1 bài) — chưa đủ để mỗi buổi đều có bài tổng hợp L4.');
lines.push('- Ghi chú duyệt: bài #24 (Chem-E-Car) có thể chuyển sang lĩnh vực Điều khiển nếu Lương muốn (thay đổi 1 dòng dữ liệu).');
console.log(lines.join('\n'));
