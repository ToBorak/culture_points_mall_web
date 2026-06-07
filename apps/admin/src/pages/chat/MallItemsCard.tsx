// MallItemsCard 把 list_mall_items 的结构化结果渲染成漂亮的商品列表（替代 LLM 的 markdown 表格）。

export interface RawItem {
  id: number;
  type: string;
  name: string;
  cost: number;
  stock: number | null;
  image_url?: string;
  status?: string;
}

export function MallItemsCard({ items, title }: { items: RawItem[]; title?: string }) {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: 460,
        borderRadius: 16,
        borderTopLeftRadius: 4,
        border: '1px solid var(--cpm-card-border)',
        background: '#fff',
        boxShadow: 'var(--cpm-shadow-soft)',
        overflow: 'hidden',
        fontFamily: 'var(--cpm-font-sans)',
      }}
    >
      <div
        style={{
          padding: '11px 16px',
          background: 'rgba(124,58,237,0.05)',
          borderBottom: '1px solid var(--cpm-card-border)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--cpm-brand-violet)',
        }}
      >
        🛍️ {title ?? '积分商城商品'}
        <span style={{ marginLeft: 6, fontWeight: 500, color: 'var(--cpm-text-tertiary)' }}>{items.length} 件</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--cpm-text-muted)', fontSize: 13, padding: '20px 0' }}>
            暂无商品
          </div>
        )}
        {items.map((it, i) => {
          const blind = it.type === 'blindbox';
          const off = it.status === 'off_shelf';
          return (
            <div
              key={it.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--cpm-card-border)',
                opacity: off ? 0.6 : 1,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  background: blind ? 'rgba(236,72,153,0.1)' : 'rgba(124,58,237,0.08)',
                }}
              >
                {blind ? '🎁' : '🛍️'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--cpm-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {it.name}
                  </span>
                  {blind && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#be185d',
                        background: 'rgba(236,72,153,0.12)',
                        borderRadius: 5,
                        padding: '1px 6px',
                      }}
                    >
                      盲盒
                    </span>
                  )}
                  {off && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--cpm-text-muted)',
                        background: 'rgba(15,23,42,0.06)',
                        borderRadius: 5,
                        padding: '1px 6px',
                      }}
                    >
                      已下架
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--cpm-text-tertiary)', marginTop: 2 }}>
                  库存 {it.stock === null || it.stock === undefined ? '不限量' : it.stock}
                </div>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--cpm-brand-violet)',
                  background: 'var(--cpm-brand-violet-bg, rgba(124,58,237,0.08))',
                  borderRadius: 8,
                  padding: '4px 10px',
                }}
              >
                {it.cost} 积分
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
