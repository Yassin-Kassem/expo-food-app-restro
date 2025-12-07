import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const lightColors = {
    primary: '#FF6B4A', // "Burnt Tangerine"
    secondary: '#1A1D1E', // Dark Gray
    background: '#F9FAFB', // Off-white
    surface: '#FFFFFF', // Pure White
    surfaceAlt: '#F3F4F6', // Input backgrounds
    textPrimary: '#1A1D1E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
};

export const darkColors = {
    primary: '#FF6B4A',
    secondary: '#FFFFFF',
    background: '#111827',
    surface: '#1F2937',
    surfaceAlt: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#374151',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
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
    body: hp('2.1%'),    // ~16px (Adjusted slightly for better readability)
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
    sm: wp('2%'),    // 8px
    md: wp('3%'),    // 12px
    lg: wp('4.2%'),  // 16px
    xl: wp('6%'),    // 24px
    pill: wp('25%'), // Large enough to be pill
};

export const shadows = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp('0.5%') }, // Responsive height offset
        shadowOpacity: 0.06,
        shadowRadius: wp('3%'), // Responsive radius
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
