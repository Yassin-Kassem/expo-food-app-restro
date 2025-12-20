import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomModal from '../../components/CustomModal';
import Input from '../../components/Input';
import { updateUserProfile } from '../../services/userService';
import { firebaseAuth } from '../../config/firebase.config';

export default function Profile() {
    const { theme, isDarkMode } = useTheme();
    const { user, userData } = useAuth();
    const router = useRouter();
    
    const [name, setName] = useState(user?.displayName || userData?.name || userData?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(userData?.phoneNumber || '');
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [errors, setErrors] = useState({});

    // Update name when userData changes
    useEffect(() => {
        if (userData?.name || userData?.displayName) {
            setName(userData.name || userData.displayName || '');
        }
        if (userData?.phoneNumber) {
            setPhone(userData.phoneNumber || '');
        }
    }, [userData]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
        
        if (!user?.uid) {
            setErrors({ general: 'User not authenticated' });
            return;
        }
        
        setSaving(true);
        try {
            // Update Firebase Auth displayName
            if (name.trim() && firebaseAuth().currentUser) {
                try {
                    await firebaseAuth().currentUser.updateProfile({
                        displayName: name.trim()
                    });
                } catch (authError) {
                    console.error('Error updating auth profile:', authError);
                }
            }

            // Update Firestore user document
            const result = await updateUserProfile(user.uid, {
                name: name.trim(),
                phoneNumber: phone.trim() || null,
            });

            if (!result.success) {
                setSaving(false);
                setErrors({ general: result.error || 'Failed to save profile. Please try again.' });
                return;
            }

            setSaving(false);
            setModalVisible(true);
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaving(false);
            setErrors({ general: 'Failed to save profile. Please try again.' });
        }
    };

    const initial = name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
                </View>

                {/* Form */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                    {errors.general && (
                        <Text style={[styles.errorText, { color: theme.error }]}>
                            {errors.general}
                        </Text>
                    )}
                    
                    <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        error={errors.name}
                        autoCapitalize="words"
                    />

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                        <View style={[styles.emailInputContainer, { backgroundColor: theme.surfaceAlt }]}>
                            <TextInput
                                style={[styles.emailInput, { color: theme.textMuted }]}
                                value={email}
                                editable={false}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                        <Text style={[styles.helperText, { color: theme.textMuted }]}>
                            Email cannot be changed
                        </Text>
                    </View>

                    <Input
                        label="Phone Number (Optional)"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        { backgroundColor: theme.primary },
                        saving && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
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
        marginTop: spacing.md,
    },
    avatar: {
        width: hp('12%'),
        height: hp('12%'),
        borderRadius: hp('6%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
    },
    formSection: {
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emailInputContainer: {
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    emailInput: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    helperText: {
        fontSize: fontSize.caption,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    errorText: {
        fontSize: fontSize.caption,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    saveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        minHeight: hp('6%'),
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});



