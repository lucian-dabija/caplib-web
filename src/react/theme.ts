import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  dark: {
    100: '#1a202c',
    200: '#171923',
    300: '#0e1118',
    400: '#0a0c11',
    500: '#050609',
    gradient: 'linear-gradient(180deg, #1a202c 0%, #0a0c11 100%)',
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          _disabled: {
            bg: 'brand.500',
          },
        },
      },
      outline: {
        borderColor: 'whiteAlpha.300',
        color: 'white',
        _hover: {
          bg: 'whiteAlpha.100',
        },
      },
      ghost: {
        color: 'white',
        _hover: {
          bg: 'whiteAlpha.100',
        },
      },
      link: {
        color: 'brand.500',
        _hover: {
          textDecoration: 'none',
          color: 'brand.600',
        },
      },
      gradient: {
        bgGradient: 'linear(to-r, brand.500, accent.500)',
        color: 'white',
        _hover: {
          bgGradient: 'linear(to-r, brand.600, accent.600)',
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'dark.200',
        boxShadow: 'xl',
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: 'whiteAlpha.200',
      },
      header: {
        borderBottom: '1px solid',
        borderColor: 'whiteAlpha.100',
        pb: 4,
      },
      body: {
        py: 6,
      },
      footer: {
        borderTop: '1px solid',
        borderColor: 'whiteAlpha.100',
        pt: 4,
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'dark.200',
        boxShadow: 'xl',
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: 'whiteAlpha.200',
        overflow: 'hidden',
      },
      header: {
        py: 4,
        px: 6,
      },
      body: {
        py: 4,
        px: 6,
      },
      footer: {
        py: 4,
        px: 6,
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        bg: 'whiteAlpha.50',
        borderColor: 'whiteAlpha.200',
        _hover: {
          borderColor: 'whiteAlpha.300',
        },
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
        },
      },
    },
  },
  Radio: {
    baseStyle: {
      control: {
        borderColor: 'whiteAlpha.300',
        _checked: {
          bg: 'brand.500',
          borderColor: 'brand.500',
        },
      },
    },
  },
  Tabs: {
    variants: {
      enclosed: {
        tab: {
          color: 'whiteAlpha.700',
          _selected: {
            color: 'white',
            bg: 'whiteAlpha.100',
          },
        },
      },
      'soft-rounded': {
        tab: {
          color: 'whiteAlpha.700',
          _selected: {
            color: 'white',
            bg: 'brand.500',
          },
        },
      },
    },
  },
};

const styles = {
  global: {
    'html, body': {
      color: 'white',
      bg: '#0a0c11',
    },
  },
};

const capAuthTheme = extendTheme({
  config,
  colors,
  components,
  styles,
});

export default capAuthTheme;