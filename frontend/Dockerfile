FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install @tailwindcss/oxide-linux-x64-gnu lightningcss-linux-x64-gnu --save-optional

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]