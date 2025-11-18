-- =====================================================
-- FIX: Change quantity columns from INT to DECIMAL
-- =====================================================
-- Issue: Decimal quantities (e.g., 0.5 kg) were being stored as 0
-- because the database columns were defined as INT instead of DECIMAL
-- 
-- This script updates all order-related tables to use DECIMAL(10,2)
-- for quantity fields to properly store decimal values.
--
-- Date: 2025-11-18
-- =====================================================

-- Backup recommendation: Before running this script, backup your database:
-- mysqldump -u username -p database_name > backup_before_decimal_fix.sql

USE knf; -- Replace with your actual database name if different

-- Fix final_order table
ALTER TABLE `final_order` 
MODIFY COLUMN `quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Fix order_fulfillment table  
ALTER TABLE `order_fulfillment` 
MODIFY COLUMN `quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Fix order_fulfillment - fulfilled quantity column (if it exists)
-- Check if fullfill_quantity column exists before running
ALTER TABLE `order_fulfillment` 
MODIFY COLUMN `fullfill_quantity` DECIMAL(10,2) DEFAULT 0.00;

-- Fix temp_inventory table (stores available quantities)
ALTER TABLE `temp_inventory` 
MODIFY COLUMN `quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Fix inventory table (if it exists and has quantity column)
ALTER TABLE `inventory` 
MODIFY COLUMN `quantity` DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Verify changes
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'knf' -- Replace with your actual database name
    AND COLUMN_NAME = 'quantity'
    AND TABLE_NAME IN ('final_order', 'order_fulfillment', 'temp_inventory', 'inventory')
ORDER BY 
    TABLE_NAME;

-- =====================================================
-- End of migration script
-- =====================================================
