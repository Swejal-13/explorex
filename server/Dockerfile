FROM node:20-alpine

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create logs directory
RUN mkdir -p logs

EXPOSE 5000

CMD ["node", "index.js"]
