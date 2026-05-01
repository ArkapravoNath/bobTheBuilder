import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '../action';
import { RoomTypePicker } from '../../canvas/room/RoomTypePicker';
import type { RoomType } from '@bob/shared-schemas';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

const meta = {
  title: 'Canvas/RoomTypePicker',
  component: RoomTypePicker,
  decorators: [withStoryWrapper({ bg: 'cream', padding: 0, fill: true })],
  argTypes: {
    visible: { control: 'boolean' },
  },
  args: {
    visible:     true,
    currentType: 'living' as RoomType,
    onSelect:    action('room-type-selected'),
    onClose:     action('closed'),
    onDelete:    action('deleted'),
  },
} satisfies Meta<typeof RoomTypePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVisible: Story = {
  args: { currentType: 'living' },
};

export const BedroomSelected: Story = {
  args: { currentType: 'bedroom' },
};

export const KitchenSelected: Story = {
  args: { currentType: 'kitchen' },
};

/** Interactive: select a room type and see the label update. */
export const Interactive: Story = {
  render: () => {
    const [type, setType]       = useState<RoomType>('living');
    const [visible, setVisible] = useState(true);

    return (
      <View style={{ flex: 1 }}>
        <Text style={{ padding: 16, color: '#1C1917', fontSize: 14 }}>
          Selected: <Text style={{ fontWeight: '700' }}>{type}</Text>
        </Text>
        <RoomTypePicker
          visible={visible}
          currentType={type}
          onSelect={(t) => { setType(t); }}
          onClose={() => setVisible(false)}
          onDelete={action('deleted')}
        />
      </View>
    );
  },
};
