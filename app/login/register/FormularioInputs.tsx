"use client";

import React, { useState } from 'react';
import {
  TextInput,
  Paper,
  Title,
  Container,
  Group,
  Button,
  SegmentedControl,
  PasswordInput,
  Loader,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import classes from './FormularioInput.module.css';

const BACK_API = process.env.NEXT_PUBLIC_BACK_API||"";

interface FormValues {
  correo: string;
  nombre: string;
  apellido: string;
  estado: string;
  rol: string;
  contra: string;
}

export function Formulario() {
  const [loading, setLoading] = useState(false); // Loading state
  const [success, setSuccess] = useState(false); // Success state
  const form = useForm<FormValues>({
    initialValues: {
      correo: '',
      nombre: '',
      apellido: '',
      estado: 'activo',
      rol: 'voluntario',
      contra: '',
    },
    validate: {
      correo: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      contra: (value) => {
        if (value.length <= 10) {
          return 'Tiene que tener más de 10 caracteres';
        }
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);

        if (!hasLetter) return 'Debe incluir al menos una letra';
        if (!hasNumber) return 'Debe incluir al menos un número';

        return null;
      },
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(`${BACK_API}/usuario-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSuccess(true); // Set success state
      } else {
        console.error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Container size={420} my={40} className={classes.container}>
      <Title ta="center" className={classes.title}>
        Ingrese sus datos
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={classes.formBox}>
        {success ? (
          <>
            <Alert title="Success!" color="green" radius="md">
              Usuario creado correctamente!
            </Alert>
            <Button fullWidth mt="xl" onClick={() => (window.location.href = '/login')}>
              Avanzar
            </Button>
          </>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              withAsterisk
              label="Email"
              placeholder="santiago@gmail.com"
              {...form.getInputProps('correo')}
              className={classes.input}
            />

            <TextInput
              withAsterisk
              label="Nombres"
              placeholder="Santiago"
              {...form.getInputProps('nombre')}
              className={classes.input}
            />

            <TextInput
              withAsterisk
              label="Apellidos"
              placeholder="Zavala Somocurcio"
              {...form.getInputProps('apellido')}
              className={classes.input}
            />

            <label className={classes.label} htmlFor="rol-segmented-control">
              Rol
            </label>
            <SegmentedControl
              id="rol-segmented-control"
              data={[
                { label: 'Voluntario', value: 'voluntario' },
                { label: 'Adoptante', value: 'adoptante' },
              ]}
              {...form.getInputProps('rol')}
              className={classes.input}
              fullWidth
              mt="xs"
            />

            <PasswordInput
              withAsterisk
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              {...form.getInputProps('contra')}
              className={classes.input}
              mt="md"
              visibilityToggleIcon={({ reveal }) =>
                reveal ? (
                  <span role="img" aria-label="show">
                    👁️
                  </span>
                ) : (
                  <span role="img" aria-label="hide">
                    👁️‍🗨️
                  </span>
                )
              }
            />

            <Group className={classes.buttonGroup}>
              <Button type="submit" fullWidth mt="xl" disabled={loading}>
                {loading ? <Loader size="sm" color="white" /> : 'Submit'}
              </Button>
            </Group>
          </form>
        )}
      </Paper>
    </Container>
  );
}
