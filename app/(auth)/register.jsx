import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { signUp } from '../../services/authService';

export default function Register() {
    const { theme } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        const result = await signUp(email, password);
        setLoading(false);
        if (result.success) {
            router.replace('/role-select');
        } else {
            setErrors({ general: result.error });
        }
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.background
        },
        container: {
            flex: 1
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xxl
        },
        title: {
            fontSize: hp('4%'),
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs,
            letterSpacing: -0.5
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            marginBottom: spacing.xxl
        },
        errorText: {
            fontSize: fontSize.caption,
            color: theme.error,
            marginBottom: spacing.md,
            textAlign: 'center',
            backgroundColor: '#FFF5F5',
            padding: spacing.sm,
            borderRadius: 8
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: spacing.xl
        },
        footerText: {
            fontSize: fontSize.body,
            color: theme.textSecondary
        },
        linkText: {
            fontSize: fontSize.body,
            color: theme.primary,
            fontWeight: fontWeight.bold,
            marginLeft: spacing.xs
        }
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>

                        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            error={errors.email}
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <Button
                            title="Sign Up"
                            onPress={handleRegister}
                            loading={loading}
                            style={{ marginTop: spacing.md }}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={styles.linkText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
