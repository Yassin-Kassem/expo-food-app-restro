# Restro - Food Ordering App

A full-featured food ordering application built with React Native and Expo, supporting both customer and restaurant owner experiences. The app features real-time order tracking, push notifications, location-based restaurant discovery, and a complete restaurant management system.

## 📱 Overview

Restro is a dual-role food ordering platform that enables:
- **Customers** to browse restaurants, place orders, track deliveries in real-time, and manage their cart
- **Restaurant Owners** to manage their menu, receive orders, update order status, and track business metrics

The app is built with modern React Native practices, using Expo Router for navigation, Firebase for backend services, and includes comprehensive error handling, offline support, and a beautiful UI with light/dark mode support.

## ✨ Features

### Customer Features
- 🏠 **Home Screen**: Browse restaurants by category, search functionality, location-based recommendations
- 🍕 **Restaurant Details**: View menu items, restaurant information, ratings, and hours
- 🛒 **Shopping Cart**: Add items with customizations, manage quantities, persistent cart storage
- 📍 **Location Services**: Get current location, set delivery address, view restaurants on map
- 📦 **Order Management**: Place orders, track active orders in real-time, view order history
- 🔔 **Push Notifications**: Receive real-time updates on order status changes
- 🎨 **Theme Support**: Light and dark mode with smooth transitions
- 🔍 **Search & Filter**: Search restaurants by name, filter by category and cuisine type

### Restaurant Owner Features
- 📊 **Dashboard**: View order statistics, recent orders, toggle restaurant open/closed status
- 📝 **Menu Management**: Add, edit, and delete menu items with images and descriptions
- 📋 **Order Management**: View all orders, update order status (Pending → Preparing → Ready → Out for Delivery → Delivered)
- ⚙️ **Settings**: Manage business information, operating hours, location, and restaurant details
- 🎯 **Onboarding Flow**: Step-by-step setup for new restaurant owners
- 📸 **Image Upload**: Upload restaurant banners and menu item images to Firebase Storage
- 🔔 **Push Notifications**: Receive notifications when new orders are placed

### Technical Features
- 🔄 **Real-time Updates**: Firestore listeners for live order and menu updates
- 💾 **Offline Support**: Cached data and graceful error handling
- 🎯 **Error Handling**: Comprehensive error logging and user-friendly error messages
- 🔐 **Authentication**: Secure email/password authentication with Firebase Auth
- 📱 **Responsive Design**: Adaptive layouts using `react-native-responsive-screen`
- 🧭 **Navigation**: File-based routing with Expo Router
- 🎨 **Design System**: Consistent theming with light/dark mode support

## 🛠️ Tech Stack

### Core
- **React Native** 0.81.5
- **Expo** ~54.0.29
- **Expo Router** ~6.0.19 (File-based routing)
- **React** 19.1.0

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - Image storage
- **Expo Notifications** - Push notifications

### UI & Styling
- **react-native-responsive-screen** - Responsive layouts
- **react-native-maps** - Map integration
- **expo-linear-gradient** - Gradient components
- **@expo/vector-icons** - Icon library

### State Management
- **React Context API** - Global state management
  - `CartContext` - Shopping cart state
  - `ThemeContext` - Theme preferences
  - `LocationContext` - Location services
  - `NotificationContext` - Push notification management

### Utilities
- **AsyncStorage** - Local data persistence
- **expo-location** - Location services
- **expo-image-picker** - Image selection
- **expo-device** - Device information

## 📁 Project Structure

```
food-ordering-app-expo/
├── app/                          # Expo Router pages
│   ├── _layout.jsx               # Root layout with auth guards
│   ├── (auth)/                   # Authentication screens
│   │   ├── welcome.jsx
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   └── role-select.jsx
│   ├── (user)/                   # Customer screens
│   │   ├── (tabs)/               # Tab navigation
│   │   │   ├── home.jsx
│   │   │   ├── browse.jsx
│   │   │   ├── orders.jsx
│   │   │   └── profile.jsx
│   │   ├── cart.jsx
│   │   ├── checkout.jsx
│   │   ├── order-tracking.jsx
│   │   └── restaurant/[id].jsx
│   ├── (restaurant)/             # Restaurant owner screens
│   │   ├── (tabs)/                # Tab navigation
│   │   │   ├── dashboard.jsx
│   │   │   ├── menu.jsx
│   │   │   ├── orders.jsx
│   │   │   └── settings.jsx
│   │   ├── menu/                  # Menu management
│   │   │   ├── add-item.jsx
│   │   │   └── edit-item/[itemId].jsx
│   │   ├── order/[orderId].jsx   # Order details
│   │   └── onboarding/            # Restaurant setup flow
│   │       ├── business-info.jsx
│   │       ├── location-setup.jsx
│   │       ├── hours.jsx
│   │       ├── add-first-item.jsx
│   │       └── review.jsx
│   └── (settings)/               # Shared settings
│       ├── profile.jsx
│       ├── privacy.jsx
│       └── index.jsx
├── components/                   # Reusable components
│   ├── user/                     # Customer components
│   │   ├── RestaurantCard.jsx
│   │   ├── MenuItemModal.jsx
│   │   ├── ActiveOrderCard.jsx
│   │   ├── CategoryGrid.jsx
│   │   └── ...
│   ├── restaurant/               # Restaurant components
│   │   ├── OrderCard.jsx
│   │   ├── StatCard.jsx
│   │   └── Badge.jsx
│   └── ...                       # Shared components
├── contexts/                     # React Context providers
│   ├── CartContext.jsx
│   ├── ThemeContext.jsx
│   ├── LocationContext.jsx
│   └── notificationsContext.jsx
├── services/                     # Business logic & API calls
│   ├── authService.js
│   ├── orderService.js
│   ├── restaurantService.js
│   ├── menuService.js
│   ├── notificationService.js
│   └── ...
├── hooks/                        # Custom React hooks
│   ├── useAuth.js
│   └── useRestaurant.js
├── utils/                        # Utility functions
│   ├── errorLogger.js
│   ├── networkHandler.js
│   ├── validation.js
│   └── ...
├── config/                       # Configuration files
│   └── firebase.config.js
├── constants/                    # App constants
│   └── theme.js
├── scripts/                      # Utility scripts
│   └── seed/                     # Firebase seeder
│       ├── index.js
│       ├── seedData.js
│       └── README.md
├── assets/                       # Images and static assets
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **Firebase Account** with a project set up
- **iOS Simulator** (for Mac) or **Android Emulator** / physical device
- **EAS CLI** (optional, for building: `npm install -g eas-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-ordering-app-expo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   
   Create a Firebase project at [Firebase Console](https://console.firebase.google.com/):
   
   - Enable **Authentication** → Email/Password provider
   - Create **Firestore Database** (start in test mode, then configure security rules)
   - Enable **Storage** and configure rules
   - Add your app to the project:
     - **iOS**: Download `GoogleService-Info.plist` and place in project root
     - **Android**: Download `google-services.json` and place in project root
   
   ⚠️ **Note**: These files are gitignored for security. You'll need to add them manually.

4. **Configure Firebase**
   
   The app uses `@react-native-firebase` which requires native configuration. After adding the config files:
   
   ```bash
   # For iOS (Mac only)
   cd ios && pod install && cd ..
   
   # Rebuild the app
   npx expo prebuild
   ```

5. **Configure Firestore Security Rules**
   
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Restaurants collection
       match /restaurants/{restaurantId} {
         allow read: if true; // Public read for browsing
         allow write: if request.auth != null && 
                        (request.auth.uid == resource.data.ownerId || 
                         !exists(/databases/$(database)/documents/restaurants/$(restaurantId)));
         
         // Menu items subcollection
         match /menuItems/{itemId} {
           allow read: if true;
           allow write: if request.auth != null && 
                          request.auth.uid == get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId;
         }
       }
       
       // Orders collection
       match /orders/{orderId} {
         allow read: if request.auth != null && 
                       (request.auth.uid == resource.data.customerId || 
                        request.auth.uid == resource.data.restaurantId);
         allow create: if request.auth != null && request.auth.uid == request.resource.data.customerId;
         allow update: if request.auth != null && 
                         request.auth.uid == resource.data.restaurantId;
       }
     }
   }
   ```

6. **Configure Firebase Storage Rules**
   
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /restaurants/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

7. **Set up Push Notifications** (Optional but recommended)
   
   - For **iOS**: Configure APNs in Firebase Console → Project Settings → Cloud Messaging
   - For **Android**: FCM is automatically configured with `google-services.json`
   - The app uses Expo Push Notification service for cross-platform notifications

### Running the App

#### Development Mode

```bash
# Start the development server
npm start
# or
expo start --dev-client

# Run on iOS
npm run ios
# or
expo start --dev-client --ios

# Run on Android
npm run android
# or
expo start --dev-client --android

# Run on web (limited functionality)
npm run web
```

#### Using Development Build

This app uses Expo Dev Client. You'll need to build a development client first:

```bash
# Build development client
eas build --profile development --platform ios
eas build --profile development --platform android

# Or use local builds
npx expo run:ios
npx expo run:android
```

### Seeding Test Data

To populate your Firebase with sample restaurants and menu items:

1. **Get Firebase Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `scripts/seed/serviceAccountKey.json`

2. **Run the seeder**:
   ```bash
   cd scripts/seed
   npm install
   node index.js
   ```

   This will create:
   - 20 sample restaurants with various cuisines
   - ~100 menu items across restaurants
   - Download and upload images from Unsplash

   See `scripts/seed/README.md` for more details.

## 🏗️ Building for Production

### Using EAS Build

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure build**:
   ```bash
   eas build:configure
   ```

4. **Build for production**:
   ```bash
   # iOS
   eas build --platform ios --profile production
   
   # Android
   eas build --platform android --profile production
   ```

5. **Submit to app stores**:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Local Builds

```bash
# iOS (requires Mac)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## 📱 App Configuration

### App Identity

Update `app.json` to customize:
- App name (`name`)
- Bundle identifier (`ios.bundleIdentifier`, `android.package`)
- App icon and splash screen
- Permissions

### Environment Variables

For sensitive configuration, create `.env` files (not committed):
- `.env.local` - Local development
- `.env.production` - Production builds

## 🔑 Key Features Explained

### Authentication Flow

1. **Welcome Screen** → User selects role (Customer/Restaurant)
2. **Registration/Login** → Firebase Authentication
3. **Role Selection** → Stored in Firestore `users` collection
4. **Onboarding** (Restaurant only) → Multi-step setup process
5. **Main App** → Role-based navigation

### Order Status Flow

Orders progress through these statuses:
- `Pending` → Order received
- `Preparing` → Kitchen is working on it
- `Ready` → Food is ready for pickup
- `Out for Delivery` → On the way to customer
- `Delivered` → Order completed
- `Cancelled` → Order cancelled

Status transitions are validated to prevent invalid changes.

### Real-time Updates

The app uses Firestore listeners for:
- **Orders**: Real-time order status updates
- **Menu Items**: Live menu changes
- **Restaurant Status**: Open/closed status
- **User Data**: Profile updates

### Push Notifications

- **Customers**: Receive notifications on order status changes
- **Restaurants**: Receive notifications when new orders are placed
- Notifications are debounced to prevent duplicates
- Push tokens are stored in Firestore and cleaned up on logout

### Cart Management

- Persistent cart using AsyncStorage
- Restaurant-specific cart (prevents mixing items from different restaurants)
- Automatic tax calculation (8.25% default)
- Delivery fee from restaurant settings

### Location Services

- Get current location using Expo Location
- Set custom delivery address
- Filter restaurants by proximity
- Map view of restaurants (using react-native-maps)

## 🎨 Design System

The app uses a comprehensive design system defined in `constants/theme.js`:

- **Colors**: Light and dark mode palettes
- **Typography**: Responsive font sizes using `react-native-responsive-screen`
- **Spacing**: Consistent spacing scale
- **Shadows**: Platform-specific shadow styles
- **Border Radius**: Standardized corner radius values

All styling uses inline styles with responsive utilities for cross-device compatibility.

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Restaurant onboarding flow
- [ ] Browse and search restaurants
- [ ] Add items to cart
- [ ] Place order
- [ ] Track order status
- [ ] Restaurant receives order notification
- [ ] Update order status (restaurant)
- [ ] Customer receives status update notification
- [ ] Menu management (add/edit/delete items)
- [ ] Theme switching (light/dark mode)
- [ ] Location services
- [ ] Offline behavior

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Ensure `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) are in project root
   - Run `npx expo prebuild` after adding config files

2. **Push notifications not working**
   - Verify Expo Push Token is registered
   - Check notification permissions are granted
   - Ensure Firebase Cloud Messaging is configured

3. **Build errors**
   - Clear cache: `expo start --clear`
   - Delete `node_modules` and reinstall
   - For iOS: `cd ios && pod install && cd ..`

4. **Firestore permission errors**
   - Check security rules match your use case
   - Verify user authentication state
   - Check Firestore indexes are created (check error messages)

5. **Location not working**
   - Grant location permissions in device settings
   - For iOS: Check `Info.plist` location usage descriptions
   - For Android: Verify permissions in `AndroidManifest.xml`

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use functional components with hooks
- Follow React Native best practices
- Use inline styles with responsive utilities
- Add error handling to all async operations
- Include JSDoc comments for service functions

## 📄 License

This project is private and proprietary.

## 👤 Author

**Yassin Kassem**

---

## 🔐 Security Notes

- Never commit Firebase service account keys or config files
- Keep Firestore security rules up to date
- Regularly update dependencies for security patches
- Use environment variables for sensitive configuration
- Review Firebase Storage rules for proper access control

## 📊 Database Schema

### Collections

**users/**
- `uid` (document ID)
- `email`, `displayName`, `role` ('user' | 'restaurant')
- `onboardingCompleted` (boolean)
- `pushToken`, `pushTokenUpdatedAt`
- `createdAt`, `updatedAt`

**restaurants/**
- `id` (document ID)
- `name`, `description`, `image`, `banner`
- `address`, `location` (GeoPoint), `phone`
- `ownerId` (references users)
- `categories`, `rating`, `priceRange`
- `hours` (object with day keys)
- `isOpen`, `restaurantStatus`
- `estimatedDeliveryTime`, `deliveryFee`
- `onboardingCompleted`

**restaurants/{id}/menuItems/**
- `id` (document ID)
- `name`, `description`, `price`
- `imageUrl`, `category`
- `available` (boolean)
- `createdAt`, `updatedAt`

**orders/**
- `id` (document ID)
- `orderDisplayId` (human-readable ID)
- `customerId`, `customerName`, `customerPhone`
- `restaurantId`, `restaurantName`, `restaurantImage`
- `items` (array)
- `subtotal`, `tax`, `deliveryFee`, `total`
- `deliveryAddress`, `phoneNumber`, `specialInstructions`
- `status`, `estimatedDeliveryTime`
- `createdAt`, `statusUpdatedAt`, `completedAt`

---


