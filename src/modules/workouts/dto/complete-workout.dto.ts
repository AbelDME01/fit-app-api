import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteWorkoutDto {
  @ApiProperty({ example: 45, description: 'Duration of the workout in minutes (0-1440)' })
  @IsNumber()
  @Min(0)
  @Max(1440)
  durationMinutes: number;
}
