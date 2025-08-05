-- First, let's check if the reservations table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add all required columns if they don't exist
DO $$
BEGIN
    -- Add client_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'client_name'
    ) THEN
        ALTER TABLE reservations ADD COLUMN client_name TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add client_phone column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'client_phone'
    ) THEN
        ALTER TABLE reservations ADD COLUMN client_phone TEXT;
    END IF;

    -- Add property_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'property_id'
    ) THEN
        ALTER TABLE reservations ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
    END IF;

    -- Add check_in_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'check_in_date'
    ) THEN
        ALTER TABLE reservations ADD COLUMN check_in_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- Add check_out_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'check_out_date'
    ) THEN
        ALTER TABLE reservations ADD COLUMN check_out_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- Add num_guests column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'num_guests'
    ) THEN
        ALTER TABLE reservations ADD COLUMN num_guests INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Add daily_rate_at_booking column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'daily_rate_at_booking'
    ) THEN
        ALTER TABLE reservations ADD COLUMN daily_rate_at_booking NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add cleaning_fee_at_booking column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'cleaning_fee_at_booking'
    ) THEN
        ALTER TABLE reservations ADD COLUMN cleaning_fee_at_booking NUMERIC(10, 2) DEFAULT 0.00;
    END IF;

    -- Add total_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE reservations ADD COLUMN total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'status'
    ) THEN
        ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- Add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'notes'
    ) THEN
        ALTER TABLE reservations ADD COLUMN notes TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE reservations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Remove default constraints that were only needed for adding columns
ALTER TABLE reservations ALTER COLUMN client_name DROP DEFAULT;
ALTER TABLE reservations ALTER COLUMN check_in_date DROP DEFAULT;
ALTER TABLE reservations ALTER COLUMN check_out_date DROP DEFAULT;
ALTER TABLE reservations ALTER COLUMN num_guests DROP DEFAULT;
ALTER TABLE reservations ALTER COLUMN daily_rate_at_booking DROP DEFAULT;
ALTER TABLE reservations ALTER COLUMN total_amount DROP DEFAULT;

-- Add check constraint for status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reservations_status_check'
    ) THEN
        ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
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
CREATE INDEX IF NOT EXISTS idx_reservations_client_name ON reservations(client_name);
