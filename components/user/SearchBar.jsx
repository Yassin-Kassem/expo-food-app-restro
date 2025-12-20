import React, { useState, useRef } from 'react';
import { 
    View, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';

const SearchBar = ({
    value = '',
    onChangeText,
    onSubmit,
    onFilterPress,
    placeholder = 'Search restaurants...',
    showFilter = true,
    autoFocus = false,
    style,
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    const handleClear = () => {
        onChangeText?.('');
        inputRef.current?.focus();
    };

    return (
        <View style={[styles.wrapper, style]}>
            <View 
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.surfaceAlt,
                        borderColor: isFocused ? theme.primary : 'transparent',
                    }
                ]}
            >
                {/* Search Icon */}
                <Ionicons 
                    name="search" 
                    size={hp('2.2%')} 
                    color={isFocused ? theme.primary : theme.textMuted} 
                />

                {/* Input */}
                <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: theme.textPrimary }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onSubmitEditing={() => onSubmit?.(value)}
                    returnKeyType="search"
                    autoFocus={autoFocus}
                    autoCorrect={false}
                    autoCapitalize="none"
                />

                {/* Clear Button */}
                {value.length > 0 && (
                    <TouchableOpacity 
                        onPress={handleClear}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close-circle" size={hp('2.2%')} color={theme.textMuted} />
                    </TouchableOpacity>
                )}

                {/* Filter Button */}
                {showFilter && (
                    <>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <TouchableOpacity 
                            onPress={onFilterPress}
                            style={[styles.filterButton, { backgroundColor: theme.primary }]}
                        >
                            <Ionicons name="options-outline" size={hp('1.8%')} color="#fff" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
        paddingVertical: hp('0.8%'),
        borderRadius: radius.xl,
        borderWidth: 2,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
        paddingVertical: hp('0.5%'),
    },
    clearButton: {
        marginRight: spacing.sm,
    },
    divider: {
        width: 1,
        height: hp('2.5%'),
    },
    filterButton: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SearchBar;
