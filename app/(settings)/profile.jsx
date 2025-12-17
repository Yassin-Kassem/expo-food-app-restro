import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    TextInput,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomModal from '../../components/CustomModal';

export default function Profile() {
    const { theme, isDarkMode } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setModalVisible(true);
    };

    const initial = name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U';

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
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <TouchableOpacity style={[styles.changePhotoBtn, { backgroundColor: theme.surface }]}>
                        <Ionicons name="camera" size={hp('2%')} color={theme.primary} />
                        <Text style={[styles.changePhotoText, { color: theme.primary }]}>
                            Change Photo
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: theme.surfaceAlt,
                                color: theme.textPrimary,
                            }]}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.textMuted}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: theme.surfaceAlt,
                                color: theme.textMuted,
                            }]}
                            placeholder="Enter your email"
                            placeholderTextColor={theme.textMuted}
                            value={email}
                            editable={false}
                        />
                        <Text style={[styles.helperText, { color: theme.textMuted }]}>
                            Email cannot be changed
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: theme.surfaceAlt,
                                color: theme.textPrimary,
                            }]}
                            placeholder="Enter your phone number"
                            placeholderTextColor={theme.textMuted}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <CustomModal
                visible={modalVisible}
                title="Success"
                message="Profile updated successfully"
                type="success"
                primaryButtonText="OK"
                onPrimaryPress={() => setModalVisible(false)}
                onClose={() => setModalVisible(false)}
            />
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
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: hp('12%'),
        height: hp('12%'),
        borderRadius: hp('6%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        color: '#fff',
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
    },
    changePhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        gap: spacing.xs,
        ...shadows.soft,
    },
    changePhotoText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    formSection: {
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    input: {
        padding: spacing.md,
        borderRadius: radius.md,
        fontSize: fontSize.body,
    },
    helperText: {
        fontSize: fontSize.caption,
        marginTop: spacing.xs,
    },
    saveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});



