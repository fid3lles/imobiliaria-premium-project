# -------- Build --------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -DskipTests package

# -------- Runtime --------
FROM eclipse-temurin:21-jre
WORKDIR /app

# App
COPY --from=build /app/target/*.jar /app/app.jar

# Garante a pasta de dados
RUN mkdir -p /data

# Copia o DB seed (que está em src/main/resources/data/app.db) para /data/app.db
COPY --from=build /app/src/main/resources/data/app.db /data/app.db

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]