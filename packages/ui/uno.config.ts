import { defineConfig, presetUno } from 'unocss';

export const cpmUnoConfig = defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      ink: 'var(--cpm-ink)',
      paper: 'var(--cpm-paper)',
      cRed: 'var(--cpm-red)',
      cOrange: 'var(--cpm-orange)',
      cYellow: 'var(--cpm-yellow)',
      cBlue: 'var(--cpm-blue)',
      cPink: 'var(--cpm-pink)',
      cGreen: 'var(--cpm-green)',
      cPurple: 'var(--cpm-purple)',
      cTeal: 'var(--cpm-teal)',
      primary: 'var(--cpm-primary)',
      primarySoft: 'var(--cpm-primary-soft)',
      accent: 'var(--cpm-accent)',
      gold: 'var(--cpm-gold)',
      appbg: 'var(--cpm-app-bg)',
      surface: 'var(--cpm-surface)',
      ink1: 'var(--cpm-ink-1)',
      ink2: 'var(--cpm-ink-2)',
    },
    fontFamily: {
      kuaile: '"ZCOOL KuaiLe", "PingFang SC", sans-serif',
      qingke: '"ZCOOL QingKe HuangYou", "PingFang SC", sans-serif',
      bangers: '"Bangers", cursive',
      marker: '"Permanent Marker", cursive',
    },
  },
});

export default cpmUnoConfig;
