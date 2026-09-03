import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  async processPayment(orderId: string, amount: number): Promise<{ success: boolean, transactionId: string }> {
    // Mock payment processing
    return {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`
    };
  }
}
