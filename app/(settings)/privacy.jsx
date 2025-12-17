import React from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';

export default function Privacy() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: theme.surface }]}
                >
                    <Ionicons name="arrow-back" size={hp('2.4%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Privacy Policy</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Information We Collect
                    </Text>
                    <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                        We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This information may include your name, email address, phone number, delivery address, and payment information.
                    </Text>
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        How We Use Your Information
                    </Text>
                    <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                        We use the information we collect to process your orders, provide customer support, send you promotional communications (with your consent), and improve our services.
                    </Text>
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Data Security
                    </Text>
                    <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                        We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                    </Text>
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Your Rights
                    </Text>
                    <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                        You have the right to access, update, or delete your personal information at any time. You can also opt out of promotional communications by following the unsubscribe instructions in our emails.
                    </Text>
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Contact Us
                    </Text>
                    <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                        If you have any questions about this Privacy Policy, please contact us at privacy@foodapp.com.
                    </Text>
                </View>

                <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
                    Last updated: December 2024
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: hp('2.25%'),
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    headerSpacer: {
        width: hp('4.5%'),
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('10%'),
    },
    section: {
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    sectionText: {
        fontSize: fontSize.body,
        lineHeight: hp('2.8%'),
    },
    lastUpdated: {
        textAlign: 'center',
        fontSize: fontSize.caption,
        marginTop: spacing.lg,
    },
});



