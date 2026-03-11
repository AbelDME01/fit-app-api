import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Exercises')
@Controller('exercises')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exercises' })
  async findAll() {
    return this.exercisesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search exercises' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.exercisesService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific exercise' })
  async findOne(@Param('id') id: number) {
    return this.exercisesService.findOne(id);
  }
}
