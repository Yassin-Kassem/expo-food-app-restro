import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart } from '../../../contexts/CartContext';
import { spacing, radius, fontWeight, shadows } from '../../../constants/theme';

const TabBarIcon = ({ name, color, focused, badge, accentColor }) => {
    return (
        <View style={styles.tabIconContainer}>
            <View style={styles.iconWrapper}>
                <Ionicons 
                    name={focused ? name : `${name}-outline`} 
                    size={hp('2.8%')} 
                    color={color} 
                />
            </View>
            {badge > 0 && (
                <View style={styles.badge}>
                    <Ionicons name="ellipse" size={hp('1%')} color={accentColor || "#FF6B4A"} />
                </View>
            )}
        </View>
    );
};

export default function UserTabsLayout() {
    const { theme, isDarkMode } = useTheme();
    const { itemCount } = useCart();

    return (
        <>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: hp('1.3%'),
                    fontWeight: fontWeight.semibold,
                    marginTop: hp('0.3%'),
                    marginBottom: Platform.OS === 'ios' ? 0 : hp('0.8%'),
                },
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? hp('11%') : hp('9%'),
                    paddingTop: hp('0.8%'),
                    paddingBottom: Platform.OS === 'ios' ? hp('2.5%') : hp('1%'),
                    ...shadows.medium,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 10,
                },
                tabBarItemStyle: {
                    paddingTop: hp('0.5%'),
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="home" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="browse"
                options={{
                    title: 'Browse',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="search" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="receipt" color={color} focused={focused} badge={0} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="person" color={color} focused={focused} />
                    ),
                }}
            />
        </Tabs>
        </>
    );
}

const styles = StyleSheet.create({
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    iconWrapper: {
        width: hp('5%'),
        height: hp('3.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: wp('2%'),
    },
});

