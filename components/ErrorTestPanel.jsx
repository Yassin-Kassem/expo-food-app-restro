import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../constants/theme';
import { 
    simulateNetworkError, 
    simulateTimeoutError, 
    simulatePermissionError,
    simulateNotFoundError,
    simulateQuotaError,
    simulateValidationError
} from '../utils/testErrorHelpers';
import { updateRestaurant, getRestaurantByOwner } from '../services/restaurantService';
import { uploadImage } from '../services/storageService';
import { getCurrentUser } from '../services/authService';
import { showErrorToast } from '../utils/toast';

/**
 * Error Testing Panel Component
 * Add this to any screen for quick error testing in development
 * 
 * Usage:
 * import ErrorTestPanel from '../components/ErrorTestPanel';
 * 
 * {__DEV__ && <ErrorTestPanel />}
 */
export default function ErrorTestPanel() {
    const { theme } = useTheme();
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!__DEV__) {
        return null; // Only show in development
    }

    const runTest = async (testName, testFn) => {
        setLoading(true);
        setTestResult(null);
        
        try {
            await testFn();
            setTestResult({ success: true, message: `${testName} completed successfully` });
        } catch (error) {
            setTestResult({ 
                success: false, 
                message: `${testName} failed`,
                error: error.message || error.toString(),
                code: error.code
            });
        } finally {
            setLoading(false);
        }
    };

    const testNetworkError = () => runTest('Network Error', async () => {
        throw simulateNetworkError();
    });

    const testTimeoutError = () => runTest('Timeout Error', async () => {
        throw simulateTimeoutError();
    });

    const testPermissionError = () => runTest('Permission Error', async () => {
        throw simulatePermissionError();
    });

    const testNotFoundError = () => runTest('Not Found Error', async () => {
        throw simulateNotFoundError();
    });

    const testQuotaError = () => runTest('Quota Error', async () => {
        throw simulateQuotaError();
    });

    const testValidationError = () => runTest('Validation Error', () => {
        const result = simulateValidationError();
        setTestResult({ 
            success: false, 
            message: 'Validation Error',
            error: result.error,
            errors: result.errors
        });
    });

    const testRestaurantFetch = () => runTest('Restaurant Fetch', async () => {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        const result = await getRestaurantByOwner(user.uid);
        if (!result.success) {
            throw new Error(result.error);
        }
    });

    const testRestaurantUpdate = () => runTest('Restaurant Update', async () => {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        const restaurant = await getRestaurantByOwner(user.uid);
        if (!restaurant.success) {
            throw new Error('Restaurant not found');
        }
        const result = await updateRestaurant(restaurant.data.id, { 
            testField: 'test' 
        });
        if (!result.success) {
            throw new Error(result.error);
        }
    });

    const testImageUpload = () => runTest('Image Upload', async () => {
        // This will fail if no image selected, which is expected
        const result = await uploadImage('invalid-uri', { folder: 'test' });
        if (!result.success) {
            throw new Error(result.error);
        }
    });

    const TestButton = ({ title, onPress, color = theme.primary }) => (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: color }]}
            onPress={onPress}
            disabled={loading}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
                🧪 Error Testing Panel
            </Text>
            
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    Simulated Errors
                </Text>
                
                <TestButton title="Network Error" onPress={testNetworkError} />
                <TestButton title="Timeout Error" onPress={testTimeoutError} />
                <TestButton title="Permission Error" onPress={testPermissionError} />
                <TestButton title="Not Found Error" onPress={testNotFoundError} />
                <TestButton title="Quota Error" onPress={testQuotaError} />
                <TestButton title="Validation Error" onPress={testValidationError} />

                <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: spacing.md }]}>
                    Real Service Tests
                </Text>
                
                <TestButton 
                    title="Test Restaurant Fetch" 
                    onPress={testRestaurantFetch}
                    color={theme.info || '#3B82F6'}
                />
                <TestButton 
                    title="Test Restaurant Update" 
                    onPress={testRestaurantUpdate}
                    color={theme.info || '#3B82F6'}
                />
                <TestButton 
                    title="Test Image Upload" 
                    onPress={testImageUpload}
                    color={theme.info || '#3B82F6'}
                />

                {testResult && (
                    <View style={[
                        styles.result,
                        { 
                            backgroundColor: testResult.success ? '#ECFDF5' : '#FEE2E2',
                            borderColor: testResult.success ? '#10B981' : '#EF4444'
                        }
                    ]}>
                        <Text style={[
                            styles.resultTitle,
                            { color: testResult.success ? '#059669' : '#DC2626' }
                        ]}>
                            {testResult.success ? '✅ Success' : '❌ Error'}
                        </Text>
                        <Text style={styles.resultMessage}>{testResult.message}</Text>
                        {testResult.error && (
                            <Text style={styles.resultError}>Error: {testResult.error}</Text>
                        )}
                        {testResult.code && (
                            <Text style={styles.resultCode}>Code: {testResult.code}</Text>
                        )}
                        {testResult.errors && (
                            <Text style={styles.resultError}>
                                Errors: {JSON.stringify(testResult.errors, null, 2)}
                            </Text>
                        )}
                    </View>
                )}

                {loading && (
                    <Text style={[styles.loading, { color: theme.textSecondary }]}>
                        Testing...
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: 400,
        borderTopWidth: 2,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.md,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    scrollView: {
        maxHeight: 320,
    },
    sectionTitle: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
    },
    button: {
        padding: spacing.sm,
        borderRadius: radius.md,
        marginBottom: spacing.xs,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    result: {
        marginTop: spacing.md,
        padding: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    resultTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    resultMessage: {
        fontSize: fontSize.caption,
        marginBottom: spacing.xs,
    },
    resultError: {
        fontSize: fontSize.caption,
        marginTop: spacing.xs,
        fontFamily: 'monospace',
    },
    resultCode: {
        fontSize: fontSize.caption,
        marginTop: spacing.xs,
        fontWeight: fontWeight.medium,
    },
    loading: {
        textAlign: 'center',
        marginTop: spacing.sm,
        fontSize: fontSize.caption,
    },
});

