import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '../action';
import { FixtureTray } from '../../canvas/fixture/FixtureTray';
import type { FixtureKind } from '../../canvas/fixture/fixtureTypes';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

const meta = {
  title: 'Canvas/FixtureTray',
  component: FixtureTray,
  decorators: [withStoryWrapper({ bg: 'dark', padding: 0, fill: true })],
  argTypes: {
    activeTool: {
      control: { type: 'select' },
      options: [null, 'door', 'window', 'stairs'],
    },
  },
  args: {
    activeTool: null,
    onSelectTool: action('tool-selected'),
  },
} satisfies Meta<typeof FixtureTray>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { activeTool: null },
};

export const DoorActive: Story = {
  args: { activeTool: 'door' },
};

export const WindowActive: Story = {
  args: { activeTool: 'window' },
};

export const StairsActive: Story = {
  args: { activeTool: 'stairs' },
};

/** Interactive: tap buttons to toggle active tool. */
export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState<FixtureKind | null>(null);
    return (
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#8A857C', fontSize: 12, marginBottom: 8 }}>
            Active: {active ?? '(none)'}
          </Text>
        </View>
        <FixtureTray activeTool={active} onSelectTool={setActive} />
      </View>
    );
  },
};
