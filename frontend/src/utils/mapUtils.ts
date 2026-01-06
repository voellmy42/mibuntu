
/**
 * Utility functions for Google Maps integration
 */

export const getGoogleMapsLink = (school: string, location: string): string => {
    const query = encodeURIComponent(`${school}, ${location}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

export const getStaticMapUrl = (school: string, location: string): string => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const center = encodeURIComponent(`${school}, ${location}`);
    
    if (apiKey) {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=15&size=600x400&markers=color:red%7C${center}&key=${apiKey}`;
    }
    
    // Fallback or "Development" mode URL (might show watermarks without key, or fail depending on restriction)
    // If no key, we rely on a generic placeholder or the unsplash image used previously.
    // However, to demonstrate the "Map Preview" feature, we can try to return a specialized url if we had one.
    // For now, return empty string or specific placeholder logic to be handled by caller.
    return ''; 
};
