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

  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  },

  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
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
    gray: generateColorScale('gray'),
    blue: generateColorScale('blue'),
    green: generateColorScale('green'),
    cyan: generateColorScale('cyan'),
    orange: generateColorScale('orange'),
    red: generateColorScale('red'),
    yellow: generateColorScale('yellow')
  },

  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      }
    },
    ActionIcon: {
      classNames: {
        root: 'border-2'
      }
    },
    InputBase: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    NumberInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    Textarea: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    PasswordInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    Select: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1 text-base',
        input: 'text-sm bg-background',
        option: 'text-sm',
        section: 'bg-background'
      }
    },
    Checkbox: {
      defaultProps: {
        size: 'sm',
        radius: 'sm'
      },
      classNames: {
        label: 'text-base'
      }
    },
    Switch: {
      defaultProps: {
        size: 'sm'
      },
      classNames: {
        label: 'text-base'
      }
    },
    MonthPickerInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    DatePickerInput: {
      defaultProps: {
        size: 'md',
        radius: 'md'
      },
      classNames: {
        label: 'mb-1',
        input: 'text-sm bg-background'
      }
    },
    InputClearButton: {
      defaultProps: {
        size: 'sm'
      },
      classNames: {
        root: 'bg-background!'
      }
    },
    Notification: {
      classNames: {
        title: 'text-foreground font-semibold',
        description: 'text-foreground'
      }
    },
    Modal: {
      defaultProps: {
        radius: '12px',
        padding: 'lg'
      }
    }
  }
});
