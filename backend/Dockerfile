FROM node:20.11.1-alpine3.19
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 4000
CMD npx prisma db push && npm run dev