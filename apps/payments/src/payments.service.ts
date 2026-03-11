import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config'; 
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!stripeKey) {
      this.logger.error('STRIPE_SECRET_KEY is missing!');
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2026-02-25.clover',
    });
  }

  async processPayment(data: ProcessPaymentDto) {
    // 1. Idempotency Check
    const existingPayment = await this.paymentRepo.findOne({
      where: { orderId: data.orderId, status: 'SUCCESS' },
    });

    if (existingPayment) {
      throw new RpcException('Order already processed and paid.');
    }

    try {
      // 2. Stripe PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: this.configService.get<string>('STRIPE_CURRENCY', 'usd'),
        payment_method: 'pm_card_visa',
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata: {
          orderId: data.orderId,
          userId: data.userId,
        },
      });

      // 3. Save Record
      const payment = this.paymentRepo.create({
        ...data,
        transactionId: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'SUCCESS' : 'PENDING',
      });
      await this.paymentRepo.save(payment);

      if (paymentIntent.status === 'succeeded') {
        // 4. Notify Order Service
        this.orderClient.emit(
          { cmd: 'update_order_status' },
          { id: data.orderId, status: 'COMPLETED' },
        );

        this.logger.log(`✅ Stripe Payment Succeeded: ${paymentIntent.id}`);
        return {
          status: 'SUCCESS',
          transactionId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        };
      }

      throw new Error('Payment required further action or failed');
    } catch (error) {
      this.logger.error(`❌ Stripe Payment Error: ${error.message}`);

      this.orderClient.emit(
        { cmd: 'update_order_status' },
        { id: data.orderId, status: 'CANCELLED' },
      );

      throw new RpcException(`Payment failed: ${error.message}`);
    }
  }
}