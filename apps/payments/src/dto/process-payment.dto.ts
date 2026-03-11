import { IsNumber, IsUUID, Min } from "class-validator";

export class ProcessPaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsUUID()
  userId: string;
}