FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]
