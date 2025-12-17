/**
 * Firebase Seeding Script
 * 
 * Seeds Firebase Firestore with restaurants and menu items,
 * uploading images to Firebase Storage.
 * 
 * Usage:
 *   cd scripts/seed
 *   npm install
 *   node index.js
 *   node index.js --clear  (clears existing data first)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fetch from 'node-fetch';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { restaurants, menuItems } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SERVICE_ACCOUNT_PATH = join(__dirname, 'serviceAccountKey.json');
const CLEAR_EXISTING = process.argv.includes('--clear');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logProgress(current, total, message) {
    const percent = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    process.stdout.write(`\r${colors.cyan}[${bar}] ${percent}%${colors.reset} ${message}      `);
}

// Initialize Firebase Admin
function initFirebase() {
    if (!existsSync(SERVICE_ACCOUNT_PATH)) {
        log('\n❌ Error: serviceAccountKey.json not found!', 'red');
        log('\nTo get your service account key:', 'yellow');
        log('1. Go to Firebase Console > Project Settings > Service Accounts', 'dim');
        log('2. Click "Generate new private key"', 'dim');
        log('3. Save the file as "serviceAccountKey.json" in the scripts/seed folder\n', 'dim');
        process.exit(1);
    }

    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    
    // Try the newer .firebasestorage.app format first (default for new projects)
    // Falls back to .appspot.com if needed
    const bucketName = `${serviceAccount.project_id}.firebasestorage.app`;
    
    initializeApp({
        credential: cert(serviceAccount),
        storageBucket: bucketName
    });

    log(`\n🔥 Connected to Firebase project: ${serviceAccount.project_id}`, 'green');
    
    return {
        db: getFirestore(),
        bucket: getStorage().bucket()
    };
}

// Download image from URL and return buffer
async function downloadImage(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const buffer = await response.buffer();
        return buffer;
    } catch (error) {
        log(`\n⚠️  Failed to download image: ${url.substring(0, 50)}...`, 'yellow');
        return null;
    }
}

// Upload image buffer to Firebase Storage and return download URL
async function uploadImage(bucket, buffer, path) {
    try {
        const file = bucket.file(path);
        
        await file.save(buffer, {
            metadata: {
                contentType: 'image/jpeg',
                cacheControl: 'public, max-age=31536000'
            }
        });

        // Make the file publicly accessible
        await file.makePublic();
        
        // Return public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
        return publicUrl;
    } catch (error) {
        log(`\n⚠️  Failed to upload to ${path}: ${error.message}`, 'yellow');
        return null;
    }
}

// Clear existing seeded data
async function clearExistingData(db, bucket) {
    log('\n🗑️  Clearing existing seeded restaurants...', 'yellow');
    
    // Get all seeded restaurants (those with IDs starting with 'rest-')
    const snapshot = await db.collection('restaurants')
        .where('__seeded', '==', true)
        .get();
    
    if (snapshot.empty) {
        log('   No seeded data found.', 'dim');
        return;
    }

    const batch = db.batch();
    let deleteCount = 0;

    for (const doc of snapshot.docs) {
        // Delete menu items subcollection
        const menuSnapshot = await doc.ref.collection('menuItems').get();
        for (const menuDoc of menuSnapshot.docs) {
            batch.delete(menuDoc.ref);
            deleteCount++;
        }
        
        // Delete restaurant document
        batch.delete(doc.ref);
        deleteCount++;
    }

    await batch.commit();
    log(`   Deleted ${deleteCount} documents.`, 'green');

    // Clean up storage (optional - could be slow)
    log('   Cleaning up storage...', 'dim');
    try {
        const [files] = await bucket.getFiles({ prefix: 'restaurants/rest-' });
        for (const file of files) {
            await file.delete();
        }
        log(`   Deleted ${files.length} files from storage.`, 'green');
    } catch (error) {
        log(`   Could not clean storage: ${error.message}`, 'yellow');
    }
}

// Seed a single restaurant with its menu items
async function seedRestaurant(db, bucket, restaurant, menuItemsList, index, total) {
    const restaurantId = restaurant.id;
    
    logProgress(index, total, `Seeding ${restaurant.name}...`);

    // Download and upload restaurant banner image
    let imageUrl = restaurant.imageUrl;
    const bannerBuffer = await downloadImage(restaurant.imageUrl);
    if (bannerBuffer) {
        const uploadedUrl = await uploadImage(
            bucket, 
            bannerBuffer, 
            `restaurants/${restaurantId}/banner.jpg`
        );
        if (uploadedUrl) {
            imageUrl = uploadedUrl;
        }
    }

    // Prepare restaurant document
    const restaurantData = {
        name: restaurant.name,
        description: restaurant.description,
        image: imageUrl,
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        categories: restaurant.categories,
        address: restaurant.address,
        location: restaurant.location,
        phone: restaurant.phone,
        priceRange: restaurant.priceRange,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
        deliveryFee: restaurant.deliveryFee,
        hours: restaurant.hours,
        status: 'active',
        ownerId: null, // No owner - these are test restaurants
        __seeded: true, // Mark as seeded for easy cleanup
        createdAt: FieldValue.serverTimestamp(),
        publishedAt: FieldValue.serverTimestamp()
    };

    // Create restaurant document
    const restaurantRef = db.collection('restaurants').doc(restaurantId);
    await restaurantRef.set(restaurantData);

    // Seed menu items
    if (menuItemsList && menuItemsList.length > 0) {
        const menuBatch = db.batch();
        
        for (let i = 0; i < menuItemsList.length; i++) {
            const item = menuItemsList[i];
            const itemId = `${restaurantId}-item-${i + 1}`;
            
            // Download and upload menu item image
            let itemImageUrl = item.imageUrl;
            const itemBuffer = await downloadImage(item.imageUrl);
            if (itemBuffer) {
                const uploadedUrl = await uploadImage(
                    bucket, 
                    itemBuffer, 
                    `restaurants/${restaurantId}/menu/${itemId}.jpg`
                );
                if (uploadedUrl) {
                    itemImageUrl = uploadedUrl;
                }
            }

            const itemRef = restaurantRef.collection('menuItems').doc(itemId);
            menuBatch.set(itemRef, {
                name: item.name,
                description: item.description,
                price: item.price,
                imageUrl: itemImageUrl,
                category: item.category,
                available: item.available,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
        }

        await menuBatch.commit();
    }

    return {
        restaurantId,
        name: restaurant.name,
        menuItemsCount: menuItemsList?.length || 0
    };
}

// Main seeding function
async function seed() {
    console.log('\n' + '═'.repeat(50));
    log('🍔 Food Ordering App - Firebase Seeder', 'cyan');
    console.log('═'.repeat(50));

    const { db, bucket } = initFirebase();

    // Clear existing data if flag is set
    if (CLEAR_EXISTING) {
        await clearExistingData(db, bucket);
    }

    log('\n📦 Starting seed process...', 'cyan');
    log(`   Restaurants: ${restaurants.length}`, 'dim');
    log(`   Total menu items: ${Object.values(menuItems).flat().length}`, 'dim');

    const startTime = Date.now();
    const results = [];

    // Seed restaurants sequentially (to avoid rate limiting)
    for (let i = 0; i < restaurants.length; i++) {
        const restaurant = restaurants[i];
        const items = menuItems[restaurant.id] || [];
        
        try {
            const result = await seedRestaurant(db, bucket, restaurant, items, i + 1, restaurants.length);
            results.push(result);
        } catch (error) {
            log(`\n❌ Failed to seed ${restaurant.name}: ${error.message}`, 'red');
        }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Summary
    console.log('\n\n' + '═'.repeat(50));
    log('✅ Seeding Complete!', 'green');
    console.log('═'.repeat(50));
    log(`\n📊 Summary:`, 'cyan');
    log(`   • Restaurants created: ${results.length}`, 'dim');
    log(`   • Menu items created: ${results.reduce((sum, r) => sum + r.menuItemsCount, 0)}`, 'dim');
    log(`   • Time elapsed: ${duration}s`, 'dim');

    log('\n📝 Seeded Restaurants:', 'cyan');
    results.forEach(r => {
        log(`   • ${r.name} (${r.menuItemsCount} items)`, 'dim');
    });

    log('\n💡 Tip: Run with --clear flag to remove seeded data', 'yellow');
    log('   node index.js --clear\n', 'dim');
}

// Run the seeder
seed()
    .then(() => process.exit(0))
    .catch(error => {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });

