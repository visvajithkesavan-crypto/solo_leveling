import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Auth Guard that validates Supabase JWT tokens
 * 
 * HOW IT WORKS:
 * 1. Extracts Bearer token from Authorization header
 * 2. Validates token using Supabase client's getUser() method
 * 3. Supabase automatically verifies JWT signature and expiration
 * 4. If valid, attaches user object to request
 * 5. RLS policies use auth.uid() which matches the user.id from the validated JWT
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Validate JWT and get user data
      // This validates:
      // - JWT signature (using Supabase secret)
      // - Token expiration
      // - Token structure
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Attach user to request for use in controllers
      // The user.id here is what RLS policies reference as auth.uid()
      request.user = user;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
