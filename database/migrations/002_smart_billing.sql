-- Milestone 2: discounts, cashback, final total, payment mode
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS cashback_amount DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS final_amount DECIMAL(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(32) NULL;

-- Backfill final_amount for existing rows (no discount/cashback)
UPDATE bills SET final_amount = total_amount WHERE final_amount = 0 AND COALESCE(total_amount::numeric, 0) > 0;
