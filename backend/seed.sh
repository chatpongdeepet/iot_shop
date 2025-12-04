#!/bin/bash
set -e

echo "Running seed scripts..."

echo "Seeding products..."
python seed_products.py

echo "Seeding visitors..."
python seed_visitors.py

echo "Seeding pending orders..."
python seed_pending_orders.py

echo "Seeding analytics..."
python seed_analytics.py

echo "Seeding completed successfully!"
