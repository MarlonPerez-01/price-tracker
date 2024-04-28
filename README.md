# Aplicación Shopify de seguimiento de cambios de precio

### Descripción:

Esta aplicación Shopify permite a los usuarios suscribirse a uno o varios productos para recibir notificaciones por correo electrónico cuando el precio de un producto específico cambia.

### Funcionalidades:

- Registro de usuario: Los usuarios pueden ingresar su nombre y correo electrónico para suscribirse a las notificaciones de cambios de precio.
- Suscripción: Los usuarios pueden seleccionar un producto específico para el que desean recibir notificaciones desde el ecommerce.
- Seguimiento de precios: La aplicación utiliza webhooks de Shopify para monitorear los cambios de precio del producto seleccionado.
- Notificaciones por correo electrónico: Cuando se detecta un cambio de precio, la aplicación envía una notificación por correo electrónico al usuario con los detalles del cambio.
- Dashboard: Desde el administrador se puede ver la lista de usuarios suscritos a notificaciones y el detalle de los productos a los que está suscrito.

## Empezando

### Dependencias

### Prerequisitos

Es necesario tener instalada la cli de Shopify.

```sh
npm install -g @shopify/cli
```

### Configuración

- Clonar este repositorio

```sh
git clone https://github.com/MarlonPerez-01/price-tracker.git
```

### Configuración

- Navegar al directorio del proyecto

- Ejecutar `npm install` o `npm i` para la instalación de dependencias.

- Ejecutar `shopify app dev --reset` para iniciar la aplicación en desarrollo.
- Iniciar sesión en shopify al presionar cualquier tecla si no se ha iniciado sesión (abre un enlace en el navegador)
- Asignar nombre a la aplicación, Ej. price-tracker
- Asignar nombre a fichero de configuración, Ej, price-tracker
- Actualizar archivo actual de configuración o crear uno nuevo
- Seleccionar actualizar url automáticamente en modo preview
- Terminar proceso de la consola
- En archivo .toml agregar en propiedad scopes "read_products,write_products"
- Ejecutar `npx prisma migrate dev` para ejecutar las migraciones
- Ejecutar `shopify app deploy` para actualizar los scopes
- Ejecutar `shopify app dev` para iniciar la aplicación
- Abrir enlace que aparece en la consola como "Preview URL"
- Instalar la aplicación
- Será redireccionado al dashboard de la aplicación, se encuentra en el grupo "apps"
- Para agregar el theme extension se debe ir al editor del tema y agregar en el template producto la aplicación y asignar "application_url" del fichero .toml en el campo "Endpoint de suscripción"

### Tecnologías:

- [Typescript](https://www.typescriptlang.org/) - TypeScript es un lenguaje de programación fuertemente tipado basado en JavaScript que permite a los desarrolladores escribir código de manera más legible y mantener el código limpio.
- [Node.js](https://nodejs.org/) - Node.js es un entorno de ejecución de JavaScript que se ejecuta en un entorno
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli): Se utiliza para crear la aplicación Shopify y generar el código base.
- [Remix](https://remix.run/): Se utiliza como marco para la interfaz de usuario de la aplicación.
- [Shopify Polaris](https://polaris.shopify.com/): Se utiliza para crear componentes de interfaz de usuario conformes a las directrices de diseño de Shopify.
- [Webhooks de Shopify](https://shopify.dev/docs/apps/webhooks): Se utilizan para monitorear los cambios de precio del producto.
- [Nodemailer](https://www.nodemailer.com/): Se utiliza para enviar notificaciones por correo electrónico.
- [Prettier](https://prettier.io/) - Un formateador de código obstinado.
  Pasos para la implementación:
