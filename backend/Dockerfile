FROM oryd/kratos:v1.2.0

# Copy configuration files
COPY kratos.yml /etc/config/kratos/kratos.yml
COPY identity.schema.json /etc/config/kratos/identity.schema.json

# Copy startup script
COPY start.sh /start.sh

# Set working directory
WORKDIR /etc/config/kratos

# Expose ports
EXPOSE 4433 4434

# Override entrypoint and use the startup script
ENTRYPOINT []
CMD ["sh", "/start.sh"]
