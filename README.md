# GroupsApp
Design, implement, and deploy on AWS an instant messaging application called GroupsApp, similar to WhatsApp or Telegram, with a distributed architecture that is highly scalable and fault-tolerant.

## Arquitectura
The system is composed of:

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
We have three base diagrams that show the architecture, the data modeling, and the main processes of the web application.

### Distributed System Diagram
<img width="1400" height="712" alt="image" src="https://github.com/user-attachments/assets/3ea87522-cc91-40fe-bfac-e06cbff00982" />

### Data Model Diagram
<img width="793" height="749" alt="image" src="https://github.com/user-attachments/assets/014f4e85-83e6-4088-9a71-1ce9c4e0c290" />

### Process System Diagram.
<img width="1145" height="712" alt="image" src="https://github.com/user-attachments/assets/c7721368-46b6-4be9-a7ea-048212b5414d" />

## Ejecución local

```bash
docker-compose up
