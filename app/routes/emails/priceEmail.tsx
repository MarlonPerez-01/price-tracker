import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

type PriceEmailProps = {
    user: { name: string; email: string };
    product: { name: string; previousPrice: number; currentPrice: number };
};

export function PriceEmail({ user, product }: PriceEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>El precio del producto ha cambiado</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={paragraphContent}>
                        <Hr style={hr} />
                        <Text style={heading}>AVISO DE NUEVO PRECIO</Text>
                        <Text style={paragraph}>¡Hola {user.name}!,</Text>
                        <Text style={paragraph}>
                            El precio del producto <b>{product.name}</b> ha
                            cambiado de{' '}
                            <b>${product.previousPrice.toFixed(2)}</b> a{' '}
                            <b>${product.currentPrice.toFixed(2)}</b>.
                        </Text>
                    </Section>

                    <Section style={paragraphContent}>
                        <Text style={paragraph}>
                            Si tienes alguna pregunta, no dudes en ponerte en
                            contacto con nosotros.
                        </Text>
                        <Text style={{ ...paragraph, fontSize: '18px' }}>
                            Equipo de Shopify
                        </Text>
                    </Section>

                    <Section style={{ ...paragraphContent, paddingBottom: 30 }}>
                        <Text
                            style={{
                                ...paragraph,
                                fontSize: '12px',
                                textAlign: 'center',
                                marginBottom: 0,
                            }}
                        >
                            {new Date().getFullYear()} Shopify
                        </Text>
                        <Text
                            style={{
                                ...paragraph,
                                fontSize: '12px',
                                textAlign: 'center',
                                margin: 0,
                            }}
                        >
                            Has recibido este correo electrónico porque estás
                            suscrito a las notificaciones de cambio de precio.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#dbddde',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '30px auto',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
};

const heading = {
    fontSize: '14px',
    lineHeight: '26px',
    fontWeight: '700',
    color: '#95BF47',
};

const paragraphContent = {
    padding: '0 40px',
};

const paragraph = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#3c4043',
};

const hr = {
    borderColor: '#e8eaed',
    margin: '20px 0',
};
