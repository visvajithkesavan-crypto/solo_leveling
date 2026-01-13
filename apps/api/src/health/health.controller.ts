import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }

  @Get('simple')
  simpleCheck() {
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      service: 'Solo Leveling API',
    };
  }
}
