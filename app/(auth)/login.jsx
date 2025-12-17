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
import Button from '../../components/Button';
import CustomModal from '../../components/CustomModal';
import { signIn } from '../../services/authService';

export default function Login() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
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

    const getModalConfig = (error, errorCode, retryable) => {
        let type = 'error';
        let title = 'Login Failed';
        
        switch (errorCode) {
            case 'VALIDATION_ERROR':
                type = 'warning';
                title = 'Validation Error';
                break;
            case 'INVALID_EMAIL':
                type = 'warning';
                title = 'Invalid Email';
                break;
            case 'USER_NOT_FOUND':
                type = 'error';
                title = 'Account Not Found';
                break;
            case 'WRONG_PASSWORD':
            case 'INVALID_CREDENTIAL':
                type = 'error';
                title = 'Invalid Credentials';
                break;
            case 'USER_DISABLED':
                type = 'error';
                title = 'Account Disabled';
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
                title = retryable ? 'Temporary Issue' : 'Login Failed';
        }
        
        return { type, title };
    };

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!password) {
            newErrors.password = 'Password is required';
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

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        const result = await signIn(email, password);
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
        handleLogin();
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
                                <Ionicons name="person" size={hp('3.5%')} color={theme.primary} />
                            </View>
                            <Text style={[styles.title, { color: theme.textPrimary }]}>
                                Welcome back!
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                Sign in to continue ordering delicious food
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
                                        placeholder="Enter your password"
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
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity 
                                style={[styles.loginButton, { backgroundColor: theme.primary }]}
                                onPress={handleLogin}
                                activeOpacity={0.9}
                                disabled={loading}
                            >
                                {loading ? (
                                    <View style={styles.loadingDots}>
                                        <Text style={styles.loginButtonText}>Signing in...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.loginButtonText}>Sign In</Text>
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

                            {/* Social Login */}
                            <TouchableOpacity 
                                style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="logo-google" size={hp('2.4%')} color="#DB4437" />
                                <Text style={[styles.googleButtonText, { color: theme.textPrimary }]}>{"Continue with Google "}</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Sign Up Link */}
                        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.replace('/register')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>
                                    Sign Up
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('2%'),
        borderRadius: radius.lg,
        gap: spacing.sm,
        ...shadows.medium,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    loadingDots: {
        flexDirection: 'row',
        alignItems: 'center',
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
