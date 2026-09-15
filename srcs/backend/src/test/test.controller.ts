import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AuthGuard } from '../auth/AuthGuard';
import { CurrentUser } from '../auth/CurrentUser';


@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @Get()
  findAll() {
    return this.testService.findAll();
  }

  /**
   * Protects this endpoint with the AuthGuard.
   *
   * The AuthGuard:
   * 1. Checks the incoming request for a valid Better Auth session.
   * 2. Rejects the request with 401 Unauthorized if the user is not authenticated.
   * 3. Attaches the authenticated user to `request.user`.
   *
   * @UseGuards() can be applied to a single route, a controller,
   * or globally depending on the desired authentication scope.
   */
  @UseGuards(AuthGuard)

  /**
   * GET /test/:id
   *
   * Returns a single test resource by its ID.
   *
   * Because `AuthGuard` is applied above, this endpoint can only
   * be accessed by an authenticated user.
   */
  @Get(':id')
  findOne(
    /**
     * Extracts the `id` parameter from the URL.
     *
     * Example:
     * GET /test/123
     *
     * `id` will be "123" as a string.
     */
    @Param('id') id: string,

    /**
     * Gets the authenticated user from `request.user`.
     *
     * The `AuthGuard` is responsible for setting `request.user`
     * after successfully validating the Better Auth session.
     */
    @CurrentUser() user: any,
  ) {
    // The authenticated user can now be used inside the controller.
    console.log('Authenticated user:', user);

    // Convert the URL parameter from string to number
    // and pass it to the service.
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
