# Etapa de construcción
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos todo el código
COPY . .

# Damos permisos de ejecución al Maven Wrapper
RUN chmod +x ./mvnw

# Construimos la aplicación
RUN ./mvnw clean package -DskipTests

# Etapa final (más ligera)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]