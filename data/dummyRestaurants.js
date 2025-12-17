// Dummy restaurant data for UI development
export const dummyRestaurants = [
    {
        id: '1',
        name: 'Osteria Francescana',
        description: 'Experience fine Italian dining with authentic flavors and elegant ambiance. Our chef brings traditional recipes with a modern twist.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        rating: 4.8,
        reviewCount: 234,
        categories: ['Italian', 'Fine Dining', 'European'],
        address: '2727 Indian Creek Dr, Miami Beach, FL 33140',
        location: {
            lat: 25.7907,
            lng: -80.1300
        },
        phone: '+1 (305) 555-0123',
        priceRange: '$$$',
        estimatedDeliveryTime: 35,
        deliveryFee: 5.99,
        status: 'active',
        hours: {
            monday: { open: '11:00', close: '22:00' },
            tuesday: { open: '11:00', close: '22:00' },
            wednesday: { open: '11:00', close: '22:00' },
            thursday: { open: '11:00', close: '22:00' },
            friday: { open: '11:00', close: '23:00' },
            saturday: { open: '11:00', close: '23:00' },
            sunday: { open: '12:00', close: '21:00' }
        }
    },
    {
        id: '2',
        name: 'Yardbird Table & Bar',
        description: 'Southern comfort food with a modern twist. Known for our famous fried chicken and craft cocktails.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        rating: 4.5,
        reviewCount: 189,
        categories: ['American', 'Southern', 'Comfort Food'],
        address: '1600 Lenox Ave., Miami Beach, FL 33139',
        location: {
            lat: 25.7900,
            lng: -80.1280
        },
        phone: '+1 (305) 555-0124',
        priceRange: '$$',
        estimatedDeliveryTime: 25,
        deliveryFee: 4.99,
        status: 'active',
        hours: {
            monday: { open: '11:00', close: '23:00' },
            tuesday: { open: '11:00', close: '23:00' },
            wednesday: { open: '11:00', close: '23:00' },
            thursday: { open: '11:00', close: '23:00' },
            friday: { open: '11:00', close: '00:00' },
            saturday: { open: '10:00', close: '00:00' },
            sunday: { open: '10:00', close: '22:00' }
        }
    },
    {
        id: '3',
        name: 'Bodega Taqueria y Tequila',
        description: 'Authentic Mexican street food and premium tequila selection. Fresh ingredients, bold flavors.',
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800',
        rating: 4.8,
        reviewCount: 312,
        categories: ['Mexican', 'Tacos', 'Latin'],
        address: '1220 16th St, Miami Beach, FL 33139',
        location: {
            lat: 25.7850,
            lng: -80.1320
        },
        phone: '+1 (305) 555-0125',
        priceRange: '$$',
        estimatedDeliveryTime: 20,
        deliveryFee: 3.99,
        status: 'active',
        hours: {
            monday: { open: '12:00', close: '22:00' },
            tuesday: { open: '12:00', close: '22:00' },
            wednesday: { open: '12:00', close: '22:00' },
            thursday: { open: '12:00', close: '23:00' },
            friday: { open: '12:00', close: '23:00' },
            saturday: { open: '12:00', close: '23:00' },
            sunday: { open: '12:00', close: '22:00' }
        }
    },
    {
        id: '4',
        name: 'Broken Shaker at Freehand',
        description: 'Rooftop bar and restaurant with craft cocktails and international cuisine. Perfect for a night out.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        rating: 4.3,
        reviewCount: 156,
        categories: ['Bar', 'International', 'Cocktails'],
        address: '2727 Indian Creek Dr, Miami Beach, FL 33140',
        location: {
            lat: 25.7920,
            lng: -80.1310
        },
        phone: '+1 (305) 555-0126',
        priceRange: '$$',
        estimatedDeliveryTime: 30,
        deliveryFee: 5.99,
        status: 'active',
        hours: {
            monday: { open: '17:00', close: '02:00' },
            tuesday: { open: '17:00', close: '02:00' },
            wednesday: { open: '17:00', close: '02:00' },
            thursday: { open: '17:00', close: '02:00' },
            friday: { open: '17:00', close: '03:00' },
            saturday: { open: '17:00', close: '03:00' },
            sunday: { open: '17:00', close: '02:00' }
        }
    },
    {
        id: '5',
        name: 'MILA Restaurant',
        description: 'Mediterranean-inspired rooftop dining with stunning views. Fresh seafood and seasonal ingredients.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        rating: 4.5,
        reviewCount: 278,
        categories: ['Mediterranean', 'Seafood', 'Rooftop'],
        address: '1636 Meridian Ave Rooftop, Miami Beach, FL 33139',
        location: {
            lat: 25.7880,
            lng: -80.1290
        },
        phone: '+1 (305) 555-0127',
        priceRange: '$$$',
        estimatedDeliveryTime: 40,
        deliveryFee: 6.99,
        status: 'active',
        hours: {
            monday: { open: '18:00', close: '23:00' },
            tuesday: { open: '18:00', close: '23:00' },
            wednesday: { open: '18:00', close: '23:00' },
            thursday: { open: '18:00', close: '23:00' },
            friday: { open: '18:00', close: '00:00' },
            saturday: { open: '18:00', close: '00:00' },
            sunday: { open: '18:00', close: '22:00' }
        }
    },
    {
        id: '6',
        name: 'Joe\'s Stone Crab',
        description: 'Miami institution since 1913. World-famous stone crabs and fresh seafood in a classic setting.',
        image: 'https://images.unsplash.com/photo-1552569973-610e49b16a0e?w=800',
        rating: 4.7,
        reviewCount: 456,
        categories: ['Seafood', 'American', 'Classic'],
        address: '11 Washington Ave, Miami Beach, FL 33139',
        location: {
            lat: 25.7750,
            lng: -80.1300
        },
        phone: '+1 (305) 555-0128',
        priceRange: '$$$',
        estimatedDeliveryTime: 45,
        deliveryFee: 7.99,
        status: 'active',
        hours: {
            monday: { open: '11:30', close: '22:00' },
            tuesday: { open: '11:30', close: '22:00' },
            wednesday: { open: '11:30', close: '22:00' },
            thursday: { open: '11:30', close: '22:00' },
            friday: { open: '11:30', close: '23:00' },
            saturday: { open: '11:30', close: '23:00' },
            sunday: { open: '11:30', close: '22:00' }
        }
    },
    {
        id: '7',
        name: 'Pabu Izakaya',
        description: 'Authentic Japanese izakaya with traditional small plates, sushi, and sake. Modern elegance meets traditional flavors.',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
        rating: 5.0,
        reviewCount: 143,
        categories: ['Japanese', 'Sushi', 'Izakaya'],
        address: 'Sutter St, San Francisco, CA',
        location: {
            lat: 25.7800,
            lng: -80.1270
        },
        phone: '+1 (305) 555-0129',
        priceRange: '$$$',
        estimatedDeliveryTime: 30,
        deliveryFee: 5.99,
        status: 'active',
        hours: {
            monday: { open: '17:00', close: '23:00' },
            tuesday: { open: '17:00', close: '23:00' },
            wednesday: { open: '17:00', close: '23:00' },
            thursday: { open: '17:00', close: '23:00' },
            friday: { open: '17:00', close: '00:00' },
            saturday: { open: '17:00', close: '00:00' },
            sunday: { open: '17:00', close: '22:00' }
        }
    },
    {
        id: '8',
        name: 'Maestro\'s Steakhouse',
        description: 'Premium steaks and fine wines in an upscale atmosphere. Perfect for special occasions.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        rating: 4.6,
        reviewCount: 201,
        categories: ['Steakhouse', 'American', 'Fine Dining'],
        address: 'Financial District, San Francisco, CA',
        location: {
            lat: 25.7820,
            lng: -80.1250
        },
        phone: '+1 (305) 555-0130',
        priceRange: '$$$$',
        estimatedDeliveryTime: 50,
        deliveryFee: 8.99,
        status: 'active',
        hours: {
            monday: { open: '17:00', close: '22:00' },
            tuesday: { open: '17:00', close: '22:00' },
            wednesday: { open: '17:00', close: '22:00' },
            thursday: { open: '17:00', close: '23:00' },
            friday: { open: '17:00', close: '23:00' },
            saturday: { open: '17:00', close: '23:00' },
            sunday: { open: '17:00', close: '22:00' }
        }
    }
];

// Helper function to add distance to restaurants
export const addDistanceToRestaurants = (restaurants, userLocation) => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        return restaurants;
    }

    return restaurants.map(restaurant => {
        if (restaurant.location) {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                restaurant.location.lat,
                restaurant.location.lng
            );
            return { ...restaurant, distance };
        }
        return restaurant;
    });
};

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
};


