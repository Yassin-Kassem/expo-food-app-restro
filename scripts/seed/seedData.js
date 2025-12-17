// Seed data for Firebase - Restaurants in Egypt (Cairo/6th October/Sheikh Zayed) and Passau, Germany
// Images are from Unsplash and will be downloaded and uploaded to Firebase Storage

export const restaurants = [
    // ===== 6TH OF OCTOBER CITY, EGYPT =====
    {
        id: 'rest-001',
        name: 'Koshary El Tahrir',
        description: 'Authentic Egyptian koshary made with love. Our signature blend of rice, pasta, lentils, and crispy onions topped with spicy tomato sauce.',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        rating: 4.7,
        reviewCount: 523,
        categories: ['Egyptian', 'Traditional', 'Vegetarian'],
        address: 'Mall of Arabia, 6th of October City, Giza',
        location: { lat: 29.9725, lng: 30.9432 },
        phone: '+20 100 123 4567',
        priceRange: '$',
        estimatedDeliveryTime: 25,
        deliveryFee: 15.00,
        hours: {
            monday: { open: '10:00', close: '23:00' },
            tuesday: { open: '10:00', close: '23:00' },
            wednesday: { open: '10:00', close: '23:00' },
            thursday: { open: '10:00', close: '00:00' },
            friday: { open: '10:00', close: '00:00' },
            saturday: { open: '10:00', close: '00:00' },
            sunday: { open: '10:00', close: '23:00' }
        }
    },
    {
        id: 'rest-002',
        name: 'Kebdet El Prince',
        description: 'Famous for the best liver sandwiches in Egypt. Fresh ingredients, secret spice blend, and grilled to perfection since 1985.',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        rating: 4.5,
        reviewCount: 412,
        categories: ['Egyptian', 'Street Food', 'Grilled'],
        address: 'El Hosary Square, 6th of October City, Giza',
        location: { lat: 29.9628, lng: 30.9285 },
        phone: '+20 100 234 5678',
        priceRange: '$',
        estimatedDeliveryTime: 20,
        deliveryFee: 12.00,
        hours: {
            monday: { open: '08:00', close: '02:00' },
            tuesday: { open: '08:00', close: '02:00' },
            wednesday: { open: '08:00', close: '02:00' },
            thursday: { open: '08:00', close: '03:00' },
            friday: { open: '08:00', close: '03:00' },
            saturday: { open: '08:00', close: '03:00' },
            sunday: { open: '08:00', close: '02:00' }
        }
    },
    {
        id: 'rest-003',
        name: 'Zooba October',
        description: 'Modern Egyptian street food with a twist. Foul, taameya, hawawshi, and more - all made fresh with premium ingredients.',
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
        rating: 4.6,
        reviewCount: 287,
        categories: ['Egyptian', 'Modern', 'Breakfast'],
        address: 'Arkan Plaza, 6th of October City, Giza',
        location: { lat: 29.9802, lng: 30.9518 },
        phone: '+20 100 345 6789',
        priceRange: '$$',
        estimatedDeliveryTime: 30,
        deliveryFee: 20.00,
        hours: {
            monday: { open: '07:00', close: '23:00' },
            tuesday: { open: '07:00', close: '23:00' },
            wednesday: { open: '07:00', close: '23:00' },
            thursday: { open: '07:00', close: '00:00' },
            friday: { open: '07:00', close: '00:00' },
            saturday: { open: '07:00', close: '00:00' },
            sunday: { open: '07:00', close: '23:00' }
        }
    },
    {
        id: 'rest-004',
        name: 'Abou Shakra',
        description: 'Premium Egyptian grills and kebabs. Tender meats marinated in our secret spices, charcoal grilled to perfection.',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        rating: 4.4,
        reviewCount: 356,
        categories: ['Egyptian', 'Grilled', 'Middle Eastern'],
        address: 'Juhayna Square, 6th of October City, Giza',
        location: { lat: 29.9712, lng: 30.9156 },
        phone: '+20 100 456 7890',
        priceRange: '$$$',
        estimatedDeliveryTime: 40,
        deliveryFee: 25.00,
        hours: {
            monday: { open: '12:00', close: '01:00' },
            tuesday: { open: '12:00', close: '01:00' },
            wednesday: { open: '12:00', close: '01:00' },
            thursday: { open: '12:00', close: '02:00' },
            friday: { open: '12:00', close: '02:00' },
            saturday: { open: '12:00', close: '02:00' },
            sunday: { open: '12:00', close: '01:00' }
        }
    },
    {
        id: 'rest-005',
        name: 'Bab El Sharq',
        description: 'Authentic Syrian cuisine in the heart of October. Famous for our shawarma, fattoush, and homemade hummus.',
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
        rating: 4.8,
        reviewCount: 198,
        categories: ['Syrian', 'Middle Eastern', 'Shawarma'],
        address: 'Dream Land, 6th of October City, Giza',
        location: { lat: 29.9545, lng: 30.8978 },
        phone: '+20 100 567 8901',
        priceRange: '$$',
        estimatedDeliveryTime: 35,
        deliveryFee: 18.00,
        hours: {
            monday: { open: '11:00', close: '00:00' },
            tuesday: { open: '11:00', close: '00:00' },
            wednesday: { open: '11:00', close: '00:00' },
            thursday: { open: '11:00', close: '01:00' },
            friday: { open: '11:00', close: '01:00' },
            saturday: { open: '11:00', close: '01:00' },
            sunday: { open: '11:00', close: '00:00' }
        }
    },
    {
        id: 'rest-006',
        name: 'Pizza October',
        description: 'Wood-fired Italian pizzas made with imported ingredients. Crispy crust, fresh mozzarella, and authentic recipes.',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        rating: 4.3,
        reviewCount: 267,
        categories: ['Italian', 'Pizza', 'Fast Food'],
        address: 'Dandy Mall, 6th of October City, Giza',
        location: { lat: 29.9678, lng: 30.9389 },
        phone: '+20 100 678 9012',
        priceRange: '$$',
        estimatedDeliveryTime: 30,
        deliveryFee: 20.00,
        hours: {
            monday: { open: '11:00', close: '23:00' },
            tuesday: { open: '11:00', close: '23:00' },
            wednesday: { open: '11:00', close: '23:00' },
            thursday: { open: '11:00', close: '00:00' },
            friday: { open: '11:00', close: '00:00' },
            saturday: { open: '11:00', close: '00:00' },
            sunday: { open: '11:00', close: '23:00' }
        }
    },

    // ===== SHEIKH ZAYED CITY, EGYPT =====
    {
        id: 'rest-007',
        name: 'Al Dayaa',
        description: 'Farm-to-table Egyptian cuisine. Fresh organic produce, traditional recipes, and a cozy village atmosphere.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        rating: 4.9,
        reviewCount: 445,
        categories: ['Egyptian', 'Organic', 'Family'],
        address: 'Hyper One, Sheikh Zayed City, Giza',
        location: { lat: 30.0412, lng: 30.9834 },
        phone: '+20 100 789 0123',
        priceRange: '$$$',
        estimatedDeliveryTime: 45,
        deliveryFee: 30.00,
        hours: {
            monday: { open: '12:00', close: '00:00' },
            tuesday: { open: '12:00', close: '00:00' },
            wednesday: { open: '12:00', close: '00:00' },
            thursday: { open: '12:00', close: '01:00' },
            friday: { open: '12:00', close: '01:00' },
            saturday: { open: '12:00', close: '01:00' },
            sunday: { open: '12:00', close: '00:00' }
        }
    },
    {
        id: 'rest-008',
        name: 'Kazouza',
        description: 'Retro Egyptian cafe serving classic comfort food. Try our famous feteer, molokhia, and freshly squeezed juices.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        rating: 4.6,
        reviewCount: 312,
        categories: ['Egyptian', 'Cafe', 'Desserts'],
        address: 'Arkan Plaza, Sheikh Zayed City, Giza',
        location: { lat: 30.0278, lng: 30.9723 },
        phone: '+20 100 890 1234',
        priceRange: '$$',
        estimatedDeliveryTime: 35,
        deliveryFee: 22.00,
        hours: {
            monday: { open: '09:00', close: '02:00' },
            tuesday: { open: '09:00', close: '02:00' },
            wednesday: { open: '09:00', close: '02:00' },
            thursday: { open: '09:00', close: '03:00' },
            friday: { open: '09:00', close: '03:00' },
            saturday: { open: '09:00', close: '03:00' },
            sunday: { open: '09:00', close: '02:00' }
        }
    },
    {
        id: 'rest-009',
        name: 'Hadramout Fish',
        description: 'Fresh seafood from Alexandria daily. Grilled, fried, or oven-baked - prepared the authentic Egyptian way.',
        imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        rating: 4.7,
        reviewCount: 234,
        categories: ['Seafood', 'Egyptian', 'Grilled'],
        address: 'Beverly Hills, Sheikh Zayed City, Giza',
        location: { lat: 30.0345, lng: 30.9567 },
        phone: '+20 100 901 2345',
        priceRange: '$$$',
        estimatedDeliveryTime: 40,
        deliveryFee: 28.00,
        hours: {
            monday: { open: '12:00', close: '00:00' },
            tuesday: { open: '12:00', close: '00:00' },
            wednesday: { open: '12:00', close: '00:00' },
            thursday: { open: '12:00', close: '01:00' },
            friday: { open: '12:00', close: '01:00' },
            saturday: { open: '12:00', close: '01:00' },
            sunday: { open: '12:00', close: '00:00' }
        }
    },
    {
        id: 'rest-010',
        name: 'Chicken Peri Peri',
        description: 'Flame-grilled chicken with our signature peri peri sauce. Spicy, tangy, and absolutely addictive.',
        imageUrl: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=800',
        rating: 4.4,
        reviewCount: 189,
        categories: ['Chicken', 'Grilled', 'Fast Food'],
        address: 'Mall of Egypt, Sheikh Zayed City, Giza',
        location: { lat: 30.0189, lng: 30.9712 },
        phone: '+20 100 012 3456',
        priceRange: '$$',
        estimatedDeliveryTime: 25,
        deliveryFee: 18.00,
        hours: {
            monday: { open: '10:00', close: '00:00' },
            tuesday: { open: '10:00', close: '00:00' },
            wednesday: { open: '10:00', close: '00:00' },
            thursday: { open: '10:00', close: '01:00' },
            friday: { open: '10:00', close: '01:00' },
            saturday: { open: '10:00', close: '01:00' },
            sunday: { open: '10:00', close: '00:00' }
        }
    },
    {
        id: 'rest-011',
        name: 'Beit El Foul',
        description: 'Traditional Egyptian breakfast all day. Foul medames, taameya, eggs, and fresh bread from our bakery.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        rating: 4.5,
        reviewCount: 567,
        categories: ['Egyptian', 'Breakfast', 'Traditional'],
        address: 'El Sheikh Zayed Road, Sheikh Zayed City, Giza',
        location: { lat: 30.0456, lng: 30.9456 },
        phone: '+20 100 123 4568',
        priceRange: '$',
        estimatedDeliveryTime: 20,
        deliveryFee: 10.00,
        hours: {
            monday: { open: '06:00', close: '16:00' },
            tuesday: { open: '06:00', close: '16:00' },
            wednesday: { open: '06:00', close: '16:00' },
            thursday: { open: '06:00', close: '16:00' },
            friday: { open: '06:00', close: '16:00' },
            saturday: { open: '06:00', close: '16:00' },
            sunday: { open: '06:00', close: '16:00' }
        }
    },
    {
        id: 'rest-012',
        name: 'Mandarine Koueider',
        description: 'Premium Egyptian desserts and ice cream. Famous for our kunafa, basbousa, and artisanal ice cream flavors.',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
        rating: 4.8,
        reviewCount: 423,
        categories: ['Desserts', 'Egyptian', 'Ice Cream'],
        address: 'City Stars Sheikh Zayed, Sheikh Zayed City, Giza',
        location: { lat: 30.0234, lng: 30.9823 },
        phone: '+20 100 234 5679',
        priceRange: '$$',
        estimatedDeliveryTime: 25,
        deliveryFee: 15.00,
        hours: {
            monday: { open: '10:00', close: '01:00' },
            tuesday: { open: '10:00', close: '01:00' },
            wednesday: { open: '10:00', close: '01:00' },
            thursday: { open: '10:00', close: '02:00' },
            friday: { open: '10:00', close: '02:00' },
            saturday: { open: '10:00', close: '02:00' },
            sunday: { open: '10:00', close: '01:00' }
        }
    },
    {
        id: 'rest-013',
        name: 'Sultan Ayub',
        description: 'Royal Middle Eastern cuisine. Lamb ouzi, mixed grills, and traditional rice dishes fit for a sultan.',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        rating: 4.6,
        reviewCount: 278,
        categories: ['Middle Eastern', 'Grilled', 'Fine Dining'],
        address: 'Galleria40, Sheikh Zayed City, Giza',
        location: { lat: 30.0312, lng: 30.9634 },
        phone: '+20 100 345 6780',
        priceRange: '$$$',
        estimatedDeliveryTime: 50,
        deliveryFee: 35.00,
        hours: {
            monday: { open: '13:00', close: '00:00' },
            tuesday: { open: '13:00', close: '00:00' },
            wednesday: { open: '13:00', close: '00:00' },
            thursday: { open: '13:00', close: '01:00' },
            friday: { open: '13:00', close: '01:00' },
            saturday: { open: '13:00', close: '01:00' },
            sunday: { open: '13:00', close: '00:00' }
        }
    },
    {
        id: 'rest-014',
        name: 'Wok This Way',
        description: 'Asian fusion cuisine with Egyptian flair. Noodles, stir-fries, and sushi rolls made with fresh ingredients.',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        rating: 4.3,
        reviewCount: 167,
        categories: ['Asian', 'Sushi', 'Noodles'],
        address: 'Americana Plaza, Sheikh Zayed City, Giza',
        location: { lat: 30.0167, lng: 30.9534 },
        phone: '+20 100 456 7891',
        priceRange: '$$',
        estimatedDeliveryTime: 35,
        deliveryFee: 22.00,
        hours: {
            monday: { open: '12:00', close: '23:00' },
            tuesday: { open: '12:00', close: '23:00' },
            wednesday: { open: '12:00', close: '23:00' },
            thursday: { open: '12:00', close: '00:00' },
            friday: { open: '12:00', close: '00:00' },
            saturday: { open: '12:00', close: '00:00' },
            sunday: { open: '12:00', close: '23:00' }
        }
    },

    // ===== PASSAU, GERMANY =====
    {
        id: 'rest-015',
        name: 'Bayerischer Löwe',
        description: 'Traditional Bavarian gasthaus serving authentic regional specialties. Schweinebraten, Weisswurst, and local beers.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        rating: 4.7,
        reviewCount: 312,
        categories: ['German', 'Bavarian', 'Traditional'],
        address: 'Ludwigstraße 12, 94032 Passau',
        location: { lat: 48.5736, lng: 13.4634 },
        phone: '+49 851 123 4567',
        priceRange: '$$',
        estimatedDeliveryTime: 35,
        deliveryFee: 3.50,
        hours: {
            monday: { open: '11:00', close: '22:00' },
            tuesday: { open: '11:00', close: '22:00' },
            wednesday: { open: '11:00', close: '22:00' },
            thursday: { open: '11:00', close: '22:00' },
            friday: { open: '11:00', close: '23:00' },
            saturday: { open: '11:00', close: '23:00' },
            sunday: { open: '11:00', close: '21:00' }
        }
    },
    {
        id: 'rest-016',
        name: 'Zur Goldenen Sonne',
        description: 'Historic restaurant in Passau old town. Experience traditional German hospitality with modern culinary touches.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        rating: 4.5,
        reviewCount: 198,
        categories: ['German', 'Fine Dining', 'European'],
        address: 'Höllgasse 8, 94032 Passau',
        location: { lat: 48.5745, lng: 13.4712 },
        phone: '+49 851 234 5678',
        priceRange: '$$$',
        estimatedDeliveryTime: 45,
        deliveryFee: 4.50,
        hours: {
            monday: { open: '12:00', close: '14:30' },
            tuesday: { open: '12:00', close: '22:00' },
            wednesday: { open: '12:00', close: '22:00' },
            thursday: { open: '12:00', close: '22:00' },
            friday: { open: '12:00', close: '23:00' },
            saturday: { open: '12:00', close: '23:00' },
            sunday: { open: '12:00', close: '21:00' }
        }
    },
    {
        id: 'rest-017',
        name: 'Pizzeria Venezia',
        description: 'Authentic Italian pizzeria in the heart of Passau. Stone-baked pizzas, fresh pasta, and Italian wines.',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        rating: 4.4,
        reviewCount: 267,
        categories: ['Italian', 'Pizza', 'Pasta'],
        address: 'Rindermarkt 5, 94032 Passau',
        location: { lat: 48.5728, lng: 13.4678 },
        phone: '+49 851 345 6789',
        priceRange: '$$',
        estimatedDeliveryTime: 30,
        deliveryFee: 2.90,
        hours: {
            monday: { open: '11:30', close: '22:00' },
            tuesday: { open: '11:30', close: '22:00' },
            wednesday: { open: '11:30', close: '22:00' },
            thursday: { open: '11:30', close: '22:00' },
            friday: { open: '11:30', close: '23:00' },
            saturday: { open: '11:30', close: '23:00' },
            sunday: { open: '12:00', close: '21:00' }
        }
    },
    {
        id: 'rest-018',
        name: 'Asia Garden',
        description: 'Pan-Asian cuisine featuring Vietnamese, Thai, and Chinese specialties. Fresh ingredients, authentic flavors.',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
        rating: 4.3,
        reviewCount: 145,
        categories: ['Asian', 'Vietnamese', 'Thai'],
        address: 'Bahnhofstraße 22, 94032 Passau',
        location: { lat: 48.5689, lng: 13.4523 },
        phone: '+49 851 456 7890',
        priceRange: '$$',
        estimatedDeliveryTime: 35,
        deliveryFee: 3.00,
        hours: {
            monday: { open: '11:30', close: '14:30' },
            tuesday: { open: '11:30', close: '22:00' },
            wednesday: { open: '11:30', close: '22:00' },
            thursday: { open: '11:30', close: '22:00' },
            friday: { open: '11:30', close: '22:30' },
            saturday: { open: '12:00', close: '22:30' },
            sunday: { open: '12:00', close: '21:00' }
        }
    },
    {
        id: 'rest-019',
        name: 'Café Kowalski',
        description: 'Cozy café with homemade cakes, breakfast, and light meals. Perfect for a relaxing afternoon by the Danube.',
        imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        rating: 4.6,
        reviewCount: 234,
        categories: ['Cafe', 'Breakfast', 'Bakery'],
        address: 'Oberer Sand 1, 94032 Passau',
        location: { lat: 48.5752, lng: 13.4689 },
        phone: '+49 851 567 8901',
        priceRange: '$',
        estimatedDeliveryTime: 25,
        deliveryFee: 2.50,
        hours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '20:00' },
            saturday: { open: '09:00', close: '20:00' },
            sunday: { open: '10:00', close: '18:00' }
        }
    },
    {
        id: 'rest-020',
        name: 'Döner König',
        description: 'Best döner kebab in Passau. Fresh bread, quality meat, and homemade sauces. Turkish street food at its finest.',
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
        rating: 4.5,
        reviewCount: 389,
        categories: ['Turkish', 'Kebab', 'Fast Food'],
        address: 'Nibelungenstraße 15, 94032 Passau',
        location: { lat: 48.5698, lng: 13.4567 },
        phone: '+49 851 678 9012',
        priceRange: '$',
        estimatedDeliveryTime: 20,
        deliveryFee: 2.00,
        hours: {
            monday: { open: '10:00', close: '23:00' },
            tuesday: { open: '10:00', close: '23:00' },
            wednesday: { open: '10:00', close: '23:00' },
            thursday: { open: '10:00', close: '23:00' },
            friday: { open: '10:00', close: '02:00' },
            saturday: { open: '10:00', close: '02:00' },
            sunday: { open: '11:00', close: '22:00' }
        }
    }
];

// Menu items mapped by restaurant ID
export const menuItems = {
    // EGYPT RESTAURANTS
    'rest-001': [ // Koshary El Tahrir
        { name: 'Koshary Regular', description: 'Classic Egyptian koshary with rice, pasta, lentils, chickpeas, and crispy onions.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Main Course', available: true },
        { name: 'Koshary Special', description: 'Large portion with extra toppings and our signature spicy sauce.', price: 50.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Main Course', available: true },
        { name: 'Koshary with Meat', description: 'Traditional koshary topped with tender beef pieces.', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', category: 'Main Course', available: true },
        { name: 'Extra Hot Sauce', description: 'Our famous spicy tomato and vinegar sauce.', price: 5.00, imageUrl: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400', category: 'Extras', available: true },
        { name: 'Lemon Mint Juice', description: 'Fresh squeezed lemon with mint leaves.', price: 20.00, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'Beverages', available: true }
    ],
    'rest-002': [ // Kebdet El Prince
        { name: 'Liver Sandwich', description: 'Grilled liver with Egyptian spices in fresh baladi bread.', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', category: 'Sandwiches', available: true },
        { name: 'Sausage Sandwich', description: 'Spiced Egyptian sausage with tahini and vegetables.', price: 30.00, imageUrl: 'https://images.unsplash.com/photo-1565299585323-38174c3d0e3a?w=400', category: 'Sandwiches', available: true },
        { name: 'Mixed Grill Plate', description: 'Liver, sausage, and kebab served with rice and salad.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', category: 'Main Course', available: true },
        { name: 'Brain Sandwich', description: 'Traditional Egyptian delicacy, fried brain in baladi bread.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Sandwiches', available: true },
        { name: 'Tahini Dip', description: 'Creamy tahini with lemon and garlic.', price: 15.00, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db23619621?w=400', category: 'Sides', available: true }
    ],
    'rest-003': [ // Zooba October
        { name: 'Foul Medames', description: 'Slow-cooked fava beans with olive oil, cumin, and lemon.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Taameya Plate', description: 'Crispy Egyptian falafel made with fava beans and herbs.', price: 40.00, imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400', category: 'Breakfast', available: true },
        { name: 'Hawawshi', description: 'Spiced minced meat baked in baladi bread.', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Main Course', available: true },
        { name: 'Shakshuka', description: 'Eggs poached in spiced tomato sauce with Egyptian spices.', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Egyptian Breakfast Platter', description: 'Foul, taameya, eggs, cheese, and fresh bread.', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', category: 'Breakfast', available: true }
    ],
    'rest-004': [ // Abou Shakra
        { name: 'Kofta Kebab', description: 'Charcoal grilled minced lamb kebab with spices.', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', category: 'Grills', available: true },
        { name: 'Shish Tawook', description: 'Marinated chicken breast grilled to perfection.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', category: 'Grills', available: true },
        { name: 'Mixed Grill Platter', description: 'Assortment of kebab, kofta, and ribs with sides.', price: 180.00, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Grills', available: true },
        { name: 'Lamb Chops', description: 'Tender lamb chops marinated in herbs and grilled.', price: 150.00, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', category: 'Grills', available: true },
        { name: 'Egyptian Rice', description: 'Vermicelli rice with nuts and raisins.', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Sides', available: true }
    ],
    'rest-005': [ // Bab El Sharq
        { name: 'Chicken Shawarma Plate', description: 'Thinly sliced marinated chicken with garlic sauce and pickles.', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', category: 'Main Course', available: true },
        { name: 'Meat Shawarma Sandwich', description: 'Beef shawarma wrapped in fresh saj bread.', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1565299585323-38174c3d0e3a?w=400', category: 'Sandwiches', available: true },
        { name: 'Fattoush Salad', description: 'Fresh salad with crispy pita, sumac, and pomegranate dressing.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', category: 'Salads', available: true },
        { name: 'Hummus', description: 'Creamy chickpea dip with tahini and olive oil.', price: 30.00, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db23619621?w=400', category: 'Appetizers', available: true },
        { name: 'Baklava (3 pieces)', description: 'Sweet layered pastry with nuts and honey syrup.', price: 40.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true }
    ],
    'rest-006': [ // Pizza October
        { name: 'Margherita Pizza', description: 'Classic tomato sauce, mozzarella, and fresh basil.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', category: 'Pizza', available: true },
        { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni and extra cheese.', price: 110.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Pizza', available: true },
        { name: 'Quattro Stagioni', description: 'Four seasons pizza with ham, mushrooms, artichokes, and olives.', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', category: 'Pizza', available: true },
        { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1584535548419-eb54458564ef?w=400', category: 'Sides', available: true },
        { name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert.', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true }
    ],
    'rest-007': [ // Al Dayaa
        { name: 'Molokhia with Chicken', description: 'Traditional green soup served with rice and chicken.', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', category: 'Main Course', available: true },
        { name: 'Stuffed Pigeon', description: 'Egyptian pigeon stuffed with freek wheat.', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', category: 'Main Course', available: true },
        { name: 'Mahshi Platter', description: 'Assorted stuffed vegetables with rice and herbs.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', category: 'Main Course', available: true },
        { name: 'Organic Salad', description: 'Fresh farm vegetables with Egyptian baladi dressing.', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', category: 'Salads', available: true },
        { name: 'Om Ali', description: 'Warm Egyptian bread pudding with nuts and cream.', price: 50.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true }
    ],
    'rest-008': [ // Kazouza
        { name: 'Feteer Meshaltet', description: 'Layered Egyptian pastry, sweet or savory options available.', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Main Course', available: true },
        { name: 'Feteer with Meat', description: 'Crispy feteer filled with spiced minced meat.', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Main Course', available: true },
        { name: 'Feteer with Cheese', description: 'Sweet feteer with cream cheese and honey.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Desserts', available: true },
        { name: 'Fresh Mango Juice', description: 'Seasonal Egyptian mango, freshly squeezed.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', category: 'Beverages', available: true },
        { name: 'Sahlab', description: 'Warm milk drink with cinnamon and nuts.', price: 30.00, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', category: 'Beverages', available: true }
    ],
    'rest-009': [ // Hadramout Fish
        { name: 'Grilled Sea Bass', description: 'Whole sea bass grilled with herbs and lemon.', price: 150.00, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', category: 'Seafood', available: true },
        { name: 'Fried Calamari', description: 'Crispy fried squid with tartar sauce.', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', category: 'Seafood', available: true },
        { name: 'Shrimp Tagine', description: 'Shrimp cooked in Egyptian spiced tomato sauce.', price: 130.00, imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', category: 'Seafood', available: true },
        { name: 'Mixed Seafood Platter', description: 'Assortment of fish, shrimp, and calamari.', price: 220.00, imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', category: 'Seafood', available: true },
        { name: 'Seafood Rice', description: 'Fragrant rice cooked with mixed seafood.', price: 110.00, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Main Course', available: true }
    ],
    'rest-010': [ // Chicken Peri Peri
        { name: 'Quarter Peri Peri Chicken', description: 'Flame-grilled chicken with your choice of spice level.', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=400', category: 'Chicken', available: true },
        { name: 'Half Peri Peri Chicken', description: 'Larger portion of our signature spiced chicken.', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=400', category: 'Chicken', available: true },
        { name: 'Peri Peri Wings (8)', description: 'Crispy wings tossed in peri peri sauce.', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', category: 'Chicken', available: true },
        { name: 'Spicy Rice', description: 'Rice cooked with peri peri spices.', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Sides', available: true },
        { name: 'Coleslaw', description: 'Creamy cabbage slaw.', price: 15.00, imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', category: 'Sides', available: true }
    ],
    'rest-011': [ // Beit El Foul
        { name: 'Foul Plate', description: 'Traditional fava beans with oil, cumin, and fresh bread.', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Foul Alexandria Style', description: 'Foul with tomatoes, onions, and hot peppers.', price: 30.00, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Taameya (6 pieces)', description: 'Crispy falafel made from fava beans.', price: 20.00, imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400', category: 'Breakfast', available: true },
        { name: 'Eggs with Pastrami', description: 'Scrambled eggs with Egyptian pastrami (basterma).', price: 40.00, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Fresh Baladi Bread', description: 'Warm traditional Egyptian bread.', price: 5.00, imageUrl: 'https://images.unsplash.com/photo-1584535548419-eb54458564ef?w=400', category: 'Sides', available: true }
    ],
    'rest-012': [ // Mandarine Koueider
        { name: 'Kunafa', description: 'Crispy shredded pastry with cream and sugar syrup.', price: 60.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true },
        { name: 'Basbousa', description: 'Semolina cake soaked in sweet syrup.', price: 40.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true },
        { name: 'Ice Cream (3 scoops)', description: 'Choose from our artisanal Egyptian flavors.', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Ice Cream', available: true },
        { name: 'Mango Ice Cream', description: 'Made with fresh Egyptian mangoes.', price: 35.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Ice Cream', available: true },
        { name: 'Mixed Oriental Sweets', description: 'Assortment of baklava, basbousa, and kunafa.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true }
    ],
    'rest-013': [ // Sultan Ayub
        { name: 'Lamb Ouzi', description: 'Whole roasted lamb on bed of spiced rice.', price: 350.00, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Main Course', available: true },
        { name: 'Royal Mixed Grill', description: 'Premium cuts of lamb, chicken, and beef kebabs.', price: 250.00, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Main Course', available: true },
        { name: 'Mansaf', description: 'Traditional lamb with fermented yogurt sauce and rice.', price: 180.00, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', category: 'Main Course', available: true },
        { name: 'Stuffed Lamb Ribs', description: 'Lamb ribs stuffed with rice and nuts.', price: 200.00, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', category: 'Main Course', available: true },
        { name: 'Arabic Coffee', description: 'Traditional cardamom-spiced coffee.', price: 25.00, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', category: 'Beverages', available: true }
    ],
    'rest-014': [ // Wok This Way
        { name: 'Pad Thai', description: 'Rice noodles with shrimp, peanuts, and tamarind sauce.', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400', category: 'Noodles', available: true },
        { name: 'Chicken Teriyaki', description: 'Grilled chicken with sweet teriyaki glaze and rice.', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', category: 'Main Course', available: true },
        { name: 'California Roll (8 pcs)', description: 'Crab, avocado, and cucumber roll.', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', category: 'Sushi', available: true },
        { name: 'Tom Yum Soup', description: 'Spicy and sour Thai soup with shrimp.', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400', category: 'Soups', available: true },
        { name: 'Spring Rolls (4)', description: 'Crispy vegetable spring rolls with sweet chili sauce.', price: 40.00, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', category: 'Appetizers', available: true }
    ],

    // GERMANY RESTAURANTS
    'rest-015': [ // Bayerischer Löwe
        { name: 'Schweinebraten', description: 'Roasted pork with crispy crackling, served with dumplings and sauerkraut.', price: 16.90, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Main Course', available: true },
        { name: 'Weisswurst (2 pcs)', description: 'Traditional Bavarian white sausage with sweet mustard and pretzel.', price: 9.90, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', category: 'Main Course', available: true },
        { name: 'Schnitzel Wiener Art', description: 'Breaded pork cutlet with potato salad.', price: 14.90, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', category: 'Main Course', available: true },
        { name: 'Obatzda', description: 'Bavarian cheese spread with pretzel.', price: 7.50, imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db23619621?w=400', category: 'Appetizers', available: true },
        { name: 'Apfelstrudel', description: 'Warm apple strudel with vanilla sauce.', price: 6.90, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true }
    ],
    'rest-016': [ // Zur Goldenen Sonne
        { name: 'Rinderfilet', description: 'Premium beef tenderloin with red wine sauce and vegetables.', price: 32.90, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', category: 'Main Course', available: true },
        { name: 'Zander Filet', description: 'Pan-fried pike-perch with butter sauce and potatoes.', price: 24.90, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', category: 'Seafood', available: true },
        { name: 'Tafelspitz', description: 'Traditional boiled beef with horseradish and apple sauce.', price: 19.90, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', category: 'Main Course', available: true },
        { name: 'Kartoffelsuppe', description: 'Creamy Bavarian potato soup.', price: 6.90, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', category: 'Soups', available: true },
        { name: 'Kaiserschmarrn', description: 'Shredded pancake with raisins and powdered sugar.', price: 9.90, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Desserts', available: true }
    ],
    'rest-017': [ // Pizzeria Venezia
        { name: 'Pizza Margherita', description: 'Classic tomato, mozzarella, and fresh basil.', price: 9.90, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', category: 'Pizza', available: true },
        { name: 'Pizza Diavola', description: 'Spicy salami with tomato and mozzarella.', price: 11.90, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Pizza', available: true },
        { name: 'Spaghetti Carbonara', description: 'Pasta with egg, pancetta, and parmesan.', price: 12.90, imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400', category: 'Pasta', available: true },
        { name: 'Insalata Mista', description: 'Mixed Italian salad with house dressing.', price: 7.90, imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', category: 'Salads', available: true },
        { name: 'Panna Cotta', description: 'Italian cream dessert with berry sauce.', price: 5.90, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Desserts', available: true }
    ],
    'rest-018': [ // Asia Garden
        { name: 'Pho Bo', description: 'Vietnamese beef noodle soup with herbs.', price: 12.90, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', category: 'Soups', available: true },
        { name: 'Pad Thai', description: 'Thai rice noodles with shrimp and peanuts.', price: 13.90, imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400', category: 'Noodles', available: true },
        { name: 'Kung Pao Chicken', description: 'Spicy chicken with peanuts and vegetables.', price: 14.90, imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400', category: 'Main Course', available: true },
        { name: 'Spring Rolls (4)', description: 'Crispy vegetable rolls with sweet chili sauce.', price: 5.90, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', category: 'Appetizers', available: true },
        { name: 'Fried Rice', description: 'Wok-fried rice with vegetables and egg.', price: 9.90, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', category: 'Sides', available: true }
    ],
    'rest-019': [ // Café Kowalski
        { name: 'Frühstück Classic', description: 'Bread rolls, butter, jam, cheese, and ham.', price: 8.90, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Rührei mit Speck', description: 'Scrambled eggs with bacon and toast.', price: 7.90, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', category: 'Breakfast', available: true },
        { name: 'Schwarzwälder Kirschtorte', description: 'Traditional Black Forest cherry cake.', price: 4.90, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Cakes', available: true },
        { name: 'Käsekuchen', description: 'German-style cheesecake.', price: 4.50, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'Cakes', available: true },
        { name: 'Cappuccino', description: 'Italian espresso with steamed milk foam.', price: 3.50, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', category: 'Beverages', available: true }
    ],
    'rest-020': [ // Döner König
        { name: 'Döner Kebab', description: 'Sliced meat in fresh bread with salad and sauce.', price: 6.50, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', category: 'Döner', available: true },
        { name: 'Döner Teller', description: 'Döner plate with rice, salad, and all sauces.', price: 11.90, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', category: 'Döner', available: true },
        { name: 'Dürüm', description: 'Döner wrapped in thin lavash bread.', price: 7.50, imageUrl: 'https://images.unsplash.com/photo-1565299585323-38174c3d0e3a?w=400', category: 'Döner', available: true },
        { name: 'Lahmacun', description: 'Turkish flatbread with minced meat and vegetables.', price: 5.50, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Turkish', available: true },
        { name: 'Ayran', description: 'Traditional Turkish yogurt drink.', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', category: 'Beverages', available: true }
    ]
};
