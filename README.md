# GroupsApp
Diseñar, implementar y desplegar en AWS una aplicación de mensajería instantánea llamada GroupsApp similar a WhatsApp o Telegram con arquitectura distribuida, altamente escalable y tolerable a fallos.

## Arquitectura
El sistema está compuesto por:

|- Frontend (React)|
|-------|
|- API Gateway|
|- Auth Service|
|- User Service|
|- Group Service|
|- Message Service|
|- File Service|

|Comunicación|Infraestructura|
|-------|-----|
| - REST API, gRPC, RabbithMQ | - Docker, Kubernetes, AWS |

## Diagramas del proyecto.
Tenemos 3 diagramas bases que muestran la arquitectura, el modelado de los datos y los procesos prinicpales de la página web.
### Distributed System Diagram
<img width="1400" height="712" alt="image" src="https://github.com/user-attachments/assets/3ea87522-cc91-40fe-bfac-e06cbff00982" />

## Ejecución local

```bash
docker-compose up
