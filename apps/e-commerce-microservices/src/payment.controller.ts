import { Controller, Post, Body, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from './auth.guard'; 

@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {}

  @Post('process')
  async pay(
    @Body() paymentDto: { orderId: string; amount: number },
    @Req() req: any,
  ) {
    return this.paymentClient.send(
      { cmd: 'process_payment' },
      {
        ...paymentDto,
        userId: req.user.id,
      },
    );
  }
}
