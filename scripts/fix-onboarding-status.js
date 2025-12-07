import { firebaseFirestore } from './config/firebase.config';

/**
 * One-time script to fix onboarding status for users who already have restaurants
 * Run this to update existing users who completed onboarding but the flag wasn't set
 */
async function fixOnboardingStatus() {
    try {
        // Get all restaurants
        const restaurantsSnapshot = await firebaseFirestore()
            .collection('restaurants')
            .where('status', '==', 'active')
            .get();

        console.log(`Found ${restaurantsSnapshot.size} active restaurants`);

        // Update onboarding status for each restaurant owner
        const updates = [];
        restaurantsSnapshot.forEach(doc => {
            const restaurant = doc.data();
            const ownerId = restaurant.ownerId;

            if (ownerId) {
                updates.push(
                    firebaseFirestore()
                        .collection('users')
                        .doc(ownerId)
                        .update({ onboardingCompleted: true })
                        .then(() => console.log(`✓ Updated onboarding status for user: ${ownerId}`))
                        .catch(err => console.error(`✗ Failed to update user ${ownerId}:`, err))
                );
            }
        });

        await Promise.all(updates);
        console.log('\n✅ All onboarding statuses updated successfully!');

    } catch (error) {
        console.error('Error fixing onboarding status:', error);
    }
}

// Run the script
fixOnboardingStatus()
    .then(() => {
        console.log('Script completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('Script failed:', err);
        process.exit(1);
    });
