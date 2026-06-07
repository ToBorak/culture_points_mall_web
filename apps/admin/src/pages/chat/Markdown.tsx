import type { CSSProperties, ReactNode } from 'react';

// 轻量 Markdown 渲染器：把 HR-Agent 回复里的 ###标题 / **加粗** / 列表 / --- / 表格 / `代码` / 链接
// 渲染成漂亮排版（无第三方依赖，覆盖 agent 实际产出的语法）。

// ---- 行内：**加粗** / `代码` / [文字](链接) ----
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // 依次匹配最先出现的 标记，递归处理
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/;
  let rest = text;
  let i = 0;
  while (rest.length > 0) {
    const m = re.exec(rest);
    if (!m || m.index === undefined) {
      nodes.push(rest);
      break;
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={k} style={{ fontWeight: 700, color: 'var(--cpm-text-primary)' }}>
          {m[2]}
        </strong>,
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={k}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.88em',
            background: 'rgba(124,58,237,0.08)',
            color: '#7c3aed',
            borderRadius: 5,
            padding: '1px 5px',
          }}
        >
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <a
          key={k}
          href={m[5]}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--cpm-brand-violet)', textDecoration: 'underline' }}
        >
          {m[4]}
        </a>,
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return nodes;
}

const H_STYLE: Record<number, CSSProperties> = {
  1: { fontSize: 18, fontWeight: 800, margin: '4px 0 2px' },
  2: { fontSize: 16, fontWeight: 700, margin: '4px 0 2px' },
  3: { fontSize: 14.5, fontWeight: 700, margin: '2px 0', color: 'var(--cpm-text-primary)' },
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '6px 10px',
  borderBottom: '1.5px solid var(--cpm-card-border-strong)',
  color: 'var(--cpm-text-secondary)',
  fontWeight: 700,
};
const tdStyle: CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid var(--cpm-card-border)',
  color: 'var(--cpm-text-primary)',
};

interface TableBlock {
  head: string[];
  rows: string[][];
}
function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

export function Markdown({ text }: { text: string }) {
  const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    const joined = para.join('\n');
    blocks.push(
      <p key={`p${key++}`} style={{ margin: '2px 0', lineHeight: 1.7 }}>
        {joined.split('\n').map((ln, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split, order-stable
          <span key={idx}>
            {idx > 0 && <br />}
            {renderInline(ln, `p${key}-${idx}`)}
          </span>
        ))}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const { ordered, items } = list;
    const Tag = ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={`l${key++}`}
        style={{ margin: '4px 0', paddingLeft: 4, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}
      >
        {items.map((it, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list, order-stable
          <li key={idx} style={{ display: 'flex', gap: 8, alignItems: 'baseline', lineHeight: 1.65 }}>
            <span
              style={{ flexShrink: 0, color: 'var(--cpm-brand-violet)', fontWeight: 700, fontSize: ordered ? 13 : 15 }}
            >
              {ordered ? `${idx + 1}.` : '•'}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{renderInline(it, `l${key}-${idx}`)}</span>
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const t = line.trim();

    // 表格：当前行像 |..| 且下一行是分隔行 |---|
    if (
      /^\|.*\|/.test(t) &&
      i + 1 < lines.length &&
      /^\|?[\s:|-]+\|?$/.test(lines[i + 1].trim()) &&
      lines[i + 1].includes('-')
    ) {
      flushPara();
      flushList();
      const tb: TableBlock = { head: splitRow(t), rows: [] };
      i += 2; // 跳过表头分隔行
      while (i < lines.length && /^\|.*\|/.test(lines[i].trim())) {
        tb.rows.push(splitRow(lines[i].trim()));
        i++;
      }
      i--;
      blocks.push(
        <div key={`t${key++}`} style={{ overflowX: 'auto', margin: '4px 0' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
            <thead>
              <tr>
                {tb.head.map((h, ci) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: 静态表头，渲染一次不重排
                  <th key={ci} style={thStyle}>
                    {renderInline(h, `th${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tb.rows.map((r, ri) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 静态表格行，渲染一次不重排
                <tr key={ri}>
                  {r.map((c, ci) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 静态单元格
                    <td key={ci} style={tdStyle}>
                      {renderInline(c, `td${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (t === '') {
      flushPara();
      flushList();
      continue;
    }
    // 分割线
    if (/^(---+|\*\*\*+|___+)$/.test(t)) {
      flushPara();
      flushList();
      blocks.push(
        <hr
          key={`hr${key++}`}
          style={{ border: 'none', borderTop: '1px solid var(--cpm-card-border)', margin: '8px 0' }}
        />,
      );
      continue;
    }
    // 标题
    const h = /^(#{1,3})\s+(.*)$/.exec(t);
    if (h) {
      flushPara();
      flushList();
      const level = h[1].length;
      blocks.push(
        <div key={`h${key++}`} style={H_STYLE[level]}>
          {renderInline(h[2], `h${key}`)}
        </div>,
      );
      continue;
    }
    // 列表项
    const ul = /^[-*]\s+(.*)$/.exec(t);
    const ol = /^(\d+)\.\s+(.*)$/.exec(t);
    if (ul || ol) {
      flushPara();
      const ordered = Boolean(ol);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ul ? ul[1] : (ol as RegExpExecArray)[2]) ?? '');
      continue;
    }
    // 引用
    if (t.startsWith('> ')) {
      flushPara();
      flushList();
      blocks.push(
        <div
          key={`q${key++}`}
          style={{
            borderLeft: '3px solid var(--cpm-brand-violet)',
            padding: '2px 12px',
            margin: '4px 0',
            color: 'var(--cpm-text-secondary)',
            background: 'rgba(124,58,237,0.04)',
            borderRadius: 4,
          }}
        >
          {renderInline(t.slice(2), `q${key}`)}
        </div>,
      );
      continue;
    }
    // 普通段落行
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{blocks}</div>;
}
