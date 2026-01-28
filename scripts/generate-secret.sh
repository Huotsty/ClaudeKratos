#!/bin/bash

# Generate a secure secret for Kratos
echo "Generating secure secret for Kratos..."
SECRET=$(openssl rand -base64 32)
echo ""
echo "Your generated secret:"
echo "====================="
echo "$SECRET"
echo "====================="
echo ""
echo "Copy this secret and use it for SECRETS_DEFAULT in Railway"
echo ""
