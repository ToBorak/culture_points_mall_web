import { useMallItems, useMyOrders, usePassport, useRedeemItem } from '@cpm/api-client';
import type { MallItem } from '@cpm/types';
import { PointsPill, PrizeRevealModal, useBreakpoint } from '@cpm/ui';
import { Coins, Gift, Package, Sparkles, X } from 'lucide-react';
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

const mallShellStyle = (isDesktop: boolean): CSSProperties => ({
  width: '100%',
  maxWidth: isDesktop ? 1120 : 640,
  margin: '0 auto',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: isDesktop ? 18 : 16,
  padding: isDesktop ? '20px 24px 34px' : '12px 16px 24px',
});

const gridStyle = (isDesktop: boolean, min = 240): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: isDesktop ? `repeat(auto-fit, minmax(${min}px, 1fr))` : '1fr',
  gap: isDesktop ? 14 : 10,
});

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

function GoodRow({
  item,
  affordable,
  redeeming,
  onRedeem,
}: { item: MallItem; affordable: boolean; redeeming: boolean; onRedeem: (item: MallItem) => void }) {
  const placeholder = item.Cost <= 0; // 「实时上新」占位商品，不可兑换
  const out = item.Stock !== null && item.Stock <= 0;
  const disabled = placeholder || out || !affordable || redeeming;
  const handleRedeem = () => {
    if (disabled) return;
    onRedeem(item);
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
        {placeholder ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 4,
              padding: '3px 9px',
              borderRadius: 999,
              background: 'var(--cpm-primary-soft)',
              color: 'var(--cpm-primary-strong)',
              fontFamily: 'var(--cpm-font-sans)',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            <Sparkles size={12} aria-hidden />
            实时上新
          </div>
        ) : (
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
        )}
      </div>
      <button
        type="button"
        onClick={handleRedeem}
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
        {placeholder ? '敬请期待' : redeeming ? '兑换中…' : out ? '已售罄' : !affordable ? '积分不足' : '兑换'}
      </button>
    </div>
  );
}

function ShopView({
  items,
  points,
  onOpenBox,
  onRedeem,
  redeemingId,
  isDesktop,
}: {
  items: MallItem[];
  points: number;
  onOpenBox: (id: number) => void;
  onRedeem: (item: MallItem) => void;
  redeemingId: number | null;
  isDesktop: boolean;
}) {
  const blindboxes = items.filter((i) => i.Type === 'blindbox');
  const goods = items.filter((i) => i.Type === 'item');
  if (items.length === 0) return <Empty text="商城暂无商品" />;
  return (
    <>
      {blindboxes.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionTitle icon={<Sparkles size={16} style={{ color: 'var(--cpm-primary)' }} />} text="盲盒抽奖" />
          {/* 桌面端盲盒用两列网格：单个盲盒只占半屏，不全宽铺满 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0, 1fr))' : '1fr',
              gap: isDesktop ? 14 : 10,
            }}
          >
            {blindboxes.map((b) => (
              <button
                key={b.ID}
                type="button"
                aria-label={`${b.Name}，${b.Cost} 分 / 次，进入盲盒抽奖`}
                onClick={() => onOpenBox(b.ID)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                  minHeight: isDesktop ? 118 : 112,
                  padding: isDesktop ? 14 : 12,
                  borderRadius: 18,
                  border: '1px solid var(--cpm-border-subtle)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)',
                  boxShadow: 'var(--cpm-elev-soft)',
                  cursor: 'pointer',
                  transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
                }}
              >
                <div
                  style={{
                    width: isDesktop ? 86 : 76,
                    height: isDesktop ? 86 : 76,
                    borderRadius: 14,
                    background: 'var(--cpm-grad-brand)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: 'var(--cpm-elev-candy)',
                    flexShrink: 0,
                  }}
                >
                  <Gift size={isDesktop ? 34 : 30} style={{ color: '#fff' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: 'var(--cpm-primary-soft)',
                      color: 'var(--cpm-primary-strong)',
                      fontFamily: 'var(--cpm-font-sans)',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    <Sparkles size={12} aria-hidden />
                    限时抽奖
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--cpm-font-sans)',
                      fontWeight: 800,
                      fontSize: isDesktop ? 16 : 15,
                      color: 'var(--cpm-ink-1)',
                      marginTop: 8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {b.Name}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 6,
                      fontFamily: 'var(--cpm-font-num)',
                      fontWeight: 800,
                      color: 'var(--cpm-gold-ink)',
                    }}
                  >
                    <Coins size={14} style={{ color: 'var(--cpm-gold)' }} />
                    {b.Cost} 分 / 次
                  </div>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--cpm-primary)',
                    color: 'var(--cpm-on-primary)',
                    boxShadow: 'var(--cpm-elev-candy)',
                  }}
                >
                  <Sparkles size={16} aria-hidden />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {goods.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionTitle icon={<Gift size={16} style={{ color: 'var(--cpm-primary)' }} />} text="积分好物" />
          <div style={gridStyle(isDesktop, 300)}>
            {goods.map((g) => (
              <GoodRow
                key={g.ID}
                item={g}
                affordable={points >= g.Cost}
                redeeming={redeemingId === g.ID}
                onRedeem={onRedeem}
              />
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

function RedeemConfirmDialog({
  item,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  item: MallItem | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!item) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
        background: 'rgba(25,26,44,0.42)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <dialog
        open
        aria-modal="true"
        aria-label="确认兑换"
        style={{
          position: 'relative',
          inset: 'auto',
          margin: 0,
          width: '100%',
          maxWidth: 360,
          boxSizing: 'border-box',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.72)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))',
          boxShadow: '0 24px 70px -28px rgba(25,26,44,0.45), 0 0 0 1px rgba(255,255,255,0.45) inset',
          padding: 18,
          fontFamily: 'var(--cpm-font-sans)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>确认兑换</div>
            <div style={{ marginTop: 4, fontSize: 13, color: 'var(--cpm-ink-2)', lineHeight: 1.55 }}>
              兑换成功后会生成订单并扣除积分。
            </div>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            disabled={pending}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: '1px solid var(--cpm-border-subtle)',
              background: 'var(--cpm-surface)',
              color: 'var(--cpm-ink-2)',
              display: 'grid',
              placeItems: 'center',
              cursor: pending ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            padding: 12,
            borderRadius: 16,
            background: 'var(--cpm-primary-soft)',
          }}
        >
          <img
            src={item.ImageURL}
            alt={item.Name}
            style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              objectFit: 'cover',
              background: 'var(--cpm-surface)',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--cpm-ink-1)' }}>{item.Name}</div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 6,
                fontFamily: 'var(--cpm-font-num)',
                fontSize: 16,
                fontWeight: 800,
                color: 'var(--cpm-gold-ink)',
              }}
            >
              <Coins size={15} style={{ color: 'var(--cpm-gold)' }} aria-hidden />
              {item.Cost} 积分
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.18)',
              color: 'var(--cpm-danger)',
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            style={{
              minHeight: 46,
              borderRadius: 14,
              border: '1px solid var(--cpm-border-subtle)',
              background: 'var(--cpm-surface)',
              color: 'var(--cpm-ink-2)',
              fontFamily: 'var(--cpm-font-sans)',
              fontWeight: 800,
              cursor: pending ? 'not-allowed' : 'pointer',
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            style={{
              minHeight: 46,
              borderRadius: 14,
              border: 'none',
              background: pending ? 'var(--cpm-sunken)' : 'var(--cpm-primary)',
              color: pending ? 'var(--cpm-ink-2)' : 'var(--cpm-on-primary)',
              boxShadow: pending ? 'none' : 'var(--cpm-elev-candy)',
              fontFamily: 'var(--cpm-font-sans)',
              fontWeight: 800,
              cursor: pending ? 'not-allowed' : 'pointer',
            }}
          >
            {pending ? '兑换中…' : '确认兑换'}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export function MallPage() {
  const [view, setView] = useState<'shop' | 'orders'>('shop');
  const [redeemItem, setRedeemItem] = useState<MallItem | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ name: string; cost: number; image: string } | null>(
    null,
  );
  const itemsQ = useMallItems();
  const points = usePassport().data?.totalScore ?? 0;
  const redeem = useRedeemItem();
  const navigate = useNavigate();
  const { isDesktop } = useBreakpoint();
  const redeemingId = redeem.isPending ? (redeemItem?.ID ?? null) : null;

  const openRedeem = (item: MallItem) => {
    setRedeemError(null);
    setRedeemItem(item);
  };

  const closeRedeem = () => {
    if (redeem.isPending) return;
    setRedeemError(null);
    setRedeemItem(null);
  };

  const confirmRedeem = () => {
    if (!redeemItem || redeem.isPending) return;
    setRedeemError(null);
    const image = redeemItem.ImageURL;
    redeem.mutate(redeemItem.ID, {
      onSuccess: (res) => {
        setRedeemSuccess({ name: res.itemName, cost: res.cost, image });
        setRedeemItem(null);
      },
      onError: (e) => {
        setRedeemError(`兑换失败：${e.message || '请稍后再试'}`);
      },
    });
  };

  return (
    <div data-testid="mall-content" style={mallShellStyle(isDesktop)}>
      <div
        style={{
          display: 'flex',
          alignItems: isDesktop ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
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
        <ShopView
          items={itemsQ.data ?? []}
          points={points}
          isDesktop={isDesktop}
          onOpenBox={(id) => navigate(`/mall/blindbox/${id}`)}
          onRedeem={openRedeem}
          redeemingId={redeemingId}
        />
      )}
      <RedeemConfirmDialog
        item={redeemItem}
        pending={redeem.isPending}
        error={redeemError}
        onClose={closeRedeem}
        onConfirm={confirmRedeem}
      />
      <PrizeRevealModal
        open={!!redeemSuccess}
        win
        topLabel="兑换成功"
        showTier={false}
        closeLabel="完成"
        prizeName={redeemSuccess?.name ?? ''}
        prizeImage={redeemSuccess?.image}
        amount={redeemSuccess?.cost ?? 0}
        onClose={() => setRedeemSuccess(null)}
      />
    </div>
  );
}
