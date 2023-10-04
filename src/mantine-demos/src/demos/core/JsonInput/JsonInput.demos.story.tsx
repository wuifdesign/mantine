import { Meta, StoryObj } from '@storybook/react';
import * as demos from './index';
import { renderDemo } from '../../../render-demo';

const meta: Meta = {
  title: 'JsonInput',
};
export default meta;

type Story = StoryObj;

export const DemoUsage: Story = {
  name: '⭐ Demo: usage',
  render: renderDemo(demos.usage),
};

export const DemoConfigurator: Story = {
  name: '⭐ Demo: configurator',
  render: renderDemo(demos.configurator),
};

export const DemoDisabled: Story = {
  name: '⭐ Demo: disabled',
  render: renderDemo(demos.disabled),
};

export const DemoStylesApi: Story = {
  name: '⭐ Demo: stylesApi',
  render: renderDemo(demos.stylesApi),
};
