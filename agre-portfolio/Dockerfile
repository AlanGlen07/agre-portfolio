# ---------- 1) build the site ----------
FROM node:22-alpine AS build
WORKDIR /app

# install dependencies first so Docker can cache this layer
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* values into the files at build time, so pass them as build args:
#   docker build --build-arg VITE_FORMSPREE_ID=abcd1234 -t agre-portfolio .
ARG VITE_FORMSPREE_ID
ENV VITE_FORMSPREE_ID=$VITE_FORMSPREE_ID

RUN npm run build

# ---------- 2) serve it with nginx ----------
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]