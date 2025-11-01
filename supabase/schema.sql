-- EnerSense Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    total_energy_produced NUMERIC DEFAULT 0,
    total_tokens_minted NUMERIC DEFAULT 0,
    total_tokens_sold NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Energy devices table
CREATE TABLE IF NOT EXISTS energy_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    device_id TEXT UNIQUE NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('solar', 'wind', 'microgrid')),
    capacity_kw NUMERIC NOT NULL,
    location TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Energy readings table
CREATE TABLE IF NOT EXISTS energy_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES energy_devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exported_kwh NUMERIC NOT NULL,
    imported_kwh NUMERIC NOT NULL,
    surplus_kwh NUMERIC NOT NULL,
    battery_level NUMERIC,
    power_output_kw NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_energy_readings_timestamp ON energy_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_energy_readings_device ON energy_readings(device_id);

-- Mint vouchers table
CREATE TABLE IF NOT EXISTS mint_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES energy_devices(id) ON DELETE CASCADE,
    user_address TEXT NOT NULL,
    kwh_amount NUMERIC NOT NULL,
    token_amount TEXT NOT NULL,
    reading_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    voucher_hash TEXT NOT NULL,
    signature TEXT,
    nonce BIGINT NOT NULL,
    expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'minted', 'expired', 'failed')) DEFAULT 'pending',
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    minted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mint_vouchers_user ON mint_vouchers(user_address);
CREATE INDEX IF NOT EXISTS idx_mint_vouchers_status ON mint_vouchers(status);

-- Marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_address TEXT NOT NULL,
    token_amount TEXT NOT NULL,
    price_per_token TEXT NOT NULL,
    total_price TEXT NOT NULL,
    currency TEXT CHECK (currency IN ('USDC', 'MATIC', 'ETH')) DEFAULT 'MATIC',
    status TEXT CHECK (status IN ('active', 'sold', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    buyer_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_listings(seller_address);

-- kWALA workflow logs table
CREATE TABLE IF NOT EXISTS kwala_workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT CHECK (status IN ('started', 'completed', 'failed')) DEFAULT 'started',
    voucher_id UUID REFERENCES mint_vouchers(id) ON DELETE SET NULL,
    payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_kwala_logs_workflow ON kwala_workflow_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_kwala_logs_run ON kwala_workflow_logs(run_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_energy_devices_updated_at
    BEFORE UPDATE ON energy_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to trigger kWALA workflow when surplus energy is detected
CREATE OR REPLACE FUNCTION trigger_kwala_on_surplus()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.surplus_kwh > 1 THEN
        PERFORM pg_notify('surplus_detected', json_build_object(
            'device_id', NEW.device_id,
            'surplus_kwh', NEW.surplus_kwh,
            'timestamp', NEW.timestamp
        )::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to detect surplus energy
CREATE TRIGGER on_surplus_energy_detected
    AFTER INSERT ON energy_readings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_kwala_on_surplus();
