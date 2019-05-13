FROM solr:7.3-slim
USER root

COPY scripts/precreate-core /opt/docker-solr/scripts/precreate-core
RUN chmod +x /opt/docker-solr/scripts/precreate-core

USER solr

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["solr-foreground"]