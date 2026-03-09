import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Query,
  Request,
  Inject,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from 'apps/orders/src/dto/create-order.dto';
import { lastValueFrom } from 'rxjs';
import { AuthGuard } from './auth.guard';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  /**
   * REST API: Create a new order
   * POST /orders
   */
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }

    return lastValueFrom(
      this.orderClient.send(
        { cmd: 'create_order' },
        {
          userId,
          items: createOrderDto.items,
        },
      ),
    );
  }

  /**
   * REST API: Get all orders for authenticated user
   * GET /orders?page=1&limit=10
   */
  @Get()
  async getUserOrders(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID is required');
    }
    return lastValueFrom(
      this.orderClient.send(
        { cmd: 'get_user_orders' },
        {
          userId,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      ),
    );
  }

  /**
   * REST API: Get a specific order by ID
   * GET /orders/:id
   */
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return lastValueFrom(this.orderClient.send({ cmd: 'get_order' }, { id }));
  }

  /**
   * REST API: Update order status
   * PATCH /orders/:id/status
   */
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateData: { status: 'PENDING' | 'COMPLETED' | 'CANCELLED' },
  ) {
    return lastValueFrom(
      this.orderClient.send(
        { cmd: 'update_order_status' },
        {
          id,
          status: updateData.status,
        },
      ),
    );
  }

  /**
   * REST API: Cancel an order
   * PATCH /orders/:id/cancel
   */
  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return lastValueFrom(
      this.orderClient.send({ cmd: 'cancel_order' }, { id }),
    );
  }

  /**
   * REST API: Get user order statistics
   * GET /orders/stats/summary
   */
  @Get('stats/summary')
  async getOrderStats(@Request() req: any) {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      throw new Error('User ID is required');
    }
    return lastValueFrom(
      this.orderClient.send({ cmd: 'get_order_stats' }, { userId }),
    );
  }
}
