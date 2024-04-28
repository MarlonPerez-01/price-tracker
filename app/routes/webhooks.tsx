import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import db from '../db.server';
import { PriceEmail } from '~/routes/emails/priceEmail';
import { render } from '@react-email/components';
import { json } from '@remix-run/react';
import nodemailer from 'nodemailer';

export const action = async ({ request }: ActionFunctionArgs) => {
    const { topic, shop, session, admin, payload } =
        await authenticate.webhook(request);

    if (!admin) {
        // The admin context isn't returned if the webhook fired after a shop was uninstalled.
        throw new Response();
    }

    switch (topic) {
        case 'PRODUCTS_UPDATE':
            console.log('PRODUCTS_UPDATE');
            console.log(payload);

            // Se extrae el id y el precio del producto del payload
            const productId = payload.id;
            const productPrice = payload.variants[0].price;

            // Se busca el producto en la base de datos
            let product = await db.product.findUnique({
                where: { idShopify: productId.toString() },
            });

            if (!product) {
                break;
            }

            const currentPriceDb = product.currentPrice.toNumber();
            const productPriceShopify = Number(productPrice);

            if (currentPriceDb === productPriceShopify) {
                console.info('El precio no ha cambiado');
                break;
            }

            // Si el producto existe y el precio ha cambiado, se actualiza el precio en la base de datos
            product = await db.product.update({
                where: { idShopify: productId.toString() },
                data: { currentPrice: productPrice },
            });

            // Se incrementa notificationCount en la tabla Subscription para el producto
            const subscriptions = await db.subscription.updateMany({
                where: { productId: product.id },
                data: { notificationCount: { increment: 1 } },
            });

            console.log('suscripciones', subscriptions);

            // Se buscan los usuarios suscritos a cambio de precio del producto actual
            const users = await db.user.findMany({
                where: {
                    Subscription: { some: { productId: product.id } },
                },
            });

            const transporter = nodemailer.createTransport({
                port: 465,
                host: 'smtp.gmail.com',
                auth: {
                    user: 'marlonhurtado876@gmail.com',
                    pass: 'adtaoyzmzwfgnufu',
                },
                secure: true,
            });

            // Se notifica a los usuarios sobre el cambio de precio
            for (const user of users) {
                console.log(
                    `Usuario con email ${user.email} notificado sobre cambio de precio para el producto ${product.name} con precio de $${productPrice}`,
                );

                try {
                    const info = await transporter.sendMail({
                        from: 'marlonhurtado876@gmail.com',
                        to: user.email,
                        subject: '¡El precio de un producto ha cambiado!',
                        html: render(
                            <PriceEmail
                                user={{
                                    name: user.name,
                                    email: user.email,
                                }}
                                product={{
                                    name: product.name,
                                    previousPrice: currentPriceDb,
                                    currentPrice: productPriceShopify,
                                }}
                            />,
                        ),
                    });

                    console.log('Correo enviado', info);
                    json({ message: 'Correo enviado' }, 200);
                } catch (error) {
                    console.error('Error al enviar el correo', error);
                    json({ error }, 400);
                }
            }

            break;

        case 'APP_UNINSTALLED':
            if (session) {
                await db.session.deleteMany({ where: { shop } });
            }
            break;
        case 'CUSTOMERS_DATA_REQUEST':
        case 'CUSTOMERS_REDACT':
        case 'SHOP_REDACT':
        default:
            throw new Response('Unhandled webhook topic', { status: 404 });
    }

    throw new Response();
};
