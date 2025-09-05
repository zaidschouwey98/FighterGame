# ---- Étape 1 : Build ----
FROM node:24 AS build

WORKDIR /app

# Copier les fichiers de config
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY tsconfig.json ./

# Installer dépendances (prod + dev)
RUN npm install

# Installer dépendances client
RUN cd client && npm install

# Copier le reste du code
COPY . .

# Build du front et du serveur
RUN npm run build

# ---- Étape 2 : Image finale (légère) ----
FROM node:24

WORKDIR /app

# Copier seulement ce qu'il faut (pas les sources TypeScript)
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY package*.json ./

# Installer uniquement les deps prod
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "dist/server/server.js"]
