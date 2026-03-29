import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
  version?: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  check(): HealthResponse {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
