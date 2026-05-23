import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageHeader, Button } from '@cpm/ui';

interface Module {
  id: string;
  visible: boolean;
}

interface ModuleMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  tint: string;
  previewKind: 'hero' | 'list' | 'banner' | 'grid' | 'chip';
}

interface LayoutResp {
  layout: { modules: Module[] };
  availableModules: ModuleMeta[];
}

export function LayoutEditorPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [metas, setMetas] = useState<ModuleMeta[]>([]);
  const [original, setOriginal] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchLayout = useCallback(async () => {
    const token = localStorage.getItem('cpm_admin_jwt');
    setLoading(true);
    try {
      const { data } = await axios.get<LayoutResp>('/api/v1/admin/layout', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(data.layout.modules);
      setOriginal(data.layout.modules);
      setMetas(data.availableModules);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLayout();
  }, [fetchLayout]);

  const metaById = (id: string) =>
    metas.find((m) => m.id === id) ?? {
      id,
      name: id,
      description: '',
      icon: '◯',
      tint: '#94a3b8',
      previewKind: 'list' as const,
    };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setModules((prev) => {
      const oldIdx = prev.findIndex((m) => m.id === active.id);
      const newIdx = prev.findIndex((m) => m.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const toggleVisible = (id: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
  };

  const isDirty = JSON.stringify(modules) !== JSON.stringify(original);

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('cpm_admin_jwt');
      await axios.put(
        '/api/v1/admin/layout',
        { modules },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOriginal(modules);
      setToast('已保存，刷新员工端即可生效');
      setTimeout(() => setToast(null), 2400);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setToast(`保存失败：${err?.response?.data?.error ?? String(e)}`);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setModules(original);

  return (
    <div>
      <PageHeader
        title="员工首页编排"
        subtitle="拖拽排序 · 切换显隐 · 实时预览员工 H5"
        badge="拖拽生效"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button tone="secondary" size="sm" onClick={reset} disabled={!isDirty || saving}>
              重置
            </Button>
            <Button
              tone={isDirty ? 'primary' : 'ghost'}
              size="sm"
              onClick={save}
              disabled={!isDirty || saving}
            >
              {saving ? '保存中…' : isDirty ? '保存配置' : '已是最新'}
            </Button>
          </div>
        }
      />

      {loading ? (
        <div style={{ color: 'var(--cpm-text-tertiary)', padding: '20px 0', fontSize: 14 }}>
          加载布局中…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          {/* 左侧：员工 H5 预览（手机框） */}
          <PhonePreview modules={modules.filter((m) => m.visible).map((m) => metaById(m.id))} />

          {/* 右侧：模块列表 + DnD */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: 'var(--cpm-text-muted)',
                marginBottom: 10,
              }}
            >
              MODULES · {modules.length}
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {modules.map((m, idx) => (
                    <SortableModule
                      key={m.id}
                      module={m}
                      meta={metaById(m.id)}
                      index={idx}
                      onToggle={() => toggleVisible(m.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--cpm-brand-violet-bg)',
                border: '1px solid rgba(124,58,237,0.18)',
                fontSize: 12,
                color: 'var(--cpm-text-tertiary)',
                lineHeight: 1.6,
              }}
            >
              💡 拖拽手柄调整顺序，点眼睛图标切换显隐。所有员工首页都会按此顺序渲染。修改保存后员工下次打开 H5 自动生效。
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'fixed',
              top: 80,
              right: 24,
              padding: '12px 18px',
              borderRadius: 12,
              background: '#0f172a',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 12px 32px -8px rgba(0,0,0,0.35)',
              zIndex: 100,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableModule({
  module,
  meta,
  index,
  onToggle,
}: {
  module: Module;
  meta: ModuleMeta;
  index: number;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });
  return (
    <motion.div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 14,
        background: module.visible
          ? `linear-gradient(135deg, ${meta.tint}10 0%, ${meta.tint}05 100%)`
          : 'rgba(15,23,42,0.03)',
        border: `1.5px solid ${module.visible ? `${meta.tint}30` : 'rgba(15,23,42,0.08)'}`,
        opacity: module.visible ? 1 : 0.55,
        cursor: isDragging ? 'grabbing' : 'default',
        boxShadow: isDragging ? `0 16px 36px -10px ${meta.tint}55` : 'none',
        position: 'relative',
        zIndex: isDragging ? 50 : 1,
      }}
    >
      {/* 拖拽手柄 */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="拖拽"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: 'none',
          background: 'transparent',
          color: 'var(--cpm-text-tertiary)',
          fontSize: 14,
          cursor: 'grab',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ⋮⋮
      </button>

      {/* 序号 */}
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: meta.tint,
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </span>

      {/* icon */}
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${meta.tint}22`,
          color: meta.tint,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </span>

      {/* 文字 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--cpm-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: 2,
          }}
        >
          {meta.name}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--cpm-text-tertiary)',
            lineHeight: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {meta.description}
        </div>
      </div>

      {/* 显隐 toggle */}
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          border: 'none',
          background: module.visible ? meta.tint : 'rgba(15,23,42,0.15)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
        aria-label={module.visible ? '隐藏' : '显示'}
      >
        <motion.span
          animate={{ x: module.visible ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{
            position: 'absolute',
            top: 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </motion.div>
  );
}

function PhonePreview({ modules }: { modules: ModuleMeta[] }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 20,
        width: 380,
        background: '#0f172a',
        borderRadius: 38,
        padding: '14px 12px',
        boxShadow: '0 30px 80px -20px rgba(15,23,42,0.4)',
      }}
    >
      {/* 顶部 notch */}
      <div
        style={{
          width: 110,
          height: 22,
          borderRadius: 14,
          background: '#000',
          margin: '0 auto 10px',
        }}
      />
      <div
        style={{
          background: 'var(--cpm-bg-0)',
          borderRadius: 26,
          height: 680,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 顶部状态栏 */}
        <div
          style={{
            padding: '14px 14px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--cpm-text-tertiary)',
            fontWeight: 600,
          }}
        >
          <span>5月23日</span>
          <span>🔔 0</span>
        </div>
        <div
          style={{
            padding: '0 14px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
            height: 'calc(100% - 32px)',
          }}
        >
          <AnimatePresence>
            {modules.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              >
                <PreviewBlock meta={m} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ meta }: { meta: ModuleMeta }) {
  const baseStyle: React.CSSProperties = {
    borderRadius: 14,
    background: '#fff',
    border: `1px solid ${meta.tint}22`,
    padding: '11px 12px',
    fontSize: 12,
  };

  if (meta.previewKind === 'hero') {
    return (
      <div
        style={{
          ...baseStyle,
          background: `linear-gradient(135deg, ${meta.tint}22 0%, ${meta.tint}08 100%)`,
          padding: '14px 14px',
        }}
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: meta.tint, opacity: 0.85 }} />
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ height: 8, background: 'rgba(15,23,42,0.15)', borderRadius: 4, marginBottom: 5, width: '70%' }} />
            <div style={{ height: 6, background: 'rgba(15,23,42,0.08)', borderRadius: 3, width: '50%' }} />
          </div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--cpm-text-tertiary)', marginBottom: 2 }}>
          TOTAL POINTS
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--cpm-text-primary)' }}>
          100,000
        </div>
      </div>
    );
  }

  if (meta.previewKind === 'grid') {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: 10, fontWeight: 700, color: meta.tint, marginBottom: 6, letterSpacing: '0.15em' }}>
          {meta.icon} {meta.name}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                background: `${meta.tint}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: meta.tint,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ◯
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (meta.previewKind === 'banner') {
    return (
      <div
        style={{
          ...baseStyle,
          padding: '14px 14px',
          background: `linear-gradient(135deg, ${meta.tint} 0%, ${meta.tint}aa 100%)`,
          color: '#fff',
          border: 'none',
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', opacity: 0.8, marginBottom: 4 }}>
          {meta.icon} {meta.name}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{meta.description}</div>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.25)',
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          打开 →
        </span>
      </div>
    );
  }

  // list
  return (
    <div style={baseStyle}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 7px',
          borderRadius: 999,
          background: `${meta.tint}18`,
          color: meta.tint,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          marginBottom: 8,
        }}
      >
        {meta.icon} {meta.name}
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 0',
            borderTop: i === 0 ? 'none' : '1px solid rgba(15,23,42,0.05)',
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: meta.tint,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
          <div style={{ height: 6, background: 'rgba(15,23,42,0.08)', borderRadius: 3, flex: 1 }} />
        </div>
      ))}
    </div>
  );
}
