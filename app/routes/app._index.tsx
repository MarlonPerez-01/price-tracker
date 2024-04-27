import { Button, DataTable, Link, Modal, Page } from '@shopify/polaris';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from '../shopify.server';
import db from '../db.server';
import { useCallback, useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    let users: any = await db.user.findMany({
        select: {
            name: true,
            email: true,
            createdAt: true,
            Subscription: {
                select: {
                    notificationCount: true,
                    startDate: true,
                    Product: {
                        select: {
                            name: true,
                            currentPrice: true,
                        },
                    },
                },
            },
        },
    });

    users = users.map((user: any) => ({
        ...user,
        totalNotifications: user.Subscription.reduce(
            (total: any, sub: { notificationCount: any }) =>
                total + sub.notificationCount,
            0,
        ),
        createdAt: new Date(user.createdAt),
        name:
            user.name.charAt(0).toUpperCase() +
            user.name.slice(1).toLowerCase(),
        subscriptions: user.Subscription.map((sub: any) => ({
            productName: sub.Product.name,
            price: sub.Product.currentPrice,
            notificationCount: sub.notificationCount,
            startDate: new Date(sub.startDate),
        })),
    }));

    return json(users);
};

export default function Index() {
    const initialUsers: any = useLoaderData();
    const [users, setUsers] = useState(initialUsers);
    const [active, setActive] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{
        [key: string]: any;
    } | null>(null);

    const toggleModalActive = useCallback(
        () => setActive((active) => !active),
        [],
    );

    // Calcula el total de notificaciones enviadas
    const totalNotifications = users.reduce(
        (total: number, user: { totalNotifications: number }) =>
            total + user.totalNotifications,
        0,
    );

    // Mapea los datos de los usuarios para mostrarlos en la tabla
    const rows = users.map((user: any) => [
        user.name,
        <Link key={user.email} url={`mailto:${user.email}`}>
            {user.email}
        </Link>,
        user.totalNotifications,
        new Date(user.createdAt).toLocaleDateString(),
        <Button
            key={user.email}
            onClick={() => {
                setSelectedUser(user);
                toggleModalActive();
            }}
        >
            Ver más
        </Button>,
    ]);

    const headings = [
        'Nombre',
        'Correo Electrónico',
        'Notificaciones Enviadas',
        'Fecha de Ingreso',
        'Acciones',
    ];

    // Ordena los registros por el total de notificaciones enviadas o por la fecha de ingreso
    const handleSort = (
        headingIndex: number,
        direction: 'ascending' | 'descending',
    ) => {
        const sortedUsers = [...users].sort((a, b) => {
            const valueA =
                headingIndex === 2
                    ? a.totalNotifications
                    : new Date(a.createdAt);
            const valueB =
                headingIndex === 2
                    ? b.totalNotifications
                    : new Date(b.createdAt);

            if (direction === 'ascending') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        setUsers(sortedUsers);
    };

    const boldStyle = { fontWeight: 'bold' };

    return (
        <Page>
            <DataTable
                columnContentTypes={['text', 'text', 'numeric', 'numeric']}
                headings={headings}
                rows={rows}
                totals={['', '', totalNotifications, '']}
                totalsName={{
                    singular: 'Total',
                    plural: 'Totales',
                }}
                showTotalsInFooter
                sortable={[false, false, true, true]}
                defaultSortDirection="ascending"
                initialSortColumnIndex={2}
                onSort={handleSort}
                increasedTableDensity
                hasZebraStripingOnData
                stickyHeader
                fixedFirstColumns={1}
            />
            <Modal
                open={active}
                onClose={toggleModalActive}
                title="Detalles de la suscripción"
                primaryAction={{
                    content: 'Cerrar',
                    onAction: toggleModalActive,
                }}
            >
                <Modal.Section>
                    {selectedUser && (
                        <div>
                            <h2 style={boldStyle}>Información del usuario</h2>
                            <p>
                                <span style={boldStyle}>Nombre: </span>
                                {selectedUser.name}
                            </p>
                            <p>
                                <span style={boldStyle}>
                                    Correo Electrónico:{' '}
                                </span>
                                {selectedUser.email}
                            </p>
                            <p>
                                <span style={boldStyle}>
                                    Fecha de Ingreso:{' '}
                                </span>
                                {new Date(
                                    selectedUser.createdAt,
                                ).toLocaleDateString()}
                            </p>
                            <p>
                                <span style={boldStyle}>
                                    Total de notificaciones:{' '}
                                </span>
                                {selectedUser.totalNotifications}
                            </p>
                            <h2 style={{ marginTop: 20, ...boldStyle }}>
                                Suscripciones activas
                            </h2>
                            <ul className="subscriptions">
                                {selectedUser.subscriptions.map(
                                    (sub: any, index: number) => (
                                        <li
                                            key={index}
                                            style={{ marginBottom: 15 }}
                                        >
                                            <p className="subscription-name">
                                                <span style={boldStyle}>
                                                    Nombre del producto:{' '}
                                                </span>
                                                {sub.productName}
                                            </p>
                                            <p>
                                                <span style={boldStyle}>
                                                    Precio actual:{' '}
                                                </span>
                                                ${Number(sub.price).toFixed(2)}
                                            </p>
                                            <p>
                                                <span style={boldStyle}>
                                                    Notificaciones enviadas:{' '}
                                                </span>
                                                {sub.notificationCount}
                                            </p>
                                            <p>
                                                <span style={boldStyle}>
                                                    Fecha de suscripción:{' '}
                                                </span>
                                                {new Date(
                                                    sub.startDate,
                                                ).toLocaleDateString()}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
                </Modal.Section>
            </Modal>
        </Page>
    );
}
