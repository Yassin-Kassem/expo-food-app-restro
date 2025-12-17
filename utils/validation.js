/**
 * Validation utilities for restaurant data
 * Client-side validation before sending to server
 */

/**
 * Validate restaurant business information
 */
export const validateRestaurantData = (data) => {
    const errors = {};
    
    if (data.name !== undefined) {
        if (!data.name || !data.name.trim()) {
            errors.name = 'Restaurant name is required';
        } else if (data.name.trim().length < 2) {
            errors.name = 'Restaurant name must be at least 2 characters';
        } else if (data.name.trim().length > 100) {
            errors.name = 'Restaurant name must be less than 100 characters';
        }
    }
    
    if (data.phone !== undefined && data.phone) {
        // Basic phone validation - allows various formats
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        if (!phoneRegex.test(data.phone)) {
            errors.phone = 'Invalid phone number format';
        }
    }
    
    if (data.description !== undefined && data.description) {
        if (data.description.trim().length > 500) {
            errors.description = 'Description must be less than 500 characters';
        }
    }
    
    if (data.categories !== undefined) {
        if (Array.isArray(data.categories) && data.categories.length === 0) {
            errors.categories = 'At least one cuisine type is required';
        } else if (typeof data.categories === 'string' && !data.categories.trim()) {
            errors.categories = 'Cuisine type is required';
        }
    }
    
    if (data.hours) {
        const hoursError = validateHours(data.hours);
        if (hoursError) {
            errors.hours = hoursError;
        }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate operating hours
 */
export const validateHours = (hours) => {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    for (const day of DAYS) {
        const dayHours = hours[day];
        if (!dayHours) continue;
        
        if (dayHours.isOpen) {
            if (!dayHours.open || !dayHours.close) {
                return `${day}: Open and close times are required when restaurant is open`;
            }
            
            if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
                return `${day}: Invalid time format. Use HH:MM format (e.g., 09:00)`;
            }
            
            const openTime = parseTime(dayHours.open);
            const closeTime = parseTime(dayHours.close);
            
            if (isNaN(openTime) || isNaN(closeTime)) {
                return `${day}: Invalid time values`;
            }
            
            if (openTime >= closeTime) {
                return `${day}: Close time must be after open time`;
            }
        }
    }
    
    return null;
};

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Validate menu item data
 */
export const validateMenuItemData = (data) => {
    const errors = {};
    
    if (!data.name || !data.name.trim()) {
        errors.name = 'Item name is required';
    } else if (data.name.trim().length < 2) {
        errors.name = 'Item name must be at least 2 characters';
    } else if (data.name.trim().length > 100) {
        errors.name = 'Item name must be less than 100 characters';
    }
    
    if (data.price === undefined || data.price === null) {
        errors.price = 'Price is required';
    } else {
        const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
        if (isNaN(price) || price < 0) {
            errors.price = 'Price must be a valid positive number';
        } else if (price > 10000) {
            errors.price = 'Price seems too high. Please verify.';
        }
    }
    
    if (data.category && !data.category.trim()) {
        errors.category = 'Category cannot be empty';
    }
    
    if (data.description && data.description.length > 500) {
        errors.description = 'Description must be less than 500 characters';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate order status transition
 */
export const validateOrderStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        'Pending': ['Cooking', 'Declined'],
        'Cooking': ['Ready', 'Cancelled'],
        'Ready': ['Completed', 'Cancelled'],
        'Declined': [],
        'Cancelled': [],
        'Completed': []
    };
    
    const allowedStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
        return `Cannot change status from ${currentStatus} to ${newStatus}`;
    }
    
    return null;
};

