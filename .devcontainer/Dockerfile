ARG NODE_VERSION=20.12.2
FROM mcr.microsoft.com/devcontainers/typescript-node:${NODE_VERSION}

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        openssh-client \
        unzip \
    && rm -rf /var/lib/apt/lists/*

ARG HUGO_VERSION=0.140.0
RUN curl -sSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz" \
    | tar -xz -C /usr/local/bin hugo

ARG PNPM_VERSION=9.15.3
RUN corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate
