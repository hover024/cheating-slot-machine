FROM node:20.11.1-alpine3.19
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD npm run dev