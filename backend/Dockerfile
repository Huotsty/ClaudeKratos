FROM oryd/kratos:v1.0.0

# Copy configuration files
COPY kratos.yml /etc/config/kratos/kratos.yml
COPY identity.schema.json /etc/config/kratos/identity.schema.json

# Set working directory
WORKDIR /etc/config/kratos

# Expose ports
EXPOSE 4433 4434

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD kratos status --endpoint http://localhost:4434/health/ready || exit 1

# Use the configuration file
ENTRYPOINT ["kratos"]
CMD ["serve", "-c", "/etc/config/kratos/kratos.yml"]
