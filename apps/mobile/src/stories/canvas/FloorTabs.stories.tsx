import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { FloorTabs } from '../../canvas/floor/FloorTabs';
import { useFloorStore } from '../../canvas/floor/useFloorStore';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

const meta = {
  title: 'Canvas/FloorTabs',
  component: FloorTabs,
  decorators: [withStoryWrapper({ bg: 'canvas', padding: 0, fill: true })],
  args: { screenH: 600 },
} satisfies Meta<typeof FloorTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Seed helper ───────────────────────────────────────────────────────────────

function withFloors(labels: string[], activeIndex = 0) {
  return function FloorStory() {
    useEffect(() => {
      useFloorStore.setState({
        floors: labels.map((label, i) => ({
          index: i, label, heightFt: 10, rooms: [], stairs: [],
        })),
        activeIndex,
      });
    }, []);
    return <FloorTabs screenH={600} />;
  };
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const TwoFloors: Story = {
  render: withFloors(['Ground Floor', 'First Floor']),
};

export const ThreeFloors: Story = {
  render: withFloors(['Ground Floor', 'First Floor', 'Terrace'], 1),
};

export const FourFloors: Story = {
  render: withFloors(['Basement', 'Ground Floor', 'First Floor', 'Terrace'], 0),
};

export const SingleFloor: Story = {
  render: withFloors(['Ground Floor']),
};

/** Shows how tabs look inside a realistic dark canvas shell. */
export const WithCanvasShell: Story = {
  render: () => {
    useEffect(() => {
      useFloorStore.setState({
        floors: [
          { index: 0, label: 'Ground Floor', heightFt: 10, rooms: [], stairs: [] },
          { index: 1, label: 'First Floor',  heightFt: 10, rooms: [], stairs: [] },
        ],
        activeIndex: 0,
      });
    }, []);

    return (
      <View style={{ flex: 1, backgroundColor: '#F5F2EC' }}>
        {/* Simulated canvas content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#8A857C', fontSize: 13 }}>← Floor tabs on left edge</Text>
        </View>
        {/* FloorTabs renders as an absolute overlay */}
        <FloorTabs screenH={600} />
      </View>
    );
  },
};
