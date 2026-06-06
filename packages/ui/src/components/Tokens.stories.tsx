import type { Meta, StoryObj } from '@storybook/react';

const SWATCHES: { name: string; varName: string }[] = [
  { name: 'primary', varName: '--cpm-primary' },
  { name: 'primary-strong', varName: '--cpm-primary-strong' },
  { name: 'primary-soft', varName: '--cpm-primary-soft' },
  { name: 'accent', varName: '--cpm-accent' },
  { name: 'gold', varName: '--cpm-gold' },
  { name: 'gold-soft', varName: '--cpm-gold-soft' },
  { name: 'app-bg', varName: '--cpm-app-bg' },
  { name: 'sunken', varName: '--cpm-sunken' },
  { name: 'ink-1', varName: '--cpm-ink-1' },
  { name: 'ink-2', varName: '--cpm-ink-2' },
  { name: 'up', varName: '--cpm-up' },
  { name: 'down', varName: '--cpm-down' },
  { name: 'medal-gold', varName: '--cpm-medal-gold' },
  { name: 'medal-silver', varName: '--cpm-medal-silver' },
  { name: 'medal-bronze', varName: '--cpm-medal-bronze' },
];

function Palette() {
  return (
    <div style={{ fontFamily: 'var(--cpm-font-sans)', padding: 24 }}>
      <div
        style={{
          height: 120,
          borderRadius: 'var(--cpm-r-xl)',
          background: 'var(--cpm-grad-brand)',
          boxShadow: 'var(--cpm-elev-candy)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 20,
          marginBottom: 24,
        }}
      >
        领奖台渐变 grad-brand
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {SWATCHES.map((s) => (
          <div key={s.name} style={{ width: 120 }}>
            <div
              style={{
                height: 56,
                borderRadius: 'var(--cpm-r-md)',
                background: `var(${s.varName})`,
                boxShadow: 'var(--cpm-elev-soft)',
                border: '1px solid var(--cpm-border-subtle)',
              }}
            />
            <div style={{ fontSize: 12, color: 'var(--cpm-ink-2)', marginTop: 6 }}>{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof Palette> = { title: 'Foundations/Tokens', component: Palette };
export default meta;
type Story = StoryObj<typeof Palette>;
export const Palette_: Story = {};
