---
name: docker-portainer-swarm
description: Contexto y procedimiento para analizar, dockerizar, desplegar, actualizar y mantener proyectos en Docker Swarm mediante Portainer, integrándolos de forma segura con la infraestructura existente, Traefik, redes, bases de datos y volúmenes.
---

# Skill: Contexto de despliegue de proyectos en Docker Swarm y Portainer

> **Propósito:** usar este documento como contexto base cada vez que se
> solicite analizar, dockerizar, desplegar, actualizar o solucionar un
> proyecto en el servidor Docker administrado con Portainer.\
> **Idioma de trabajo:** español.\
> **Regla principal:** adaptar cada despliegue al proyecto real y a la
> infraestructura existente. No inventar puertos, variables, rutas,
> comandos, imágenes ni dependencias.

------------------------------------------------------------------------

## 1. Infraestructura conocida del servidor

La información siguiente procede de la configuración y capturas
compartidas por el usuario. Debe tratarse como contexto inicial y volver
a verificarse cuando la tarea dependa de ella, porque la infraestructura
puede cambiar.

  -----------------------------------------------------------------------
  Elemento                            Contexto conocido
  ----------------------------------- -----------------------------------
  Orquestación                        Docker Swarm

  Administrador                       Portainer Community Edition

  Entorno de Portainer                `primary`

  Nodo de despliegue                  Existe un nodo manager llamado `dk`
                                      en las capturas

  Red compartida de aplicaciones      `skammnet`

  Driver de `skammnet`                `overlay`

  Subred observada                    `10.0.1.0/24`

  Gateway observado                   `10.0.1.1`

  Proxy inverso                       Traefik

  Entrada HTTPS usada en ejemplos     `websecure`

  Resolver TLS usado en ejemplos      `letsencryptresolver`

  Dominio de ejemplo                  `blind.pe`

  Registro de imágenes de ejemplo     GitHub Container Registry (GHCR)
  -----------------------------------------------------------------------

### Redes observadas

-   `skammnet`: red overlay personalizada para conectar stacks.
-   `ingress`: red overlay de Swarm.
-   `docker_gwbridge`: red bridge interna de Swarm.
-   `bridge`, `host` y `none`: redes estándar de Docker.

**Preferencia:** conectar las aplicaciones web nuevas a la red externa
`skammnet` para que Traefik pueda alcanzarlas, siempre que la red siga
existiendo y sea adecuada para el servicio.

Antes de desplegar, comprobar en Portainer o por CLI:

``` bash
docker network inspect skammnet
docker node ls
docker service ls
docker stack ls
```

No crear otra red con el mismo nombre ni modificar la red compartida sin
una razón técnica y autorización.

------------------------------------------------------------------------

## 2. Stacks y servicios existentes conocidos

Las capturas muestran estos stacks:

-   `freellmapi`
-   `minio`
-   `n8n`
-   `portainer`
-   `postgres`
-   `supabase`
-   `traefik`

Se conoce un ejemplo de FreeLLMAPI que utiliza el puerto interno `3001`
y la red `skammnet`. No asumir que ese es su único puerto ni que todos
los servicios están conectados a la misma red.

### Regla para evitar conflictos

1.  No publicar puertos del host (`ports:`) por defecto.
2.  Para aplicaciones HTTP/HTTPS, preferir Traefik y conectar el
    servicio a `skammnet`.
3.  Descubrir el puerto interno real leyendo `Dockerfile`,
    `package.json`, configuración del servidor y documentación.
4.  No asumir que el puerto interno coincide con el puerto del host.
5.  No reutilizar nombres de routers, servicios Traefik, contenedores,
    stacks o volúmenes.
6.  Asignar nombres únicos y descriptivos, por ejemplo `proyecto_web`,
    `proyecto_api` y `proyecto_db`.
7.  Antes de asignar un dominio, comprobar que no esté usado por otro
    router.
8.  Si un servicio requiere acceso directo desde fuera, justificarlo y
    comprobar antes que el puerto esté libre.

Para revisar puertos publicados y servicios activos:

``` bash
docker service ls
docker ps --format 'table {{.Names}}\t{{.Ports}}'
docker service inspect NOMBRE_DEL_SERVICIO
ss -lntup
```

No afirmar que un puerto está libre sin comprobarlo en el servidor.

------------------------------------------------------------------------

## 3. Convenciones recomendadas para nuevos despliegues

### Stack

-   Usar un nombre de stack corto, único y en minúsculas:
    `nombre-proyecto`.
-   Mantener los servicios relacionados dentro del mismo stack cuando
    tenga sentido.
-   Usar `deploy.mode: replicated` y una réplica inicialmente, salvo que
    la aplicación soporte y requiera escalado.
-   Para aplicaciones con almacenamiento local o estado no replicado,
    fijar el servicio al nodo que contiene los datos.
-   No añadir restricciones de nodo a ciegas: confirmar el nombre y rol
    del nodo.

### Red externa

En los stacks que necesiten comunicarse con Traefik:

``` yaml
networks:
  skammnet:
    external: true
    name: skammnet
```

Y en cada servicio que deba ser accesible por Traefik:

``` yaml
services:
  app:
    networks:
      - skammnet
```

No declarar `skammnet` como una red nueva administrada por el stack.

### Traefik

Plantilla orientativa. Sustituir dominio, nombres y puerto únicamente
después de verificarlos:

``` yaml
deploy:
  labels:
    - traefik.enable=true
    - traefik.docker.network=skammnet
    - traefik.http.routers.NOMBRE_UNICO.rule=Host(`app.dominio-real`)
    - traefik.http.routers.NOMBRE_UNICO.entrypoints=websecure
    - traefik.http.routers.NOMBRE_UNICO.tls=true
    - traefik.http.routers.NOMBRE_UNICO.tls.certresolver=letsencryptresolver
    - traefik.http.services.NOMBRE_UNICO.loadbalancer.server.port=PUERTO_INTERNO_REAL
    - traefik.http.routers.NOMBRE_UNICO.service=NOMBRE_UNICO
```

Notas:

-   En Docker Swarm, colocar las etiquetas de enrutamiento en
    `deploy.labels` del servicio.
-   El puerto de `loadbalancer.server.port` es el puerto **interno del
    contenedor**, no un puerto publicado del host.
-   `traefik.docker.network=skammnet` ayuda a seleccionar la red
    correcta cuando el contenedor está conectado a varias redes.
-   Confirmar que el proveedor Swarm de Traefik, el entrypoint y el
    resolver estén configurados con esos nombres. No asumir que las
    etiquetas de un ejemplo garantizan que Traefik esté configurado
    igual.
-   No añadir routers HTTP, redirecciones ni middleware duplicados si
    Traefik ya los gestiona globalmente.
-   Cada aplicación debe tener un hostname único.

### Volúmenes

-   Persistir únicamente los datos que la aplicación realmente necesita
    conservar.
-   Dar nombres únicos a los volúmenes: `nombre_proyecto_data`,
    `nombre_proyecto_uploads`, etc.
-   No montar una ruta dentro del contenedor sin confirmar que
    corresponde a la ruta de datos real.
-   En Swarm, un volumen local pertenece al nodo donde se crea. Si el
    servicio se mueve a otro nodo, los datos pueden no estar allí.
-   Para volúmenes locales, usar una restricción al nodo adecuado o
    diseñar almacenamiento compartido.
-   No reutilizar el volumen de otro stack sin verificar compatibilidad
    y autorización.
-   Definir un procedimiento de backup y restauración antes de
    producción.

### Base de datos

Existe un stack llamado `postgres` y otro llamado `supabase`, pero no se
conoce todavía su topología, credenciales, bases de datos, puertos
internos ni redes.

Antes de conectar un proyecto a una base existente:

1.  Identificar qué contenedor/servicio proporciona PostgreSQL.
2.  Verificar la red compartida entre aplicación y base de datos.
3.  Obtener el hostname interno correcto del servicio.
4.  Confirmar el puerto interno y la versión de PostgreSQL.
5.  Crear una base de datos y un usuario propios para el proyecto, con
    privilegios mínimos.
6.  Confirmar si el proyecto usa migraciones (por ejemplo Drizzle,
    Prisma, TypeORM o SQL manual).
7.  No reutilizar el usuario administrador ni la base de datos de otro
    proyecto.
8.  No publicar PostgreSQL a Internet para permitir la conexión entre
    contenedores.

Si no se puede verificar que la base existente sea adecuada, proponer
una base de datos independiente dentro del stack o solicitar los datos
que faltan.

------------------------------------------------------------------------

## 4. Seguridad y secretos

-   Nunca copiar contraseñas, tokens, claves API o claves de cifrado
    directamente en el YAML que se vaya a guardar en Git.
-   No reproducir secretos que aparezcan en capturas, archivos o
    ejemplos.
-   Usar variables de entorno gestionadas por Portainer para valores no
    sensibles y Docker Secrets para secretos cuando la aplicación lo
    soporte.
-   Si se requiere una clave de cifrado, generar una clave
    criptográficamente segura y persistente. No cambiarla en cada
    redeploy si cifra datos existentes.
-   No incluir `.env` real en el repositorio.
-   Mantener `.env.example` con nombres de variables y valores
    ficticios/no sensibles.
-   Usar imágenes oficiales o de fuentes confiables y fijar versiones o
    digests en producción cuando sea viable.
-   No ejecutar contenedores como root si la imagen permite un usuario
    no privilegiado.
-   Evitar `privileged: true`, montajes del socket Docker y capacidades
    adicionales salvo necesidad demostrada.
-   No desactivar TLS ni la validación de certificados para resolver
    errores de despliegue.

------------------------------------------------------------------------

## 5. Flujo obligatorio para analizar un repositorio

Antes de escribir el Dockerfile o el stack, inspeccionar el repositorio
real. En proyectos Node/TypeScript, revisar como mínimo:

-   `README.md`
-   `package.json`
-   archivo de lock (`bun.lock`, `bun.lockb`, `package-lock.json`,
    `pnpm-lock.yaml` o `yarn.lock`)
-   `Dockerfile`, si existe
-   `.dockerignore`
-   `.env.example`
-   configuración del servidor (`server.ts`, `server.impl.ts`,
    `src/server/*`, etc.)
-   configuración de base de datos (`drizzle.config.ts`, Prisma schema u
    otra)
-   scripts de build, start y migración
-   directorios de uploads, archivos estáticos y almacenamiento
-   requisitos de runtime y versión de Node/Bun
-   puertos y healthchecks documentados

No asumir que todo proyecto TypeScript usa Node, Express o el puerto
3000. Verificar el framework, runtime, comando de inicio, salida del
build y puerto de escucha.

Si el repositorio es privado y no se puede leer, pedir al usuario que
conecte GitHub o comparta los archivos necesarios. No inventar su
contenido.

### Preguntas técnicas que deben resolverse

-   ¿Qué comando instala dependencias?
-   ¿Qué comando compila?
-   ¿Qué comando inicia producción?
-   ¿Qué runtime y versión requiere?
-   ¿En qué interfaz escucha: `0.0.0.0` o `localhost`?
-   ¿Qué puerto interno utiliza?
-   ¿Qué variables de entorno son obligatorias?
-   ¿Necesita base de datos, Redis, almacenamiento S3 u otros servicios?
-   ¿Qué directorios necesitan persistencia?
-   ¿Cómo se ejecutan las migraciones?
-   ¿Tiene endpoint de healthcheck?
-   ¿Cómo se construye y publica la imagen?

Si falta un dato esencial, indicarlo y preguntar por él. No rellenarlo
con valores supuestos.

------------------------------------------------------------------------

## 6. Construcción y publicación de imágenes

En Docker Swarm, preferir una imagen ya construida y publicada en un
registry accesible por los nodos. No asumir que el campo `build:` de un
Compose desplegado como stack en Portainer construirá la imagen en el
servidor.

Flujo habitual:

1.  Crear o adaptar un `Dockerfile` multi-stage según el runtime real.
2.  Crear `.dockerignore`.
3.  Construir la imagen.
4.  Probarla localmente.
5.  Publicarla en GHCR u otro registry configurado.
6.  Configurar credenciales de registry en Portainer si el repositorio
    es privado.
7.  Referenciar la imagen publicada en el stack.
8.  Usar una etiqueta de versión reproducible, no depender
    exclusivamente de `latest`.

Ejemplo conceptual de referencia de imagen:

``` yaml
image: ghcr.io/USUARIO/REPOSITORIO:VERSION
```

No afirmar que la imagen existe hasta comprobar que fue construida y
publicada.

------------------------------------------------------------------------

## 7. Plantilla base de stack Swarm

Esta plantilla es una guía, no un archivo listo para desplegar.
Completar solo con datos confirmados:

``` yaml
version: "3.7"

services:
  nombre_app:
    image: ghcr.io/USUARIO/IMAGEN:VERSION

    environment:
      NODE_ENV: production
      # Añadir solo variables requeridas y verificadas.

    networks:
      - skammnet

    volumes:
      # Añadir solo si se confirmó la ruta persistente.
      - nombre_app_data:/RUTA_REAL_DE_DATOS

    deploy:
      mode: replicated
      replicas: 1

      placement:
        constraints:
          - node.role == manager

      restart_policy:
        condition: on-failure

      labels:
        - traefik.enable=true
        - traefik.docker.network=skammnet
        - traefik.http.routers.nombre_app.rule=Host(`app.dominio-real`)
        - traefik.http.routers.nombre_app.entrypoints=websecure
        - traefik.http.routers.nombre_app.tls=true
        - traefik.http.routers.nombre_app.tls.certresolver=letsencryptresolver
        - traefik.http.services.nombre_app.loadbalancer.server.port=PUERTO_INTERNO_REAL
        - traefik.http.routers.nombre_app.service=nombre_app

volumes:
  nombre_app_data:
    driver: local

networks:
  skammnet:
    external: true
    name: skammnet
```

Si no se necesita persistencia, eliminar el volumen en vez de conservar
una ruta ficticia. Si el servicio no es HTTP, no añadir etiquetas
Traefik HTTP.

------------------------------------------------------------------------

## 8. Procedimiento de despliegue en Portainer

1.  Revisar el repositorio y resolver los datos técnicos pendientes.
2.  Preparar Dockerfile y `.dockerignore`, si hacen falta.
3.  Construir, probar y publicar la imagen.
4.  Confirmar que el nodo Swarm puede descargar la imagen.
5.  Verificar que `skammnet` existe y que Traefik está conectado a ella.
6.  Crear el DNS del subdominio apuntando al servidor, si todavía no
    existe.
7.  En Portainer, elegir el entorno `primary`.
8.  Abrir **Stacks → Add stack**.
9.  Asignar un nombre único al stack.
10. Pegar el Compose definitivo o configurar el repositorio Git.
11. Definir variables y secretos sin exponerlos en el repositorio.
12. Desplegar el stack.
13. Revisar servicios, logs, healthcheck y eventos.
14. Probar HTTP/HTTPS, conexión a la base de datos y funciones
    principales.
15. Confirmar persistencia reiniciando el servicio de forma controlada.
16. Documentar backup, actualización y rollback.

------------------------------------------------------------------------

## 9. Comprobaciones posteriores al despliegue

Comandos útiles en un nodo manager:

``` bash
docker stack ls
docker stack services NOMBRE_STACK
docker service ls
docker service ps NOMBRE_STACK_NOMBRE_SERVICIO
docker service logs -f NOMBRE_STACK_NOMBRE_SERVICIO
docker network inspect skammnet
```

Comprobar:

-   El servicio tiene el número esperado de réplicas.
-   La imagen se descargó correctamente.
-   La aplicación escucha en la interfaz y puerto correctos.
-   Traefik detecta el router y el servicio.
-   El certificado TLS se emite correctamente.
-   La base de datos es accesible por la red interna.
-   Las migraciones terminaron correctamente.
-   Los volúmenes persisten después de recrear el contenedor.
-   No hay reinicios continuos ni errores críticos.
-   Ningún puerto del host fue ocupado accidentalmente.

No declarar el despliegue exitoso solo porque Portainer muestre el stack
creado: verificar que la aplicación responde y funciona.

------------------------------------------------------------------------

## 10. Actualizaciones, rollback y limpieza

-   Usar etiquetas versionadas para las imágenes.
-   Antes de actualizar una base de datos, revisar compatibilidad y
    realizar backup.
-   No eliminar volúmenes durante una actualización.
-   Conservar la versión anterior de la imagen para rollback.
-   Revisar las notas de versión y las migraciones antes de actualizar.
-   No ejecutar `docker system prune --volumes` ni borrar volúmenes como
    solución genérica.
-   No eliminar redes compartidas, stacks existentes ni servicios ajenos
    al proyecto.
-   Al retirar un proyecto, confirmar con el usuario qué datos y
    volúmenes deben conservarse.

------------------------------------------------------------------------

## 11. Formato esperado de las respuestas del asistente

Cuando el usuario solicite desplegar un proyecto futuro, entregar:

1.  **Diagnóstico del repositorio:** tecnología, runtime, build, inicio,
    puerto, dependencias y persistencia confirmados.
2.  **Compatibilidad con la infraestructura:** red, Traefik, dominio,
    base de datos y posibles conflictos.
3.  **Archivos necesarios:** Dockerfile, `.dockerignore`, Compose/stack,
    configuración de entorno y workflow CI/CD si procede.
4.  **Stack completo para Portainer:** YAML listo para pegar, sin
    placeholders ocultos. Si faltan datos, marcar claramente los campos
    pendientes y no presentarlo como listo.
5.  **Variables y secretos:** nombre, propósito, si es obligatorio y
    cómo configurarlo de forma segura; nunca revelar secretos.
6.  **Pasos de despliegue:** instrucciones precisas en Portainer.
7.  **Verificación:** comandos, logs, URL y pruebas funcionales.
8.  **Mantenimiento:** persistencia, backup, actualización y rollback.

### Reglas de comunicación

-   Responder en español, con instrucciones ordenadas y prácticas.
-   Diferenciar claramente hechos comprobados, recomendaciones y datos
    pendientes.
-   No repetir preguntas que ya estén respondidas en el contexto.
-   Preguntar solo por los datos esenciales que falten.
-   No afirmar que se inspeccionó, construyó, publicó o desplegó algo si
    no se hizo.
-   Proteger credenciales y datos privados.
-   Priorizar cambios mínimos y reversibles sobre la infraestructura
    existente.

------------------------------------------------------------------------

## 12. Contexto que debe actualizarse con el tiempo

Este documento es una fotografía inicial, no una fuente de verdad
permanente. En cada nuevo proyecto confirmar los datos que puedan haber
cambiado:

-   Nodos y roles de Swarm.
-   Existencia, driver y subred de `skammnet`.
-   Nombre y configuración actual de Traefik.
-   EntryPoints y certificado resolver activos.
-   Dominios y routers ya utilizados.
-   Stacks, servicios y puertos publicados.
-   Disponibilidad y topología de PostgreSQL, Supabase y MinIO.
-   Ubicación de volúmenes y política de backups.
-   Registry y permisos de descarga de imágenes privadas.

**Objetivo final:** desplegar nuevos proyectos de forma aislada, segura,
reproducible y mantenible, aprovechando la infraestructura existente sin
interrumpir los stacks que ya están funcionando.
