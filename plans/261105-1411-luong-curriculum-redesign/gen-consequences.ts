// Emits problem-consequence-copy-a.ts (prob-01..12) and -b.ts (prob-13..24) from the
// approved worksheet — the ONLY source of truth (plan 261105-1411 task 3.3, kongming drift fix).
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = '/Users/nad/ai4u/ai4UCheE/plans/261105-1411-luong-curriculum-redesign/consequence-copy-review.md';
const rows: Array<{ key: string; en: string; vi: string }> = [];
for (const line of readFileSync(SRC, 'utf8').split('\n')) {
  const m = line.match(/^\| (prob-\d{2}-[a-z0-9-]+:wb\d-h\d) \| (.+) \| (.+) \|$/);
  if (m) rows.push({ key: m[1], en: m[2].trim(), vi: m[3].trim() });
}
if (rows.length !== 72) throw new Error(`expected 72 rows, parsed ${rows.length}`);

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$\{/g, '\\${');
const emit = (name: string, constName: string, slice: Array<{ key: string; en: string; vi: string }>) => {
  const body = slice.map((r) => `  "${r.key}": { en: "${esc(r.en)}", vi: "${esc(r.vi)}" },`).join('\n');
  const out = `// AUTO-GENERATED from consequence-copy-review.md (plan 261105-1411, task 3.3) — do not hand-edit.\nimport type { ConsequenceText } from './hypothesis-consequence-copy';\n\nexport const ${constName}: Readonly<Record<string, ConsequenceText>> = {\n${body}\n};\n`;
  writeFileSync(`/Users/nad/ai4u/ai4UCheE/src/lib/${name}`, out);
  console.log(`${name}: ${slice.length} entries`);
};
emit('problem-consequence-copy-a.ts', 'PROBLEM_CONSEQUENCES_A', rows.filter((r) => Number(r.key.slice(5, 7)) <= 12));
emit('problem-consequence-copy-b.ts', 'PROBLEM_CONSEQUENCES_B', rows.filter((r) => Number(r.key.slice(5, 7)) >= 13));
