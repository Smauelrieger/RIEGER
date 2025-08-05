-- Create seasonal_rentals table for managing vacation rentals
CREATE TABLE IF NOT EXISTS seasonal_rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_name TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  tenant_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_days INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  notes TEXT
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_seasonal_rentals_updated_at ON seasonal_rentals;
CREATE TRIGGER update_seasonal_rentals_updated_at
    BEFORE UPDATE ON seasonal_rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_seasonal_rentals_check_in_date ON seasonal_rentals(check_in_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_rentals_check_out_date ON seasonal_rentals(check_out_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_rentals_property_id ON seasonal_rentals(property_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_rentals_status ON seasonal_rentals(status);
