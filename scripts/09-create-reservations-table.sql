-- Create the reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_name TEXT NOT NULL,
  client_phone TEXT, -- Ensure this column is present
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_guests INTEGER NOT NULL,
  daily_rate_at_booking NUMERIC(10, 2) NOT NULL,
  cleaning_fee_at_booking NUMERIC(10, 2) DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT
);

-- Add cleaning_fee_at_booking column if it does not exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations' AND column_name = 'cleaning_fee_at_booking'
    ) THEN
        ALTER TABLE reservations
        ADD COLUMN cleaning_fee_at_booking NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
END
$$;

-- Add client_phone column if it does not exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations' AND column_name = 'client_phone'
    ) THEN
        ALTER TABLE reservations
        ADD COLUMN client_phone TEXT;
    END IF;
END
$$;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to prevent duplicates
DROP TRIGGER IF EXISTS set_reservations_updated_at ON reservations;

-- Create the trigger
CREATE TRIGGER set_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_property_id ON reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
