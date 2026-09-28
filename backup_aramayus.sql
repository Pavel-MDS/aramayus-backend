--
-- PostgreSQL database dump
--

\restrict mb8XnAuQc7xkm8wG7xRLbumwYBMoXcOdockByBZXx7lKYrPhuaKsxtHcedRg0v0

-- Dumped from database version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: estado_pago; Type: TYPE; Schema: public; Owner: aramayus_user
--

CREATE TYPE public.estado_pago AS ENUM (
    'pendiente',
    'completado',
    'fallido',
    'reembolsado'
);


ALTER TYPE public.estado_pago OWNER TO aramayus_user;

--
-- Name: estado_pedido; Type: TYPE; Schema: public; Owner: aramayus_user
--

CREATE TYPE public.estado_pedido AS ENUM (
    'pendiente',
    'pagado',
    'enviado',
    'entregado',
    'cancelado'
);


ALTER TYPE public.estado_pedido OWNER TO aramayus_user;

--
-- Name: metodo_pago; Type: TYPE; Schema: public; Owner: aramayus_user
--

CREATE TYPE public.metodo_pago AS ENUM (
    'stripe',
    'paypal'
);


ALTER TYPE public.metodo_pago OWNER TO aramayus_user;

--
-- Name: rol_usuario; Type: TYPE; Schema: public; Owner: aramayus_user
--

CREATE TYPE public.rol_usuario AS ENUM (
    'admin',
    'cliente'
);


ALTER TYPE public.rol_usuario OWNER TO aramayus_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: carrito_items; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.carrito_items (
    id integer NOT NULL,
    usuario_id uuid,
    producto_id uuid,
    talla character varying(5),
    color character varying(50),
    cantidad integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT carrito_items_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.carrito_items OWNER TO aramayus_user;

--
-- Name: carrito_items_id_seq; Type: SEQUENCE; Schema: public; Owner: aramayus_user
--

CREATE SEQUENCE public.carrito_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_items_id_seq OWNER TO aramayus_user;

--
-- Name: carrito_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aramayus_user
--

ALTER SEQUENCE public.carrito_items_id_seq OWNED BY public.carrito_items.id;


--
-- Name: inventario; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.inventario (
    id integer NOT NULL,
    producto_id uuid,
    talla character varying(5) NOT NULL,
    color character varying(50),
    stock integer DEFAULT 0 NOT NULL,
    CONSTRAINT inventario_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.inventario OWNER TO aramayus_user;

--
-- Name: inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: aramayus_user
--

CREATE SEQUENCE public.inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventario_id_seq OWNER TO aramayus_user;

--
-- Name: inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aramayus_user
--

ALTER SEQUENCE public.inventario_id_seq OWNED BY public.inventario.id;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.pagos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    pedido_id uuid,
    metodo public.metodo_pago DEFAULT 'stripe'::public.metodo_pago NOT NULL,
    referencia_externa text,
    monto numeric(10,2) NOT NULL,
    estado public.estado_pago DEFAULT 'pendiente'::public.estado_pago,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pagos OWNER TO aramayus_user;

--
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.pedido_items (
    id integer NOT NULL,
    pedido_id uuid,
    producto_id uuid,
    nombre_producto character varying(200),
    talla character varying(5),
    color character varying(50),
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    CONSTRAINT pedido_items_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.pedido_items OWNER TO aramayus_user;

--
-- Name: pedido_items_id_seq; Type: SEQUENCE; Schema: public; Owner: aramayus_user
--

CREATE SEQUENCE public.pedido_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_items_id_seq OWNER TO aramayus_user;

--
-- Name: pedido_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aramayus_user
--

ALTER SEQUENCE public.pedido_items_id_seq OWNED BY public.pedido_items.id;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.pedidos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    usuario_id uuid,
    subtotal numeric(10,2) NOT NULL,
    envio numeric(10,2) DEFAULT 0 NOT NULL,
    igv numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    estado public.estado_pedido DEFAULT 'pendiente'::public.estado_pedido,
    direccion_envio jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pedidos OWNER TO aramayus_user;

--
-- Name: producto_imagenes; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.producto_imagenes (
    id integer NOT NULL,
    producto_id uuid,
    url text NOT NULL,
    es_principal boolean DEFAULT false
);


ALTER TABLE public.producto_imagenes OWNER TO aramayus_user;

--
-- Name: producto_imagenes_id_seq; Type: SEQUENCE; Schema: public; Owner: aramayus_user
--

CREATE SEQUENCE public.producto_imagenes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_imagenes_id_seq OWNER TO aramayus_user;

--
-- Name: producto_imagenes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aramayus_user
--

ALTER SEQUENCE public.producto_imagenes_id_seq OWNED BY public.producto_imagenes.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.productos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(200) NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    precio_oferta numeric(10,2),
    categoria character varying(100),
    destacado boolean DEFAULT false,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    tipo character varying(50),
    CONSTRAINT productos_precio_check CHECK ((precio > (0)::numeric))
);


ALTER TABLE public.productos OWNER TO aramayus_user;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: aramayus_user
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    rol public.rol_usuario DEFAULT 'cliente'::public.rol_usuario,
    altura numeric(5,1),
    peso numeric(5,1),
    pecho numeric(5,1),
    cintura numeric(5,1),
    cadera numeric(5,1),
    hombros numeric(5,1),
    talla_usual character varying(5),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.usuarios OWNER TO aramayus_user;

--
-- Name: carrito_items id; Type: DEFAULT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.carrito_items ALTER COLUMN id SET DEFAULT nextval('public.carrito_items_id_seq'::regclass);


--
-- Name: inventario id; Type: DEFAULT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.inventario ALTER COLUMN id SET DEFAULT nextval('public.inventario_id_seq'::regclass);


--
-- Name: pedido_items id; Type: DEFAULT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pedido_items ALTER COLUMN id SET DEFAULT nextval('public.pedido_items_id_seq'::regclass);


--
-- Name: producto_imagenes id; Type: DEFAULT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.producto_imagenes ALTER COLUMN id SET DEFAULT nextval('public.producto_imagenes_id_seq'::regclass);


--
-- Data for Name: carrito_items; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.carrito_items (id, usuario_id, producto_id, talla, color, cantidad, created_at) FROM stdin;
\.


--
-- Data for Name: inventario; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.inventario (id, producto_id, talla, color, stock) FROM stdin;
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.pagos (id, pedido_id, metodo, referencia_externa, monto, estado, created_at) FROM stdin;
78a917b5-820a-4e85-9639-b2dd28c3af1f	2c8d87df-52ce-4ba7-b933-cef9c956379d	stripe	cs_test_b1vAjVDzgUJoHExdIUvoE9PrmeQKZSIeEcYpirRxm11m8D5nM9iJrhP9Jg	1016.20	pendiente	2026-09-16 10:35:21.95266
e83b4797-8780-492f-8528-51b686a9b409	2c8d87df-52ce-4ba7-b933-cef9c956379d	stripe	cs_test_b1Sq7rUmaez41jgDZ8lNcw7lTRPGL1zRcSB6kuE2728Vwhl4yexNksMggq	1016.20	completado	2026-09-16 18:24:12.013527
5a4e0cd7-0e0e-4b62-a100-59f2906b36e8	871ff71f-8bf5-47b1-a483-be75181fe167	stripe	cs_test_b18OTXols1PlPhe7kmVaJ1tpCaMYHeX9BwdcXuv5yhwNSpBOXWQuOs9qZU	1016.20	reembolsado	2026-09-17 11:07:40.029407
\.


--
-- Data for Name: pedido_items; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.pedido_items (id, pedido_id, producto_id, nombre_producto, talla, color, cantidad, precio_unitario) FROM stdin;
1	f96b125d-a0e6-4069-b423-29ac07988deb	bc3c753a-82f4-4fde-88c3-eb33b58a952e	Chompa Qhata	M	\N	2	420.00
2	2c8d87df-52ce-4ba7-b933-cef9c956379d	bc3c753a-82f4-4fde-88c3-eb33b58a952e	Chompa Qhata	M	\N	2	420.00
3	871ff71f-8bf5-47b1-a483-be75181fe167	bc3c753a-82f4-4fde-88c3-eb33b58a952e	Chompa Qhata	M	\N	2	420.00
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.pedidos (id, usuario_id, subtotal, envio, igv, total, estado, direccion_envio, created_at, updated_at) FROM stdin;
f96b125d-a0e6-4069-b423-29ac07988deb	ba8bb012-f50a-40f5-8204-8796239109c5	840.00	25.00	151.20	1016.20	pendiente	\N	2026-09-15 21:55:09.3885	2026-09-15 21:55:09.3885
2c8d87df-52ce-4ba7-b933-cef9c956379d	ba8bb012-f50a-40f5-8204-8796239109c5	840.00	25.00	151.20	1016.20	pagado	\N	2026-09-16 10:32:29.064339	2026-09-16 18:27:10.801383
871ff71f-8bf5-47b1-a483-be75181fe167	ba8bb012-f50a-40f5-8204-8796239109c5	840.00	25.00	151.20	1016.20	cancelado	\N	2026-09-17 11:06:00.439628	2026-09-17 11:16:55.563429
\.


--
-- Data for Name: producto_imagenes; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.producto_imagenes (id, producto_id, url, es_principal) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.productos (id, nombre, descripcion, precio, precio_oferta, categoria, destacado, activo, created_at, updated_at, tipo) FROM stdin;
bc3c753a-82f4-4fde-88c3-eb33b58a952e	Chompa Qhata	Tejido a mano con fibra de alpaca cusqueña	420.00	\N	Hombre	t	t	2026-09-15 21:53:00.919448	2026-09-15 21:53:00.919448	Chompa
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: aramayus_user
--

COPY public.usuarios (id, nombre, email, password_hash, rol, altura, peso, pecho, cintura, cadera, hombros, talla_usual, created_at, updated_at) FROM stdin;
bb89e54b-ec70-4138-8ece-61a632fb22f7	Prueba Sustentacion	prueba@aramayus.com	$2a$10$bhS4wY0tgKlM8l2XSJe0h.Gp2JWB4lz7fvTMYa4uU/pqZUQCUJnkm	cliente	\N	\N	\N	\N	\N	\N	\N	2026-08-25 15:48:54.673367	2026-08-25 15:48:54.673367
ba8bb012-f50a-40f5-8204-8796239109c5	Ana Quispe	ana.quispe@aramayus.com	$2a$10$56gAr2WIUAFkEdWqbr9LAOVrt5iE9GncZb6.0tE0u4Z9jPclFmQ8m	admin	\N	\N	\N	\N	\N	\N	\N	2026-08-26 19:42:35.029474	2026-08-26 19:42:35.029474
\.


--
-- Name: carrito_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aramayus_user
--

SELECT pg_catalog.setval('public.carrito_items_id_seq', 3, true);


--
-- Name: inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aramayus_user
--

SELECT pg_catalog.setval('public.inventario_id_seq', 1, false);


--
-- Name: pedido_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aramayus_user
--

SELECT pg_catalog.setval('public.pedido_items_id_seq', 3, true);


--
-- Name: producto_imagenes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aramayus_user
--

SELECT pg_catalog.setval('public.producto_imagenes_id_seq', 1, false);


--
-- Name: carrito_items carrito_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_pkey PRIMARY KEY (id);


--
-- Name: carrito_items carrito_items_usuario_id_producto_id_talla_color_key; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_usuario_id_producto_id_talla_color_key UNIQUE (usuario_id, producto_id, talla, color);


--
-- Name: inventario inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_pkey PRIMARY KEY (id);


--
-- Name: inventario inventario_producto_id_talla_color_key; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_producto_id_talla_color_key UNIQUE (producto_id, talla, color);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: pedido_items pedido_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pkey PRIMARY KEY (id);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- Name: producto_imagenes producto_imagenes_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT producto_imagenes_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_carrito_usuario; Type: INDEX; Schema: public; Owner: aramayus_user
--

CREATE INDEX idx_carrito_usuario ON public.carrito_items USING btree (usuario_id);


--
-- Name: idx_inventario_producto; Type: INDEX; Schema: public; Owner: aramayus_user
--

CREATE INDEX idx_inventario_producto ON public.inventario USING btree (producto_id);


--
-- Name: idx_pagos_pedido; Type: INDEX; Schema: public; Owner: aramayus_user
--

CREATE INDEX idx_pagos_pedido ON public.pagos USING btree (pedido_id);


--
-- Name: idx_pedido_items_pedido; Type: INDEX; Schema: public; Owner: aramayus_user
--

CREATE INDEX idx_pedido_items_pedido ON public.pedido_items USING btree (pedido_id);


--
-- Name: idx_pedidos_usuario; Type: INDEX; Schema: public; Owner: aramayus_user
--

CREATE INDEX idx_pedidos_usuario ON public.pedidos USING btree (usuario_id);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: aramayus_user
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: carrito_items carrito_items_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: carrito_items carrito_items_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.carrito_items
    ADD CONSTRAINT carrito_items_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: inventario inventario_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.inventario
    ADD CONSTRAINT inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: pagos pagos_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- Name: pedido_items pedido_items_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: pedidos pedidos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: producto_imagenes producto_imagenes_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aramayus_user
--

ALTER TABLE ONLY public.producto_imagenes
    ADD CONSTRAINT producto_imagenes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO aramayus_user;


--
-- PostgreSQL database dump complete
--

\unrestrict mb8XnAuQc7xkm8wG7xRLbumwYBMoXcOdockByBZXx7lKYrPhuaKsxtHcedRg0v0

