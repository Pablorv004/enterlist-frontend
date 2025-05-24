export const logoIcons = {
    spotify: 'logo-spotify',
    youtube: 'logo-youtube',
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    instagram: 'logo-instagram',
    apple: 'logo-apple',
    google: 'logo-google',
    github: 'logo-github',
    linkedin: 'logo-linkedin'
};

/**
 * Action icons as string literals
 * Use these for common UI interactions
 */
export const actionIcons = {
    eye: 'eye',
    eyeOff: 'eye-off',
    add: 'add',
    remove: 'remove',
    close: 'close',
    menu: 'menu',
    search: 'search',
    settings: 'settings',
    home: 'home',
    person: 'person',
    alert: 'alert-circle',
    success: 'checkmark-circle',
    warning: 'warning',
    error: 'alert-circle',
    information: 'information-circle',
    arrowBack: 'arrow-back',
    arrowForward: 'arrow-forward',
    camera: 'camera',
    musicalNotes: 'musical-notes'
};

/**
 * Helper function to easily get an icon
 * @param iconName The name of the icon to get
 * @returns The icon name as a string
 */
export function getIcon(iconName: string): string {
    // Remove 'logo' prefix if present for consistency
    const normalizedName = iconName.replace(/^logo/, '').toLowerCase();

    // Check logo icons first
    for (const [key, value] of Object.entries(logoIcons)) {
        if (key.toLowerCase() === normalizedName) {
            return value;
        }
    }

    // Then check action icons
    for (const [key, value] of Object.entries(actionIcons)) {
        if (key.toLowerCase() === normalizedName) {
            return value;
        }
    }

    // Return the original name if not found
    return iconName;
}