import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern({ cmd: 'process_payment' })
  async handleProcessPayment(
    @Payload() data: { orderId: string; userId: string; amount: number },
  ) {
    console.log(`💳 Received payment request for Order: ${data.orderId}`);

    return await this.paymentsService.processPayment(data);
  }

  // اختياري: إذا أردت جلب تاريخ مدفوعات مستخدم معين
  // @MessagePattern({ cmd: 'get_user_payments' })
  // async handleGetUserPayments(@Payload() data: { userId: string }) {
  //   return await this.paymentsService.getUserPayments(data.userId);
  // }
}
