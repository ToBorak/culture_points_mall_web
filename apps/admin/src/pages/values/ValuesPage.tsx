import { useDimensions } from '@cpm/api-client';
import { DimChip, Panel } from '@cpm/ui';

export function ValuesPage() {
  const q = useDimensions();
  return (
    <Panel>
      <h1 className="font-qingke text-2xl mb-4">价值观维度</h1>
      {q.isLoading && <div>加载中...</div>}
      <div className="flex flex-wrap gap-2">
        {q.data?.map((d) => (
          <DimChip key={d.id} code={d.code} name={d.name} active />
        ))}
      </div>
      <p className="mt-4 text-sm text-ink/60">完整增删改在后续 Phase 上线。</p>
    </Panel>
  );
}
