import { IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecordDto {
  @ApiProperty()
  @IsNumber()
  exercise_id: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  value: number;

  @ApiProperty({ enum: ['kg', 'reps', 'seconds'] })
  @IsEnum(['kg', 'reps', 'seconds'])
  unit: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsString()
  achieved_at: string;
}
