import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '../action';
import { BuddyButton } from '../../components/BuddyButton';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

const meta = {
  title: 'Components/BuddyButton',
  component: BuddyButton,
  decorators: [withStoryWrapper({ bg: 'cream', centered: true })],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'teak', 'ghost'],
    },
    label:     { control: 'text' },
    disabled:  { control: 'boolean' },
    loading:   { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    uppercase: { control: 'boolean' },
  },
  args: {
    onPress: action('button-pressed'),
    label:   'Button',
  },
} satisfies Meta<typeof BuddyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Get Started', variant: 'primary' },
};

export const Teak: Story = {
  args: { label: 'Save Design', variant: 'teak' },
};

export const Secondary: Story = {
  args: { label: 'Cancel', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { label: 'Skip for now', variant: 'ghost' },
};

export const Loading: Story = {
  args: { label: 'Saving…', variant: 'primary', loading: true },
};

export const Disabled: Story = {
  args: { label: 'Unavailable', variant: 'primary', disabled: true },
};

export const FullWidth: Story = {
  args: { label: 'GENERATE LAYOUTS', variant: 'primary', fullWidth: true, uppercase: true },
  decorators: [withStoryWrapper({ bg: 'cream', padding: 24 })],
};

/** All variants stacked — visual regression reference. */
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12, width: '100%', paddingHorizontal: 24 }}>
      <BuddyButton label="Primary"   variant="primary"   onPress={action('primary')} />
      <BuddyButton label="Teak"      variant="teak"      onPress={action('teak')} />
      <BuddyButton label="Secondary" variant="secondary" onPress={action('secondary')} />
      <BuddyButton label="Ghost"     variant="ghost"     onPress={action('ghost')} />
      <BuddyButton label="Disabled"  variant="primary"   onPress={action('disabled')} disabled />
      <BuddyButton label="Loading"   variant="primary"   onPress={action('loading')} loading />
    </View>
  ),
};
