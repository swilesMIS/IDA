# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY postcss.config.* ./
COPY tailwind.config.* ./
COPY next.config.* ./
RUN npm install

# Copy source files
COPY public ./public
COPY src ./src

# Build the app
RUN npm run build

# Stage 2: Run the app in production
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.* ./ # for standalone or edge config

EXPOSE 3000

CMD ["npm", "start"]
