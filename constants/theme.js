import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const lightColors = {
    primary: '#1DB954', // Forest Green
    primaryLight: '#22C55E',
    primaryDark: '#16A34A',
    secondary: '#1F2937', // Charcoal
    accent: '#FF6B4A', // Coral for promos
    background: '#F5F5F7', // Soft off-white for visual depth
    surface: '#FFFFFF', // Pure white cards stand out on background
    surfaceAlt: '#EAECEF', // Slightly darker for inputs/search
    textPrimary: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textMuted: '#8A8A8A',
    border: '#E0E0E0',
    error: '#DC2626',
    success: '#059669',
    warning: '#D97706',
    info: '#2563EB',
    rating: '#F59E0B',
    favorite: '#DB2777',
    // Additional colors for specific components
    overlay: 'rgba(0, 0, 0, 0.5)',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    statusOpen: '#ECFDF5',
    statusOpenText: '#059669',
    statusClosed: '#F3F4F6',
    statusClosedText: '#6B7280',
    pendingBg: '#FEF3C7',
    pendingText: '#D97706',
    activeBg: '#DBEAFE',
    activeText: '#2563EB',
    completedBg: '#D1FAE5',
    completedText: '#059669',
};

export const darkColors = {
    primary: '#22C55E', // Slightly brighter green for dark mode
    primaryLight: '#34D399',
    primaryDark: '#16A34A',
    secondary: '#F9FAFB',
    accent: '#FF8E6B', // Lighter coral for dark mode visibility
    background: '#0F172A', // Deep navy slate
    surface: '#1E293B', // Slate 800
    surfaceAlt: '#334155', // Slate 700
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#475569', // Slate 600
    error: '#F87171', // Lighter red for dark mode
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    rating: '#FCD34D',
    favorite: '#F472B6',
    // Additional colors for specific components
    overlay: 'rgba(0, 0, 0, 0.7)',
    cardShadow: '#000',
    statusOpen: '#064E3B',
    statusOpenText: '#34D399',
    statusClosed: '#374151',
    statusClosedText: '#9CA3AF',
    pendingBg: '#78350F',
    pendingText: '#FCD34D',
    activeBg: '#1E3A5F',
    activeText: '#60A5FA',
    completedBg: '#064E3B',
    completedText: '#34D399',
};

export const spacing = {
    xs: wp('1%'),    // ~4px
    sm: wp('2%'),    // ~8px
    md: wp('4%'),    // ~16px
    lg: wp('6%'),    // ~24px
    xl: wp('8%'),    // ~32px
    xxl: wp('12%'),  // ~48px
};

export const fontSize = {
    caption: hp('1.5%'), // ~12px
    body: hp('2.1%'),    // ~16px
    subtitle: hp('2.5%'), // ~19px
    title: hp('3.2%'),   // ~24px
    hero: hp('4%'),      // ~30px
    titleXL: hp('4.5%')  // ~34px
};

export const fontWeight = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

export const radius = {
    xs: wp('1.5%'),  // 6px
    sm: wp('2%'),    // 8px
    md: wp('3%'),    // 12px
    lg: wp('4%'),    // 16px
    xl: wp('6%'),    // 24px
    pill: wp('25%'), // Pill shape
    circle: 9999,    // Perfect circle
};

export const shadows = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('0.5%') },
        shadowOpacity: 0.06,
        shadowRadius: wp('3%'),
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('1%') },
        shadowOpacity: 0.1,
        shadowRadius: wp('4%'),
        elevation: 4,
    },
    floating: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('1.5%') },
        shadowOpacity: 0.12,
        shadowRadius: wp('6%'),
        elevation: 8,
    }
};
