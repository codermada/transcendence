import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AuthGuard } from '../auth/AuthGuard';
import { ApiKeyGuard } from '../auth/ApiKeyGuard';
import { CurrentUser } from '../auth/CurrentUser';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }


  // curl -i -X GET "https://localhost:9000/nest/test/" \
  // -H "x-api-key: YOUR_API_KEY_HERE" \
  // -H "accept: application/json" \
  // --insecure
  @Get()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('better-auth-api-key') // Documents the api key requirement
  @ApiOperation({ summary: 'List all tests (requires API key)' })
  findAll() {
    return this.testService.findAll();
  }

  /**
   * GET /test/:id
   *
   * Returns a single test resource by its ID.
   *
   * Protected by `AuthGuard`, which:
   * 1. Checks for a valid Better Auth session on the request.
   * 2. Rejects with 401 if the user is not authenticated.
   * 3. Attaches the authenticated user to `request.user`.
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a test by id (requires session)' })
  findOne(
    /** URL parameter, e.g. `GET /test/123` → `id = "123"`. */
    @Param('id') id: string,

    /** Injected from `request.user` by `@CurrentUser()`. */
    @CurrentUser() user: any,
  ) {
    console.log('Authenticated user:', user);
    return this.testService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testService.update(+id, updateTestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testService.remove(+id);
  }
}