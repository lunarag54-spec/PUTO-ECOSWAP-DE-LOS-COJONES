# EcoSwap - Plataforma de Compraventa de Segunda Mano

## Descripción
EcoSwap es una aplicación web que permite a los usuarios publicar, buscar, comprar y vender artículos de segunda mano, con especial enfoque en videojuegos, música, coleccionismo y ropa. El objetivo es fomentar la economía circular y el consumo responsable.

## Tecnologías Backend

- **Java 23**
- **Spring Boot 4.0.3**
- **Spring Data JPA + Hibernate**
- **PostgreSQL 18**
- **Spring Security + JWT (0.13.0)**
- **Lombok**
- **Maven**


## Funcionalidades Implementadas

### Autenticación
- Registro y login de usuarios con validación
- Autenticación basada en **JWT**
- Roles: `USER` y `ADMIN`
- Protección de endpoints con filtro JWT

### Productos
- Crear, listar, editar y eliminar productos
- Solo el propietario puede editar o eliminar sus productos
- Búsqueda avanzada (categoría, estado, rango de precio)
- Paginación y ordenación

### Favoritos
- Añadir y quitar productos de favoritos
- Ver lista personal de favoritos

### Panel de Administración (solo ADMIN)
- Listar y eliminar usuarios
- Listar y eliminar cualquier producto

### Otras características
- Manejo centralizado de excepciones
- Validaciones con `@Valid`
- Uso de DTOs para separar entidades de la API

## Endpoints Principales

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Products**
- `POST /api/products`
- `GET /api/products` (con filtros y paginación)
- `GET /api/my-products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

**Favorites**
- `POST /api/favorites/{productId}`
- `DELETE /api/favorites/{productId}`
- `GET /api/favorites`

**Admin** (solo rol ADMIN)
- `GET /api/admin/users`
- `DELETE /api/admin/users/{id}`
- `GET /api/admin/products`
- `DELETE /api/admin/products/{id}`