export function action(name: string) {
  return (...args: unknown[]) => {
    console.log(`[storybook:${name}]`, ...args);
  };
}
