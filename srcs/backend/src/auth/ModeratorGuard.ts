import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { AuthGuard } from "./AuthGuard";

@Injectable()
export class ModeratorGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const role = request.user?.role;

    if (role !== "moderator" && role !== "admin") {
      throw new ForbiddenException("Moderator access required");
    }
    return true;
  }
}