export class OrderItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  id: string;
  userId: string;
  totalPrice: number;
  status: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
}
