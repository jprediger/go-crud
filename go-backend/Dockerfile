FROM golang:1.22-alpine

WORKDIR /app

# Permite ao Go baixar automaticamente a versão de toolchain requisitada (go 1.24.4)
ENV GOTOOLCHAIN=auto

# Instala dependências básicas
RUN apk add --no-cache git

# Copia arquivos de dependências e faz o download
COPY go.mod go.sum ./
RUN go mod download

# Copia o restante do código
COPY . .

# Compila o binário
RUN go build -o server .

EXPOSE 8080

# Comando padrão para subir o servidor
CMD ["./server"]



