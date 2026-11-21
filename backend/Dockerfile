# ---- 构建阶段：用 Maven + JDK 21 编译打包 ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# 先只拷贝 pom.xml 以利用 Docker 层缓存下载依赖
COPY pom.xml .
RUN mvn -B dependency:go-offline

# 再拷贝源码并打包（跳过测试，加快部署构建）
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- 运行阶段：仅带 JRE 21，镜像更小 ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# 从构建阶段拷贝生成的 jar
COPY --from=build /app/target/*.jar app.jar

# Railway 会通过 PORT 环境变量注入端口，应用已配置 server.port=${PORT:8080}
EXPOSE 8080

# 限制 JVM 堆内存占容器内存的比例，适配 Railway Hobby 低内存环境，避免 OOM
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
