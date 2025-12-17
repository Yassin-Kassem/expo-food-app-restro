import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from '../../contexts/LocationContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * RestaurantMapView - Interactive map with restaurant markers
 * Uses WebView with Leaflet.js for full compatibility with new architecture
 */

const generateMapHTML = (restaurants, userLocation, theme) => {
    const lat = userLocation?.latitude || 37.7749;
    const lng = userLocation?.longitude || -122.4194;
    
    // Build restaurant locations lookup for centering
    const restaurantLocationsJS = restaurants.map(r => {
        const rLat = r.location?.lat || lat + (Math.random() - 0.5) * 0.02;
        const rLng = r.location?.lng || lng + (Math.random() - 0.5) * 0.02;
        return `'${r.id}': [${rLat}, ${rLng}]`;
    }).join(',\n                ');
    
    const markersJS = restaurants.map((r, index) => {
        // Restaurants store coordinates as location.lat/lng
        const rLat = r.location?.lat || lat + (Math.random() - 0.5) * 0.02;
        const rLng = r.location?.lng || lng + (Math.random() - 0.5) * 0.02;
        
        return `
            var marker${index} = L.marker([${rLat}, ${rLng}], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div class="marker" data-id="${r.id}"><span>${r.priceRange || '$'}</span></div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                })
            }).addTo(map);
            marker${index}.on('click', function() {
                // Center map on the restaurant location
                map.setView([${rLat}, ${rLng}], 15, { animate: true });
                // Send message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'markerClick', id: '${r.id}', lat: ${rLat}, lng: ${rLng}}));
            });
        `;
    }).join('\n');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: 100%; height: 100vh; overflow: hidden; }
            #map { width: 100%; height: 100%; }
            
            .custom-marker .marker {
                width: 36px;
                height: 36px;
                background: ${theme.primary};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                border: 2px solid white;
                transition: all 0.2s ease;
            }
            
            .custom-marker .marker span {
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 11px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .custom-marker .marker.selected {
                width: 44px;
                height: 44px;
                background: #FF6B35;
                z-index: 1000 !important;
            }
            
            .user-marker {
                width: 18px;
                height: 18px;
                background: #4A90D9;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 0 0 8px rgba(74, 144, 217, 0.25), 0 2px 8px rgba(0,0,0,0.3);
            }
            
            .leaflet-control-zoom {
                border: none !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
            }
            
            .leaflet-control-zoom a {
                background: white !important;
                color: #333 !important;
                border: none !important;
                width: 36px !important;
                height: 36px !important;
                line-height: 36px !important;
                font-size: 18px !important;
            }
            
            .leaflet-control-zoom a:first-child {
                border-radius: 12px 12px 0 0 !important;
            }
            
            .leaflet-control-zoom a:last-child {
                border-radius: 0 0 12px 12px !important;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', {
                zoomControl: true,
                attributionControl: false
            }).setView([${lat}, ${lng}], 14);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);
            
            // User location marker
            var userMarker = L.marker([${lat}, ${lng}], {
                icon: L.divIcon({
                    className: 'user-location',
                    html: '<div class="user-marker"></div>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                })
            }).addTo(map);
            
            // Restaurant markers
            ${markersJS}
            
            // Restaurant locations lookup
            var restaurantLocations = {
                ${restaurantLocationsJS}
            };
            
            // Center on user button handler
            function centerOnUser() {
                map.setView([${lat}, ${lng}], 14, { animate: true });
            }
            
            // Center on restaurant by ID
            function centerOnRestaurant(id) {
                var loc = restaurantLocations[id];
                if (loc) {
                    map.setView(loc, 15, { animate: true });
                }
            }
            
            // Expose functions to React Native
            window.centerOnUser = centerOnUser;
            window.centerOnRestaurant = centerOnRestaurant;
        </script>
    </body>
    </html>
    `;
};

const RestaurantCard = ({ restaurant, onPress, theme, isVisible }) => {
    const slideAnim = useRef(new Animated.Value(100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible && restaurant) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 100,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible, restaurant]);

    if (!restaurant) return null;

    return (
        <Animated.View 
            style={[
                styles.cardContainer,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                }
            ]}
        >
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface }]}
                onPress={onPress}
                activeOpacity={0.95}
            >
                <Image 
                    source={{ uri: restaurant.image }}
                    style={styles.cardImage}
                />
                
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardName, { color: theme.textPrimary }]} numberOfLines={1}>
                            {restaurant.name || 'Restaurant'}
                        </Text>
                        <View style={[styles.ratingBadge, { backgroundColor: '#FFD700' }]}>
                            <Ionicons name="star" size={12} color="#fff" />
                            <Text style={styles.ratingText}>{(restaurant.rating || 0).toFixed(1)}</Text>
                        </View>
                    </View>
                    
                    <Text style={[styles.cardCategories, { color: theme.textMuted }]} numberOfLines={1}>
                        {restaurant.categories?.join(' • ') || 'Restaurant'}
                    </Text>
                    
                    <View style={styles.cardMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={theme.primary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {restaurant.estimatedDeliveryTime || 30} min
                            </Text>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        
                        <View style={styles.metaItem}>
                            <Ionicons name="bicycle-outline" size={14} color={theme.primary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                ${(restaurant.deliveryFee || 0).toFixed(2)}
                            </Text>
                        </View>
                        
                        {restaurant.distance ? (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                                <View style={styles.metaItem}>
                                    <Ionicons name="location-outline" size={14} color={theme.primary} />
                                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                        {restaurant.distance} km
                                    </Text>
                                </View>
                            </>
                        ) : null}
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={[styles.viewButton, { backgroundColor: theme.primary }]}
                    onPress={onPress}
                >
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const RestaurantMapView = ({ restaurants, onRestaurantPress }) => {
    const { theme } = useTheme();
    const { location, address, hasLocation, getCurrentLocation, loading } = useLocation();
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const webViewRef = useRef(null);

    // Auto-fetch location when map opens if no location set
    useEffect(() => {
        if (!hasLocation && !loading) {
            getCurrentLocation();
        }
    }, [hasLocation, loading, getCurrentLocation]);

    // Location is stored directly as { latitude, longitude } in context
    const userLocation = useMemo(() => {
        if (location?.latitude && location?.longitude) {
            return {
                latitude: location.latitude,
                longitude: location.longitude,
            };
        }
        return null;
    }, [location]);

    const mapHTML = useMemo(() => {
        return generateMapHTML(restaurants, userLocation, theme);
    }, [restaurants, userLocation, theme]);

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerClick') {
                const restaurant = restaurants.find(r => r.id === data.id);
                setSelectedRestaurant(restaurant);
            }
        } catch (e) {
            console.warn('Failed to parse message from WebView:', e);
        }
    };

    const handleCenterOnUser = () => {
        if (webViewRef.current) {
            webViewRef.current.injectJavaScript('window.centerOnUser(); true;');
        }
    };

    const handleCloseCard = () => {
        setSelectedRestaurant(null);
    };

    // Show loading while getting location
    if (loading && !userLocation) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
                <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
                    <Ionicons name="navigate" size={hp('5%')} color={theme.primary} />
                    <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>
                        Getting your location...
                    </Text>
                    <Text style={[styles.loadingSubtitle, { color: theme.textMuted }]}>
                        This will help us find restaurants near you
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Map */}
            <WebView
                ref={webViewRef}
                source={{ html: mapHTML }}
                style={styles.map}
                onMessage={handleMessage}
                onLoad={() => setMapReady(true)}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                cacheEnabled={true}
            />

            {/* Location header overlay */}
            <View style={[styles.locationOverlay, { backgroundColor: theme.surface }]}>
                <TouchableOpacity 
                    style={styles.locationInfo}
                    onPress={getCurrentLocation}
                    activeOpacity={0.7}
                >
                    <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="navigate" size={hp('2%')} color={theme.primary} />
                    </View>
                    <View style={styles.locationText}>
                        <Text style={[styles.locationLabel, { color: theme.textMuted }]}>
                            {hasLocation ? 'Delivering to' : 'Set location'}
                        </Text>
                        <Text style={[styles.locationAddress, { color: theme.textPrimary }]} numberOfLines={1}>
                            {address || 'Tap to get current location'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Map controls */}
            <View style={styles.mapControls}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.surface }]}
                    onPress={handleCenterOnUser}
                >
                    <Ionicons name="locate" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Restaurant count */}
            <View style={[styles.countBadge, { backgroundColor: theme.surface }]}>
                <Ionicons name="restaurant-outline" size={14} color={theme.primary} />
                <Text style={[styles.countText, { color: theme.textPrimary }]}>
                    {restaurants.length} restaurants nearby
                </Text>
            </View>

            {/* Selected restaurant card */}
            <RestaurantCard
                restaurant={selectedRestaurant}
                onPress={() => {
                    if (selectedRestaurant) {
                        onRestaurantPress?.(selectedRestaurant);
                    }
                }}
                theme={theme}
                isVisible={!!selectedRestaurant}
            />

            {/* Close card overlay when tapping map */}
            {selectedRestaurant && (
                <TouchableOpacity
                    style={styles.closeOverlay}
                    onPress={handleCloseCard}
                    activeOpacity={1}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    
    // Loading state
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingCard: {
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: radius.xl,
        ...shadows.medium,
    },
    loadingTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginTop: spacing.md,
    },
    loadingSubtitle: {
        fontSize: fontSize.body,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    
    // Location overlay
    locationOverlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? hp('6%') : hp('2%'),
        left: spacing.md,
        right: spacing.md,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        ...shadows.medium,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: hp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationText: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    locationLabel: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    locationAddress: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },

    // Map controls
    mapControls: {
        position: 'absolute',
        right: spacing.md,
        top: Platform.OS === 'ios' ? hp('16%') : hp('12%'),
        gap: spacing.sm,
    },
    controlButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.small,
    },

    // Count badge
    countBadge: {
        position: 'absolute',
        bottom: hp('12%'),
        left: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        ...shadows.small,
    },
    countText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },

    // Restaurant card
    cardContainer: {
        position: 'absolute',
        bottom: hp('12%'),
        left: spacing.md,
        right: spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.xl,
        overflow: 'hidden',
        ...shadows.large,
    },
    cardImage: {
        width: hp('10%'),
        height: hp('10%'),
    },
    cardContent: {
        flex: 1,
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        flex: 1,
        marginRight: spacing.xs,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.sm,
        gap: 2,
    },
    ratingText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: fontWeight.bold,
    },
    cardCategories: {
        fontSize: fontSize.caption,
        marginTop: 2,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    divider: {
        width: 1,
        height: 12,
        marginHorizontal: spacing.sm,
    },
    viewButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },

    // Close overlay
    closeOverlay: {
        position: 'absolute',
        top: hp('20%'),
        left: 0,
        right: 0,
        bottom: hp('25%'),
    },
});

export default RestaurantMapView;
