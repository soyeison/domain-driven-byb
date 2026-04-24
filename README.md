# Domain driven byb

## Gestion de estados de proyecto, torre y apartamento

La gestion de estados de estos 3 elemento se hace por medio del agregado del proyecto. Para activar un proyecto este se debio previamente enlazar a un Erp y se le debe agregar contenido del CMS. Cuando el proyecto se crea inicialmente, se deja en estado `LAUNCH`. Cuando se le enlaza un id en un ERP ya sea Sinco o Nova, entonces pasa a estado `PENDING_CMS_CONTENT`. Una vez que ya tenga ambas cosas entonces es posible pasarlo a estado `ACTIVE`.

Para activar una torre, primero se instancia, agregandole una torre con una referencia a un ERP y su id alli. Debe ser el mismo ERP. Cuando ya esta agregada a la torre, es posible activarla. Para activarla NO es necesario que el proyecto este activo.

Para activar un apartamento, se agrega el apartamento a la torre y luego se ejecuta el método "activate" de esta manera es posible activar o desactivar un apartamento.

Esto no implica que activarlo va a permitir mostrarlo en la tienda. Lo que permite es que un administrador pueda preparar todo antes de publicar todo en la tienda. La unica forma de que un apartamento se pueda ver en la tienda es que el proyecto este activo, la torre este activa y el apartamento este activo. En caso contrario no sera posible verlo en la tienda. Para este proposito esta el método `isApartmentMarketable`.
