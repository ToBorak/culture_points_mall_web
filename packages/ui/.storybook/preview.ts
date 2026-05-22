import type { Preview } from '@storybook/react';
import '../src/tokens/index.css';

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'paper', values: [{ name: 'paper', value: '#fffef8' }] },
  },
};
export default preview;
