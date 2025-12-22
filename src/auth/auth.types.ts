/*
Allows for user roles in the system
*/

export type UserRole = "admin" | "employee" | "customer";

export type AuthUser = {
    id: string;
    role: UserRole;
    email?: string;
};