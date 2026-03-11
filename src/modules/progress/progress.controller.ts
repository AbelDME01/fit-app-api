import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get progress summary' })
  async getSummary(@CurrentUser('sub') userId: string) {
    return this.progressService.getSummary(userId);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly progress data' })
  async getWeekly(@CurrentUser('sub') userId: string) {
    return this.progressService.getWeeklyProgress(userId);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly progress data' })
  async getMonthly(@CurrentUser('sub') userId: string) {
    return this.progressService.getMonthlyProgress(userId);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly progress data' })
  async getYearly(@CurrentUser('sub') userId: string) {
    return this.progressService.getYearlyProgress(userId);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get all goals' })
  async getGoals(@CurrentUser('sub') userId: string) {
    return this.progressService.getGoals(userId);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a new goal' })
  async createGoal(
    @CurrentUser('sub') userId: string,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    return this.progressService.createGoal(userId, createGoalDto);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update a goal' })
  async updateGoal(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.progressService.updateGoal(userId, id, updateGoalDto);
  }
}
