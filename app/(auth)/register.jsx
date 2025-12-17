import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    TouchableOpacity, 
    StyleSheet, 
    TouchableWithoutFeedback, 
    Keyboard,
    Animated,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomModal from '../../components/CustomModal';
import { signUp } from '../../services/authService';

export default function Register() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error',
        retryable: false,
        errorCode: null
    });

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Password strength
    const getPasswordStrength = () => {
        if (!password) return { strength: 0, label: '', color: theme.textMuted };
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 1) return { strength: 1, label: 'Weak', color: theme.error };
        if (strength <= 2) return { strength: 2, label: 'Fair', color: theme.warning };
        if (strength <= 3) return { strength: 3, label: 'Good', color: theme.info };
        return { strength: 4, label: 'Strong', color: theme.primary };
    };

    const passwordStrength = getPasswordStrength();

    const getModalConfig = (error, errorCode, retryable) => {
        let type = 'error';
        let title = 'Registration Failed';
        
        switch (errorCode) {
            case 'VALIDATION_ERROR':
                type = 'warning';
                title = 'Validation Error';
                break;
            case 'INVALID_EMAIL':
                type = 'warning';
                title = 'Invalid Email';
                break;
            case 'EMAIL_IN_USE':
                type = 'error';
                title = 'Email Already Registered';
                break;
            case 'WEAK_PASSWORD':
                type = 'warning';
                title = 'Weak Password';
                break;
            case 'NETWORK_ERROR':
                type = 'warning';
                title = 'Connection Issue';
                break;
            case 'TOO_MANY_REQUESTS':
                type = 'warning';
                title = 'Too Many Attempts';
                break;
            default:
                type = retryable ? 'warning' : 'error';
                title = retryable ? 'Temporary Issue' : 'Registration Failed';
        }
        
        return { type, title };
    };

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) {
            newErrors.fullName = 'Name is required';
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            const config = getModalConfig(firstError, 'VALIDATION_ERROR', false);
            setErrorModal({
                visible: true,
                title: config.title,
                message: firstError,
                type: config.type,
                retryable: false,
                errorCode: 'VALIDATION_ERROR'
            });
        }
        
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        const result = await signUp(email, password, fullName);
        setLoading(false);
        if (!result.success) {
            const errorCode = result.errorCode || 'UNKNOWN_ERROR';
            const config = getModalConfig(result.error, errorCode, result.retryable || false);
            
            setErrorModal({
                visible: true,
                title: config.title,
                message: result.error || 'An error occurred. Please try again.',
                type: config.type,
                retryable: result.retryable || false,
                errorCode: errorCode
            });
        }
    };

    const handleRetry = () => {
        setErrorModal({ ...errorModal, visible: false });
        handleRegister();
    };

    const handleCloseErrorModal = () => {
        setErrorModal({ ...errorModal, visible: false });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Back Button */}
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <TouchableOpacity 
                                style={[styles.backButton, { backgroundColor: theme.surfaceAlt }]}
                                onPress={() => router.back()}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="arrow-back" size={hp('2.4%')} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Header */}
                        <Animated.View 
                            style={[
                                styles.header,
                                { 
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
                                <Ionicons name="person-add" size={hp('3.5%')} color={theme.primary} />
                            </View>
                            <Text style={[styles.title, { color: theme.textPrimary }]}>
                                Create Account
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                Join us and start ordering your favorite food
                            </Text>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View 
                            style={[
                                styles.form,
                                { 
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                }
                            ]}
                        >
                            {/* Full Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textPrimary }]}>Full Name</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { 
                                        backgroundColor: theme.surfaceAlt,
                                        borderColor: focusedField === 'name' ? theme.primary : 'transparent',
                                    },
                                    errors.fullName && { borderColor: theme.error }
                                ]}>
                                    <Ionicons 
                                        name="person-outline" 
                                        size={hp('2.2%')} 
                                        color={focusedField === 'name' ? theme.primary : theme.textMuted} 
                                    />
                                    <TextInput
                                        style={[styles.input, { color: theme.textPrimary }]}
                                        placeholder="Enter your full name"
                                        placeholderTextColor={theme.textMuted}
                                        value={fullName}
                                        onChangeText={setFullName}
                                        autoCapitalize="words"
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </View>
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textPrimary }]}>Email</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { 
                                        backgroundColor: theme.surfaceAlt,
                                        borderColor: focusedField === 'email' ? theme.primary : 'transparent',
                                    },
                                    errors.email && { borderColor: theme.error }
                                ]}>
                                    <Ionicons 
                                        name="mail-outline" 
                                        size={hp('2.2%')} 
                                        color={focusedField === 'email' ? theme.primary : theme.textMuted} 
                                    />
                                    <TextInput
                                        style={[styles.input, { color: theme.textPrimary }]}
                                        placeholder="Enter your email"
                                        placeholderTextColor={theme.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textPrimary }]}>Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    { 
                                        backgroundColor: theme.surfaceAlt,
                                        borderColor: focusedField === 'password' ? theme.primary : 'transparent',
                                    },
                                    errors.password && { borderColor: theme.error }
                                ]}>
                                    <Ionicons 
                                        name="lock-closed-outline" 
                                        size={hp('2.2%')} 
                                        color={focusedField === 'password' ? theme.primary : theme.textMuted} 
                                    />
                                    <TextInput
                                        style={[styles.input, { color: theme.textPrimary }]}
                                        placeholder="Create a password"
                                        placeholderTextColor={theme.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons 
                                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                            size={hp('2.2%')} 
                                            color={theme.textMuted} 
                                        />
                                    </TouchableOpacity>
                                </View>
                                
                                {/* Password Strength Indicator */}
                                {password.length > 0 && (
                                    <View style={styles.strengthContainer}>
                                        <View style={styles.strengthBars}>
                                            {[1, 2, 3, 4].map((level) => (
                                                <View 
                                                    key={level}
                                                    style={[
                                                        styles.strengthBar,
                                                        { 
                                                            backgroundColor: level <= passwordStrength.strength 
                                                                ? passwordStrength.color 
                                                                : theme.border 
                                                        }
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                        <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                                            {passwordStrength.label}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Terms Checkbox */}
                            <TouchableOpacity 
                                style={styles.termsRow}
                                onPress={() => setAgreedToTerms(!agreedToTerms)}
                                activeOpacity={0.8}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { 
                                        backgroundColor: agreedToTerms ? theme.primary : 'transparent',
                                        borderColor: agreedToTerms ? theme.primary : theme.border,
                                    }
                                ]}>
                                    {agreedToTerms && (
                                        <Ionicons name="checkmark" size={hp('1.6%')} color="#fff" />
                                    )}
                                </View>
                                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                                    I agree to the{' '}
                                    <Text style={{ color: theme.primary, fontWeight: fontWeight.semibold }}>
                                        Terms of Service
                                    </Text>
                                    {' '}and{' '}
                                    <Text style={{ color: theme.primary, fontWeight: fontWeight.semibold }}>
                                        Privacy Policy
                                    </Text>
                                </Text>
                            </TouchableOpacity>

                            {/* Register Button */}
                            <TouchableOpacity 
                                style={[
                                    styles.registerButton, 
                                    { backgroundColor: theme.primary },
                                    !agreedToTerms && { opacity: 0.6 }
                                ]}
                                onPress={handleRegister}
                                activeOpacity={0.9}
                                disabled={loading || !agreedToTerms}
                            >
                                {loading ? (
                                    <Text style={styles.registerButtonText}>Creating account...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.registerButtonText}>Create Account</Text>
                                        <Ionicons name="arrow-forward" size={hp('2.2%')} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                                <Text style={[styles.dividerText, { color: theme.textMuted }]}>or</Text>
                                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                            </View>

                            {/* Social Sign Up */}
                            <TouchableOpacity 
                                style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="logo-google" size={hp('2.4%')} color="#DB4437" />
                                <Text style={[styles.googleButtonText, { color: theme.textPrimary }]}>{"Continue with Google "}</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Login Link */}
                        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.replace('/login')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Error Modal */}
            <CustomModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                type={errorModal.type}
                primaryButtonText={errorModal.retryable ? "Retry" : "OK"}
                onPrimaryPress={errorModal.retryable ? handleRetry : handleCloseErrorModal}
                onClose={handleCloseErrorModal}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    backButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: hp('8%'),
        height: hp('8%'),
        borderRadius: hp('4%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: hp('3.5%'),
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: fontSize.body,
        textAlign: 'center',
        lineHeight: hp('2.8%'),
    },
    form: {
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: hp('1.6%'),
        borderRadius: radius.lg,
        borderWidth: 2,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    strengthBars: {
        flexDirection: 'row',
        flex: 1,
        gap: spacing.xs,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.semibold,
        marginLeft: spacing.sm,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    checkbox: {
        width: hp('2.5%'),
        height: hp('2.5%'),
        borderRadius: radius.xs,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        marginTop: hp('0.2%'),
    },
    termsText: {
        flex: 1,
        fontSize: fontSize.caption,
        lineHeight: hp('2.2%'),
        paddingTop: hp('0.4%'),
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('2%'),
        borderRadius: radius.lg,
        gap: spacing.sm,
        ...shadows.medium,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('1.8%'),
        paddingHorizontal: spacing.xl,
        borderRadius: 50,
        borderWidth: 1,
        gap: spacing.sm,
    },
    googleButtonText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: spacing.lg,
    },
    footerText: {
        fontSize: fontSize.body,
    },
    footerLink: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});
