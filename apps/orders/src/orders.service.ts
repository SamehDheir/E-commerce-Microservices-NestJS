import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  // Create a new order
  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let totalOrderPrice = 0;
    const orderItems: OrderItem[] = [];
    const productUpdates: Array<{ id: string; quantity: number }> = [];

    // Validate all products exist and have sufficient stock
    try {
      for (const item of createOrderDto.items) {
        const product = await lastValueFrom(
          this.productClient.send(
            { cmd: 'get_one_product' },
            { id: item.productId },
          ),
        );

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        // Calculate price and track product update
        totalOrderPrice += Number(product.price) * item.quantity;
        productUpdates.push({
          id: item.productId,
          quantity: item.quantity,
        });

        // Create order item entity
        const orderItem = this.orderItemRepo.create({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
        orderItems.push(orderItem);
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new RpcException('Failed to communicate with Product Service');
    }

    // Create and save order
    const newOrder = this.orderRepo.create({
      userId,
      totalPrice: totalOrderPrice,
      status: 'PENDING',
      items: orderItems,
    });

    const savedOrder = await this.orderRepo.save(newOrder);

    // Emit stock reduction events (asynchronous, non-blocking)
    for (const update of productUpdates) {
      this.productClient.emit({ cmd: 'reduce_stock' }, update);
    }

    return this.mapOrderToResponse(savedOrder);
  }

  // Retrieve all orders for a user with pagination
  async findUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: OrderResponseDto[]; total: number; page: number }> {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: orders.map((order) => this.mapOrderToResponse(order)),
      total,
      page,
    };
  }

  // Retrieve a single order by ID
  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapOrderToResponse(order);
  }

  // Update order status
  async updateOrderStatus(
    id: string,
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED',
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = status;
    const updatedOrder = await this.orderRepo.save(order);

    return this.mapOrderToResponse(updatedOrder);
  }

  // Cancel an order and reverse stock changes
  async cancelOrder(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    // Reverse stock reduction for each item
    for (const item of order.items) {
      this.productClient.emit(
        { cmd: 'increase_stock' },
        {
          id: item.productId,
          quantity: item.quantity,
        },
      );
    }

    order.status = 'CANCELLED';
    const cancelledOrder = await this.orderRepo.save(order);

    return this.mapOrderToResponse(cancelledOrder);
  }

  // Get order statistics for a user
  async getUserOrderStats(userId: string) {
    const orders = await this.orderRepo.find({
      where: { userId },
      relations: ['items'],
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );
    const completedOrders = orders.filter(
      (o) => o.status === 'COMPLETED',
    ).length;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const cancelledOrders = orders.filter(
      (o) => o.status === 'CANCELLED',
    ).length;

    return {
      totalOrders,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      completedOrders,
      pendingOrders,
      cancelledOrders,
    };
  }

  //  Helper method to map Order entity to response DTO
  private mapOrderToResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      totalPrice: Number(order.totalPrice),
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      createdAt: order.createdAt,
    };
  }
}
