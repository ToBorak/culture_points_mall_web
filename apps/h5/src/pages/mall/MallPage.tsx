import { useMallItems, useMyOrders, usePassport, useRedeemItem } from '@cpm/api-client';
import type { MallItem } from '@cpm/types';
import { PointsPill } from '@cpm/ui';
import { Coins, Gift, Package, Sparkles } from 'lucide-react';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const orderBtnStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  padding: '7px 12px',
  borderRadius: 999,
  border: '1px solid var(--cpm-border-subtle)',
  background: 'var(--cpm-surface)',
  color: 'var(--cpm-ink-2)',
  cursor: 'pointer',
  fontFamily: 'var(--cpm-font-sans)',
  fontSize: 12,
  fontWeight: 700,
};

const cardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 12,
  borderRadius: 16,
  background: 'var(--cpm-surface)',
  border: '1px solid var(--cpm-border-subtle)',
  boxShadow: 'var(--cpm-elev-soft)',
};

function Empty({ text }: { text: string }) {
  return (
    <div
      style={{ textAlign: 'center', padding: '48px 0', color: 'var(--cpm-ink-2)', fontFamily: 'var(--cpm-font-sans)' }}
    >
      {text}
    </div>
  );
}

function SectionTitle({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--cpm-font-sans)',
        fontWeight: 800,
        fontSize: 15,
        color: 'var(--cpm-ink-1)',
      }}
    >
      {icon}
      {text}
    </div>
  );
}

function GoodRow({ item, affordable }: { item: MallItem; affordable: boolean }) {
  const redeem = useRedeemItem();
  const out = item.Stock !== null && item.Stock <= 0;
  const disabled = out || !affordable || redeem.isPending;
  const onRedeem = () => {
    if (disabled) return;
    if (!window.confirm(`确认用 ${item.Cost} 积分兑换「${item.Name}」？`)) return;
    redeem.mutate(item.ID, { onError: (e) => window.alert(`兑换失败：${e.message || '请稍后再试'}`) });
  };
  return (
    <div style={cardStyle}>
      <img
        src={item.ImageURL}
        alt={item.Name}
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          objectFit: 'cover',
          background: 'var(--cpm-sunken)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--cpm-font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--cpm-ink-1)' }}>
          {item.Name}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 3,
            fontFamily: 'var(--cpm-font-num)',
            fontWeight: 800,
            fontSize: 15,
            color: 'var(--cpm-gold-ink)',
          }}
        >
          <Coins size={14} style={{ color: 'var(--cpm-gold)' }} />
          {item.Cost}
          {item.Stock !== null && (
            <span
              style={{
                fontFamily: 'var(--cpm-font-sans)',
                fontWeight: 500,
                fontSize: 11,
                color: 'var(--cpm-ink-2)',
                marginLeft: 6,
              }}
            >
              库存 {item.Stock}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onRedeem}
        disabled={disabled}
        style={{
          flexShrink: 0,
          minHeight: 36,
          padding: '8px 16px',
          borderRadius: 999,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--cpm-font-sans)',
          fontSize: 13,
          fontWeight: 700,
          background: disabled ? 'var(--cpm-sunken)' : 'var(--cpm-primary)',
          color: disabled ? 'var(--cpm-ink-2)' : 'var(--cpm-on-primary)',
          boxShadow: disabled ? 'none' : 'var(--cpm-elev-candy)',
          transition: 'all 200ms ease',
        }}
      >
        {redeem.isPending ? '兑换中…' : out ? '已售罄' : !affordable ? '积分不足' : '兑换'}
      </button>
    </div>
  );
}

function ShopView({
  items,
  points,
  onOpenBox,
}: { items: MallItem[]; points: number; onOpenBox: (id: number) => void }) {
  const blindboxes = items.filter((i) => i.Type === 'blindbox');
  const goods = items.filter((i) => i.Type === 'item');
  if (items.length === 0) return <Empty text="商城暂无商品" />;
  return (
    <>
      {blindboxes.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionTitle icon={<Sparkles size={16} style={{ color: 'var(--cpm-primary)' }} />} text="盲盒抽奖" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {blindboxes.map((b) => (
              <button
                key={b.ID}
                type="button"
                onClick={() => onOpenBox(b.ID)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  textAlign: 'left',
                  padding: 12,
                  borderRadius: 18,
                  border: '1px solid var(--cpm-border-subtle)',
                  background: 'var(--cpm-surface)',
                  boxShadow: 'var(--cpm-elev-soft)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    height: 96,
                    borderRadius: 14,
                    background: 'var(--cpm-grad-brand)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: 'var(--cpm-elev-candy)',
                  }}
                >
                  <Gift size={40} style={{ color: '#fff' }} />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--cpm-font-sans)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--cpm-ink-1)',
                    marginTop: 10,
                  }}
                >
                  {b.Name}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 4,
                    fontFamily: 'var(--cpm-font-num)',
                    fontWeight: 800,
                    color: 'var(--cpm-gold-ink)',
                  }}
                >
                  <Coins size={14} style={{ color: 'var(--cpm-gold)' }} />
                  {b.Cost} / 次
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {goods.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionTitle icon={<Gift size={16} style={{ color: 'var(--cpm-primary)' }} />} text="积分好物" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {goods.map((g) => (
              <GoodRow key={g.ID} item={g} affordable={points >= g.Cost} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function OrdersView() {
  const ordersQ = useMyOrders();
  const orders = ordersQ.data ?? [];
  if (ordersQ.isLoading) return <Empty text="加载中…" />;
  if (orders.length === 0) return <Empty text="还没有订单，去商城逛逛吧" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {orders.map((o) => (
        <div key={o.id} style={cardStyle}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--cpm-primary-soft)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {o.prizeName ? (
              <Sparkles size={20} style={{ color: 'var(--cpm-primary)' }} />
            ) : (
              <Package size={20} style={{ color: 'var(--cpm-primary)' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontFamily: 'var(--cpm-font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--cpm-ink-1)' }}
            >
              {o.prizeName || o.itemName || '商品'}
            </div>
            <div style={{ fontFamily: 'var(--cpm-font-sans)', fontSize: 11, color: 'var(--cpm-ink-2)', marginTop: 2 }}>
              订单 #{o.id} · {o.status === 'paid' ? '已兑换' : o.status}
            </div>
          </div>
          <div
            style={{ fontFamily: 'var(--cpm-font-num)', fontWeight: 800, fontSize: 15, color: 'var(--cpm-gold-ink)' }}
          >
            -{o.cost}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MallPage() {
  const [view, setView] = useState<'shop' | 'orders'>('shop');
  const itemsQ = useMallItems();
  const points = usePassport().data?.totalScore ?? 0;
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h1
          style={{
            fontFamily: 'var(--cpm-font-sans)',
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--cpm-ink-1)',
            margin: 0,
          }}
        >
          积分商城
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PointsPill value={points} />
          <button
            type="button"
            onClick={() => setView((v) => (v === 'shop' ? 'orders' : 'shop'))}
            style={orderBtnStyle}
          >
            <Package size={15} />
            {view === 'shop' ? '我的订单' : '返回商城'}
          </button>
        </div>
      </div>

      {view === 'orders' ? (
        <OrdersView />
      ) : itemsQ.isLoading ? (
        <Empty text="加载中…" />
      ) : (
        <ShopView items={itemsQ.data ?? []} points={points} onOpenBox={(id) => navigate(`/mall/blindbox/${id}`)} />
      )}
    </div>
  );
}
