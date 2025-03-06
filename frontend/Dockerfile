FROM node:18

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies including Tailwind CSS
RUN npm install
RUN npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
RUN npm install -g vite

# Copy all project files
COPY . .

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]
