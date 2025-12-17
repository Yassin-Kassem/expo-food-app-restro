import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../constants/theme';

const SectionHeader = ({
    title,
    subtitle,
    onSeeAllPress,
    seeAllText = 'See all',
    accentColor,
    style,
}) => {
    const { theme } = useTheme();
    const color = accentColor || theme.primary;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.leftSection}>
                {/* Accent bar */}
                <View style={[styles.accentBar, { backgroundColor: color }]} />
                <View>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            {onSeeAllPress && (
                <TouchableOpacity 
                    onPress={onSeeAllPress}
                    style={styles.seeAllButton}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.seeAllText, { color }]}>
                        {seeAllText}
                    </Text>
                    <Ionicons name="arrow-forward" size={hp('1.8%')} color={color} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    accentBar: {
        width: wp('1%'),
        height: hp('3%'),
        borderRadius: wp('0.5%'),
    },
    title: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: fontSize.caption,
        marginTop: hp('0.1%'),
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('0.5%'),
    },
    seeAllText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
});

export default SectionHeader;
