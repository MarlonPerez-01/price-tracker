import { json } from '@remix-run/node';
import db from '../db.server';
import { cors } from 'remix-utils/cors';

//@ts-ignore
export async function action({ request }) {
    // Se obtienen los datos del request
    let data = await request.json();

    // Se extraen los datos necesarios
    const name = data.name;
    const email = data.email;
    const product = data.product;
    let { id: productId, name: productName, price: productPrice } = product;
    productPrice = productPrice / 100; // El precio se recibe en centavos

    // Se verifica que todos los datos necesarios estén presentes
    // Verifica que el nombre esté presente y sea una cadena
    if (!name || typeof name !== 'string') {
        return await cors(
            request,
            json(
                {
                    message: 'Falta el nombre o no es un string válido.',
                },
                { status: 400 },
            ),
        );
    }

    // Verifica que el email esté presente, sea una cadena y tenga un formato válido
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
        return await cors(
            request,
            json(
                {
                    message:
                        'Falta el email, no es un string válido o no tiene un formato válido.',
                },
                { status: 400 },
            ),
        );
    }

    // Verifica que el productId esté presente
    if (!productId) {
        return await cors(
            request,
            json(
                {
                    message: 'Falta el productId o no es un string válido.',
                },
                { status: 400 },
            ),
        );
    }

    // Verifica que el productName esté presente y sea un string
    if (!productName || typeof productName !== 'string') {
        return await cors(
            request,
            json(
                {
                    message: 'Falta el productName o no es un string válido.',
                },
                { status: 400 },
            ),
        );
    }

    // Verifica que el productPrice esté presente y sea un número
    if (!productPrice || typeof productPrice !== 'number') {
        return await cors(
            request,
            json(
                {
                    message: 'Falta el productPrice o no es un número válido.',
                },
                { status: 400 },
            ),
        );
    }

    try {
        // Se busca al usuario por email
        let user = await db.user.findUnique({
            where: { email },
        });

        // Si el usuario no existe, se crea
        if (!user) {
            user = await db.user.create({
                data: { email, name },
            });
        }

        // Se busca el producto por id de Shopify
        let product = await db.product.findUnique({
            where: { idShopify: productId.toString() },
        });

        // Si el producto no existe, se crea
        if (!product) {
            product = await db.product.create({
                data: {
                    idShopify: productId.toString(),
                    name: productName,
                    currentPrice: productPrice,
                },
            });
        }

        // Se verifica si ya existe una suscripción para el usuario y el producto
        const existingSubscription = await db.subscription.findFirst({
            where: {
                userId: user.id,
                productId: product.id,
            },
        });

        // Si la suscripción ya existe, se retorna un mensaje indicando que ya está suscrito
        if (existingSubscription) {
            return await cors(
                request,
                json(
                    {
                        message: 'Ya estás suscrito a este producto.',
                    },
                    { status: 400 },
                ),
            );
        }

        // Si la suscripción no existe, se crea
        const subscription = await db.subscription.create({
            data: {
                userId: user.id,
                productId: product.id,
            },
        });

        // Se retorna mensaje de éxito junto con la suscripción creada
        const response = json({
            message: '¡Suscripción creada con éxito!',
            data: subscription,
        });

        return await cors(request, response, {
            origin: '*', // FIXME: Cambiar a la URL de la app en producción
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type'],
            credentials: false,
            maxAge: 0,
        });
    } catch (error) {
        // Si ocurre un error, se hace log y se retorna un mensaje de error
        console.error(error);
        return await cors(
            request,
            json(
                { message: 'Falló la creación de la suscripción.' },
                { status: 500 },
            ),
            {
                origin: '*', // FIXME: Cambiar a la URL de la app en producción
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type'],
                credentials: false,
                maxAge: 0,
            },
        );
    }
}
