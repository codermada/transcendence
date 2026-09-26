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


  @Get()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('better-auth-api-key')
  @ApiOperation({ summary: 'List all tests (requires API key)' })
  findAll() {
    return this.testService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a test by id (requires session)' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() _user: any,
  ) {
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