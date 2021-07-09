FROM alpine:3.12

RUN apk add build-base curl git ;\
    mkdir -p /search ;\
    cd /search ;\
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y ;\
    source $HOME/.cargo/env ;\
    git clone --depth 1 https://github.com/meilisearch/MeiliSearch.git ;\
    cd MeiliSearch ;\
    cargo build --release

COPY crawl /search/crawl
COPY search /search/search
COPY config /search/config
COPY Run.js /search/
COPY minkebox /minkebox

RUN apk add nodejs npm ;\
    cd /search ; npm install --production ;\
    cd /search/search ; npm install --production ;\
    cd /search/crawl ; npm install --production ;\
    npm install --production ;\
    apk del npm build-base curl git

EXPOSE 7701/tcp
VOLUME /search/db

ENTRYPOINT /search/Run.js
