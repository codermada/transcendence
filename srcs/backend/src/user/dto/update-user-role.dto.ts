import { IsIn, IsNotEmpty } from 'class-validator';

// Keep in sync with the `role` values your app actually uses.
// Your schema stores `role` as a nullable String, so we validate
// against an explicit allow-list rather than trusting the client.
export const ALLOWED_ROLES = ['USER', 'ADMIN'] as const;
export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsIn(ALLOWED_ROLES)
  role!: AllowedRole;
}