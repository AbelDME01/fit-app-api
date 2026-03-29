import { IsOptional, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UseTemplateDto {
  @ApiPropertyOptional({ example: '2026-03-29T10:00:00.000Z', description: 'ISO 8601 date when the workout is scheduled' })
  @IsOptional()
  @IsISO8601()
  scheduledDate?: string;
}
