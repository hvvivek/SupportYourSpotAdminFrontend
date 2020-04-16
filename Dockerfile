FROM node:alpine

RUN yarn global add serve

WORKDIR /app

COPY build/ /app/build

ENV PORT 800
EXPOSE ${PORT}

# CMD ["printenv"]
CMD serve -p  $PORT -s build/


# Stage: 2 — The Production Environment
# FROM nginx:alpine

# # ------ Copying build files
# COPY build/ /usr/share/nginx/html
# COPY default.conf.template /etc/nginx/conf.d/default.conf.template

# ------ Exposing port

# ------ Running Server
# CMD ["nginx", "-g", "daemon off"]