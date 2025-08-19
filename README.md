# Proyect

# 📚 CiberNext – Página Educativa

Este proyecto está desarrollado en **Angular 20+** siguiendo buenas prácticas y una arquitectura modular y escalable.  
La aplicación implementa separación por **features**, gestión de estado con **signals stores**, y servicios desacoplados para mantener un código limpio y fácil de mantener.  

---

## 🏛️ Arquitectura del proyecto

```plaintext
src/app/
 ├── core/
 │    ├── interceptors/
 │    │     └── error.interceptor.ts # Manejador de errores para toda la aplicacion
 │    ├── auth/
 │    │     ├── auth.service.ts         # Maneja login, logout, refresh token, perfil
 │    │     ├── auth.guard.ts           # Protege rutas
 │    │     └── auth.interceptor.ts     # Inyecta el token en cada request
 │    ├── services/
 │    │     └── Servicios globales
 │    └── guards/ 
 ├── shared/
 │    ├── components/ # Componentes en común para toda la app (navbar, footer, formularios, etc.)
 │    ├── pipes/
 │    └── directives/
 ├── features/
 │    ├── productos/
 │    │     ├── models/    # Interfaces que tipan cada tipo de respuesta (específicas de la feature, así evitamos el tipo "any")
 │    │     ├── pages/
 │    │     ├── components/
 │    │     ├── services/  # Servicios específicos de la feature (ver Artículo 1)
 │    │     ├── product.routes.ts  # Rutas específicas y relacionadas con la feature
 │    │     └── store/     # Manejo de estados con signals (ver Artículo 2)
 │    ├── usuarios/
 │    └── ventas/
 ├── models/               # Modelos compartidos en toda la app
 │    ├── usuario.model.ts
 │    ├── rol.model.ts
 │    └── auth-response.model.ts 
 ├── environments/ # Variables de entorno (ej: endpoint base de cada controlador)
 └── app.routes.ts
```

---

## 📌 Artículo 0 – Diferencia entre `service` y `store`

### 🔹 Service
👉 Se encarga de la **comunicación con la API** (capa de acceso a datos).  
- Realiza `HttpClient.get/post/put/delete`.  
- No guarda estado, solo devuelve `observables/promesas`.  
- Es un **DAO/Repository** en términos de arquitectura limpia.  

### 🔹 Store
👉 Se encarga de la **gestión de estado de la UI**.  
- Recibe datos del `service`.  
- Guarda los resultados en **signals** o en un **state manager** (`NgRx`, `NGXS`).  
- Expone datos listos para que los consuman los componentes.  

📌 **Regla de oro:**  
👉 El **store consume al service, no al revés**.  

---

## 📌 Artículo 1 – Ejemplo de un `service`

👉 Aquí solo hay llamadas **HTTP**, sin estado.  

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { environment } from '@envs/environment.development';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  create(product: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, product);
  }

  update(id: number, product: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```
---

## 📌 Artículo 2 – Ejemplo de un `store`

👉 Aquí solo hay llamadas **HTTP**, sin estado.  
Estado reactivo (signal).
Lógica de actualización local después de llamar al servicio.
Flags como loading o error para la UI

```ts
import { Injectable, signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly _products = signal<Producto[]>([]);
  readonly products = this._products.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  constructor(private service: ProductService) {}

  loadProducts() {
    this._loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => this._products.set(data),
      error: () => this._loading.set(false),
      complete: () => this._loading.set(false),
    });
  }

  addProduct(product: Producto) {
    this.service.create(product).subscribe(newProduct => {
      this._products.update(list => [...list, newProduct]);
    });
  }

  removeProduct(id: number) {
    this.service.delete(id).subscribe(() => {
      this._products.update(list => list.filter(p => p.id !== id));
    });
  }
}
```
---

📌 Resumen
product.service.ts → solo API (HTTP).
product.store.ts → estado en memoria (signals, NgRx) + coordinación con el servicio.

Los componentes → solo consumen el store, nunca directamente el service o al menos no directamente 
El store centraliza el estado → tus componentes solo "escuchan".
Puedes tener varios componentes (ej. lista, detalle, formulario) que comparten el mismo estado sin duplicar código.
El store abstrae la API → si mañana cambias la forma de obtener datos, no tocas los componentes.

📌 Cadena de responsabilidades:
Componente → Store → Service → API

# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
