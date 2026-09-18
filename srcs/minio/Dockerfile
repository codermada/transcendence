FROM quay.io/minio/minio:RELEASE.2024-03-03T17-50-39Z

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["server", "/data", "--console-address", ":9001"]