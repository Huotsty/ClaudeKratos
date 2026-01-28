#!/bin/sh
set -e
echo "Running database migrations..."
kratos migrate sql -e --yes -c /etc/config/kratos/kratos.yml
echo "Starting Kratos server..."
exec kratos serve -c /etc/config/kratos/kratos.yml
