import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RunTestDto } from './dto/run-test.dto';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('run-test')
  async runTest(@Body() runTestDto: RunTestDto) {
    const finalResult = await this.appService.addTestJobAndWaitForResult(
      runTestDto,
    );
    return finalResult;
  }
}