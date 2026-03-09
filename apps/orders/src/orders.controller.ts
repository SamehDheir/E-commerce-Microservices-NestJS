import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create_order' })
  async handleCreateOrder(
    @Payload()
    data: {
      userId: string;
      items: Array<{ productId: string; quantity: number }>;
    },
  ) {
    return this.ordersService.createOrder(data.userId, {
      items: data.items,
    });
  }

  @MessagePattern({ cmd: 'get_order' })
  async handleGetOrder(@Payload() data: { id: string }) {
    return this.ordersService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_user_orders' })
  async handleGetUserOrders(
    @Payload() data: { userId: string; page?: number; limit?: number },
  ) {
    return this.ordersService.findUserOrders(
      data.userId,
      data.page,
      data.limit,
    );
  }

  @MessagePattern({ cmd: 'update_order_status' })
  async handleUpdateOrderStatus(
    @Payload()
    data: {
      id: string;
      status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    },
  ) {
    return this.ordersService.updateOrderStatus(data.id, data.status);
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async handleCancelOrder(@Payload() data: { id: string }) {
    return this.ordersService.cancelOrder(data.id);
  }

  @MessagePattern({ cmd: 'get_order_stats' })
  async handleGetOrderStats(@Payload() data: { userId: string }) {
    return this.ordersService.getUserOrderStats(data.userId);
  }
}
