FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

# guarda seeds fora do /data (porque /data pode ser volume)
RUN mkdir -p /app/seed /app/seed/propriedades /data /data/propriedades

# DB seed
COPY --from=build /app/src/main/resources/data/app.db /app/seed/app.db

# IMAGENS seed (opcional): src/main/resources/static/propriedades -> /app/seed/propriedades
# (se essa pasta não existir no repo, o build vai falhar — garanta que existe ou remova esta linha)
COPY --from=build /app/src/main/resources/static/propriedades/ /app/seed/propriedades/

# entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]