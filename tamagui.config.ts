import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';
import { fonts } from './src/theme/fonts';
import { themes } from './src/theme/themes';

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes,
  fonts,
  defaultFont: 'body',
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
