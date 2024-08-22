"use client";

import React, { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import classes from './AuthenticationTitle.module.css';
import jwt, { JwtPayload } from 'jsonwebtoken';

const BACK_API = process.env.NEXT_PUBLIC_BACK_API||"";


interface DecodedToken extends JwtPayload {
  rol?: string; // Assuming 'rol' might be optional
}

interface FormValues {
  correo: string;
  contra: string;
}

export function AuthenticationTitle() {
  const [loading, setLoading] = useState(false); // Add loading state
  const form = useForm<FormValues>({
    initialValues: {
      correo: '',
      contra: '',
    },
    validate: {
      correo: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      contra: (value) => (value.length > 6 ? null : 'Password must be at least 6 characters long'),
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true); // Start loading
    console.log(BACK_API);
    try {
      const response = await fetch(`${BACK_API}/usuario-validar-contra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json(); // Assuming the token is in the response body
        const token = data.access;

        const decodedToken = jwt.decode(token) as DecodedToken | null;

        if (decodedToken == null) {
          form.setErrors({ correo: 'Something went wrong. Please try again later.' });
          setLoading(false); // Stop loading
          return;
        }

        await fetch('/api/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        });

        // Redirect based on role
        window.location.href = `/${decodedToken.rol}`;
      } else {
        form.setErrors({ correo: 'Invalid email or password' });
      }
    } catch (error) {
      form.setErrors({ correo: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Hola de nuevo!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        No tienes cuenta aún?{' '}
        <Anchor size="sm" href="/login/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@mantine.derteev"
            {...form.getInputProps('correo')}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('contra')}
            required
            mt="md"
          />
          <Button fullWidth mt="xl" type="submit" disabled={loading}>
            {loading ? <Loader size="sm" color="white" /> : 'Sign in'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
