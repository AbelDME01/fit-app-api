import { IsString, IsNumber, IsOptional, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({ example: '4 entrenamientos por semana' })
  @IsString()
  title: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  target_value: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  current_value?: number;

  @ApiPropertyOptional({ example: 'entrenamientos' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: '2024-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
