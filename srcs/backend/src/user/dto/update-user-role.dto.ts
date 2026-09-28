import { IsIn, IsNotEmpty } from 'class-validator';

// Allowed user roles
export const ALLOWED_ROLES = ['USER', 'ADMIN'] as const;
export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsIn(ALLOWED_ROLES)
  role!: AllowedRole;
}