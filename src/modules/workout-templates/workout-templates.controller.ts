import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { WorkoutTemplatesService } from './workout-templates.service';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { CreateFromWorkoutDto } from './dto/create-from-workout.dto';
import { UseTemplateDto } from './dto/use-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workout Templates')
@Controller('workout-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutTemplatesController {
  constructor(private readonly workoutTemplatesService: WorkoutTemplatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all workout templates for current user',
    description: 'Retrieves all workout templates created by the authenticated user, including their exercises'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of templates to return' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.workoutTemplatesService.findAll(userId, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific workout template',
    description: 'Retrieves a single workout template by ID with all its exercises'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutTemplatesService.findOne(userId, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new workout template',
    description: 'Creates a new workout template with exercises from scratch'
  })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createWorkoutTemplateDto: CreateWorkoutTemplateDto,
  ) {
    return this.workoutTemplatesService.create(userId, createWorkoutTemplateDto);
  }

  @Post('from-workout/:workoutId')
  @ApiOperation({
    summary: 'Create template from existing workout',
    description: 'Creates a new template by copying an existing workout and all its exercises'
  })
  @ApiParam({ name: 'workoutId', description: 'Source workout ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Template name (optional, defaults to "{Workout Name} Template")' },
        description: { type: 'string', description: 'Template description (optional)' },
      },
    },
  })
  async createFromWorkout(
    @CurrentUser('sub') userId: string,
    @Param('workoutId') workoutId: string,
    @Body() createFromWorkoutDto: CreateFromWorkoutDto,
  ) {
    return this.workoutTemplatesService.createFromWorkout(userId, workoutId, createFromWorkoutDto.name, createFromWorkoutDto.description);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a workout template',
    description: 'Updates an existing workout template. Can update name, description, exercises, etc.'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() updateWorkoutTemplateDto: UpdateWorkoutTemplateDto,
  ) {
    return this.workoutTemplatesService.update(userId, id, updateWorkoutTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a workout template',
    description: 'Permanently deletes a workout template and all its associated exercises'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutTemplatesService.remove(userId, id);
  }

  @Post(':id/use')
  @ApiOperation({
    summary: 'Create workout from template',
    description: 'Creates a new workout by copying a template. All exercises from the template are copied to the new workout.'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scheduledDate: {
          type: 'string',
          format: 'date-time',
          description: 'When to schedule the workout (optional, defaults to now)'
        },
      },
    },
  })
  async useTemplate(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() useTemplateDto: UseTemplateDto,
  ) {
    return this.workoutTemplatesService.useTemplate(userId, id, useTemplateDto.scheduledDate);
  }
}
