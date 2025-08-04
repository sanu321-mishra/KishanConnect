-- Add payment fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_order_id ON orders(payment_order_id); 