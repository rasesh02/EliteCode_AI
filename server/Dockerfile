FROM node:20-alpine

RUN apk add --no-cache \
    gcc g++ make \
    python3 python3-dev py3-pip \
    openjdk11-jdk redis bash

WORKDIR /app

# ==== Install Dependencies ====
COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY worker/package*.json ./worker/
RUN cd worker && npm install

# ==== Copy Source ====
COPY backend ./backend
COPY worker ./worker

EXPOSE 4000 8080 6379

# CMD ["node","backend/src/index.js"]
# CMD ["node","worker/src/index.js"]
#CMD bash -c "node backend/src/index.js & node worker/src/index.js"
CMD ["bash", "-c", "node backend/src/index.js & node worker/src/index.js"]

