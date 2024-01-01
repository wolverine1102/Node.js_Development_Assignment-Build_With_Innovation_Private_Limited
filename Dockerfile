FROM node:18.18.0-alpine
WORKDIR /home/Node.js_Development_Assignment
ADD . .
RUN npm install
EXPOSE 7050
CMD npm run dev