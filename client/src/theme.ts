import type { ThemeConfig } from 'antd';

// Palette from the ui-ux-pro-max "Educational App" profile: indigo primary, accessible red for errors.
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#4F46E5',
    colorError: '#DC2626',
    colorBgLayout: '#F5F7FF',
    colorBorderSecondary: '#E0E7FF',
    colorText: '#1E1B4B',
    colorTextSecondary: '#475569',
    borderRadius: 8,
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontSize: 15,
    controlHeight: 40,
  },
  components: {
    Layout: { headerBg: '#FFFFFF', headerPadding: '0 24px' },
    Table: { headerBg: '#EEF2FF' },
  },
};
