FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci
RUN npm install @tailwindcss/oxide-linux-x64-gnu lightningcss-linux-x64-gnu --save-optional

COPY . .

# Next.js incorpora esta variable durante el build.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]