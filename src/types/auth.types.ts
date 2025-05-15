// src/types/auth.types.ts
import { User } from './index';

// Login request types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

// Registration types
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: string;
}
