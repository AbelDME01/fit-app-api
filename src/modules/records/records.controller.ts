import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Records')
@Controller('records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all personal records' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'strength', 'cardio'] })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('type') type?: string,
  ) {
    return this.recordsService.findAll(userId, type);
  }

  @Get('history/:exerciseId')
  @ApiOperation({ summary: 'Get record history for an exercise' })
  async getHistory(
    @CurrentUser('sub') userId: string,
    @Param('exerciseId') exerciseId: number,
  ) {
    return this.recordsService.getHistory(userId, exerciseId);
  }

  @Get(':exerciseId')
  @ApiOperation({ summary: 'Get records for a specific exercise' })
  async findByExercise(
    @CurrentUser('sub') userId: string,
    @Param('exerciseId') exerciseId: number,
  ) {
    return this.recordsService.findByExercise(userId, exerciseId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new personal record' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createRecordDto: CreateRecordDto,
  ) {
    return this.recordsService.create(userId, createRecordDto);
  }
}
