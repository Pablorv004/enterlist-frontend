// src/plugins/fontawesome.ts
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faHome,
    faMusic,
    faList,
    faPaperPlane,
    faCog,
    faUser,
    faPlus,
    faEdit,
    faTrash,
    faCheck,
    faTimes,
    faSearch,
    faSignOutAlt,
    faEye,
    faEyeSlash,
    faCircle,
    faCaretUp,
    faCaretDown,
    faFilter,
    faHeadphones,
    faPalette,
    faSync,
    faPlay,
    faPause,
    faStar
} from '@fortawesome/free-solid-svg-icons';

import {
    faGoogle,
    faSpotify,
    faSoundcloud,
    faApple,
    faYoutube,
    faTwitter,
    faInstagram,
    faFacebook
} from '@fortawesome/free-brands-svg-icons';

// Add all icons to the library
library.add(
    // Solid icons
    faHome,
    faMusic,
    faList,
    faPaperPlane,
    faCog,
    faUser,
    faPlus,
    faEdit,
    faTrash,
    faCheck,
    faTimes,
    faSearch,
    faSignOutAlt,
    faEye,
    faEyeSlash,
    faCircle,
    faCaretUp,
    faCaretDown,
    faFilter,
    faHeadphones,
    faPalette,
    faSync,
    faPlay,
    faPause,
    faStar,

    // Brand icons
    faGoogle,
    faSpotify,
    faSoundcloud,
    faApple,
    faYoutube,
    faTwitter,
    faInstagram,
    faFacebook
);

export { FontAwesomeIcon };