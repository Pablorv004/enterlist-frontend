// src/types/user.types.ts
import { UserRole } from './index';

// Type for creating a new user
export interface UserCreate {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    is_active?: boolean;
}

// Type for updating an existing user
export interface UserUpdate {
    username?: string;
    email?: string;
    role?: UserRole;
    is_active?: boolean;
}
