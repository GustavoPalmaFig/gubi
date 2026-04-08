import { colorsTuple, createTheme } from '@mantine/core';

function generateColorScale(color: string) {
  return colorsTuple([
    `color-mix(in srgb, var(--${color}) 10%, transparent)`,
    `color-mix(in srgb, var(--${color}) 20%, transparent)`,
    `color-mix(in srgb, var(--${color}) 30%, transparent)`,
    `color-mix(in srgb, var(--${color}) 40%, transparent)`,
    `color-mix(in srgb, var(--${color}) 50%, transparent)`,
    `var(--${color})`,
    `color-mix(in srgb, var(--${color}) 90%, transparent)`,
    `color-mix(in srgb, var(--${color}) 80%, transparent)`,
    `color-mix(in srgb, var(--${color}) 70%, transparent)`,
    `color-mix(in srgb, var(--${color}) 60%, transparent)`
  ]);
}

export const mantineTheme = createTheme({
  fontFamily: 'Inter, sans-serif',

  defaultRadius: 'md',

  primaryColor: 'primary',
  primaryShade: 5,

  colors: {
    primary: generateColorScale('primary'),
    primaryForeground: generateColorScale('primary-foreground'),
    secondary: generateColorScale('secondary'),
    secondaryForeground: generateColorScale('secondary-foreground'),
    positive: generateColorScale('positive'),
    positiveForeground: generateColorScale('positive-foreground'),
    negative: generateColorScale('negative'),
    negativeForeground: generateColorScale('negative-foreground'),
    warning: generateColorScale('warning'),
    warningForeground: generateColorScale('warning-foreground'),
    info: generateColorScale('info'),
    infoForeground: generateColorScale('info-foreground'),
    background: generateColorScale('background'),
    foreground: generateColorScale('foreground'),
    mutedForeground: generateColorScale('muted-foreground'),
    card: generateColorScale('card'),
    muted: generateColorScale('muted'),
    border: generateColorScale('border'),
    gray: generateColorScale('muted-foreground')
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      }
    },
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1'
      }
    },
    PasswordInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1'
      }
    }
  }
});
