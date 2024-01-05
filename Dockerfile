FROM node:18.18.0-alpine
WORKDIR /home/User_Management_Application
ADD . .
RUN npm install
EXPOSE 7050
CMD npm run dev