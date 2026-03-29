import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workouts')
@Controller('workouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workouts for current user' })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.workoutsService.findAll(userId, limit);
  }

  @Get('stats/weekly')
  @ApiOperation({ summary: 'Get weekly workout stats' })
  async getWeeklyStats(@CurrentUser('sub') userId: string) {
    return this.workoutsService.getWeeklyStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific workout' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.findOne(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workout' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.workoutsService.create(userId, createWorkoutDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(userId, id, updateWorkoutDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.remove(userId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark workout as completed' })
  async complete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() completeWorkoutDto: CompleteWorkoutDto,
  ) {
    return this.workoutsService.complete(userId, id, completeWorkoutDto.durationMinutes);
  }
}
