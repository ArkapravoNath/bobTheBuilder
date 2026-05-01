import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { BuddyInput } from '../../components/BuddyInput';
import { withStoryWrapper } from '../hoc/withStoryWrapper';

const meta = {
  title: 'Components/BuddyInput',
  component: BuddyInput,
  decorators: [withStoryWrapper({ bg: 'cream', padding: 24 })],
  argTypes: {
    variant:     { control: { type: 'select' }, options: ['underline', 'box'] },
    label:       { control: 'text' },
    placeholder: { control: 'text' },
    error:       { control: 'text' },
    secureTextEntry: { control: 'boolean' },
  },
  args: {
    label:       'Email',
    placeholder: 'you@example.com',
    variant:     'underline',
  },
} satisfies Meta<typeof BuddyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = {
  args: { label: 'Email Address', placeholder: 'you@example.com', variant: 'underline' },
};

export const Box: Story = {
  args: { label: 'Search', placeholder: 'Search cities…', variant: 'box' },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    variant: 'underline',
    error: 'Please enter a valid email address.',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: '••••••••',
    variant: 'underline',
    secureTextEntry: true,
  },
};

/** Sign-in form — shows how inputs compose in a real screen context. */
export const SignInForm: Story = {
  decorators: [withStoryWrapper({ bg: 'white', padding: 32 })],
  render: () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    return (
      <View>
        <Text style={{ fontSize: 11, color: '#8A857C', fontWeight: '700', letterSpacing: 1.2, marginBottom: 24 }}>
          SIGN IN FORM
        </Text>
        <BuddyInput label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} variant="underline" />
        <BuddyInput label="Password" placeholder="••••••••" value={pass} onChangeText={setPass} secureTextEntry variant="underline" />
      </View>
    );
  },
};
