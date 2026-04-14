// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY 3-B  ·  Create UpdateUserDto
// ─────────────────────────────────────────────────────────────────────────────
// Same as CreateUserDto but every field is optional (PATCH semantics).
// ─────────────────────────────────────────────────────────────────────────────

import {
	IsString,
	MinLength,
	MaxLength,
	IsEmail,
	IsInt,
	Min,
	Max,
	IsOptional,
	IsIn,
} from 'class-validator';

const UserRole = ['student', 'teacher', 'admin'] as const;
type UserRole = (typeof UserRole)[number];

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	@MinLength(2)
	@MaxLength(50)
	name?: string;

	@IsString()
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsInt()
	@IsOptional()
	@Min(1)
	@Max(120)
	age?: number;

	@IsString()
	@IsOptional()
	@IsIn(UserRole)
	role?: UserRole;
}
