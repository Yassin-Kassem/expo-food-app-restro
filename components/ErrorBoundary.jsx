import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../constants/theme';

/**
 * Simple Error Boundary for React Native
 * Note: React Native doesn't support Error Boundaries like web React,
 * but this component can be used to catch and display errors gracefully
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error for debugging
        if (__DEV__) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        // In production, send to error tracking service
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback 
                    error={this.state.error} 
                    onReset={this.handleReset}
                    theme={this.props.theme}
                />
            );
        }

        return this.props.children;
    }
}

function ErrorFallback({ error, onReset, theme }) {
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.content, { backgroundColor: theme.surface }]}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                    Something went wrong
                </Text>
                <Text style={[styles.message, { color: theme.textSecondary }]}>
                    {__DEV__ ? error?.message : 'An unexpected error occurred. Please try again.'}
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={onReset}
                >
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    content: {
        padding: spacing.xl,
        borderRadius: radius.lg,
        alignItems: 'center',
        maxWidth: 400,
    },
    title: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: fontSize.body * 1.5,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
    },
    buttonText: {
        color: '#FFF',
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
});

