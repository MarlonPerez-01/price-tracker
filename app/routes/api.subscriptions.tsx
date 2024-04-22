import { json } from '@remix-run/node';
import db from '../db.server';
import { cors } from 'remix-utils/cors';

// @ts-ignore
export async function action({ request }) {
    // Se obtienen los datos del request
    let data = await request.json();

    // Se extraen los datos necesarios
    const name = data.name;
    const email = data.email;
    const product = data.product;
    const { id: productId, name: productName, price: productPrice } = product;

    // Se verifica que todos los datos necesarios estén presentes
    if (!name || !email || !productId || !productName || !productPrice) {
        return await cors(
            request,
            json(
                {
                    message:
                        'Faltan datos. Datos requeridos: nombre, email, productId, productName, productPrice',
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

        // Se busca el producto por id
        let product = await db.product.findUnique({
            where: { id: productId },
        });

        // Si el producto no existe, se crea
        if (!product) {
            product = await db.product.create({
                data: {
                    id: productId,
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
            origin: '*',
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
                { message: 'Falló la creación de la suscripción.', error },
                { status: 500 },
            ),
            {
                origin: '*',
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type'],
                credentials: false,
                maxAge: 0,
            },
        );
    }
}
