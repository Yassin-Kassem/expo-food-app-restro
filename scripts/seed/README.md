# Firebase Seeder

Seeds your Firebase project with test restaurant data and images.

## Setup

1. **Get your Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Project Settings** (gear icon) → **Service Accounts**
   - Click **"Generate new private key"**
   - Save the downloaded file as `serviceAccountKey.json` in this folder

2. **Install dependencies:**
   ```bash
   cd scripts/seed
   npm install
   ```

## Usage

**Seed the database:**
```bash
node index.js
```

**Clear existing seeded data and re-seed:**
```bash
node index.js --clear
```

## What Gets Seeded

- **20 restaurants** with varied cuisines (Italian, Mexican, Japanese, American, etc.)
- **~100 menu items** across all restaurants (4-5 items each)
- **All images** are downloaded from Unsplash and uploaded to Firebase Storage

## Data Structure

### Restaurants (`restaurants/`)
- name, description, image, rating, categories
- address, location (lat/lng), phone
- priceRange, estimatedDeliveryTime, deliveryFee
- hours (per day), status

### Menu Items (`restaurants/{id}/menuItems/`)
- name, description, price, imageUrl
- category, available

## Notes

- Seeded restaurants have `ownerId: null` - they're for customer browsing, not restaurant owner management
- All seeded docs are marked with `__seeded: true` for easy cleanup
- Images are stored at `restaurants/{restaurantId}/banner.jpg` and `restaurants/{restaurantId}/menu/{itemId}.jpg`
- The script runs sequentially to avoid Firebase rate limiting
- Typical runtime: 2-4 minutes (mostly image upload time)

## Storage Rules

Make sure your Firebase Storage rules allow public read access:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /restaurants/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

