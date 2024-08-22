import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Badge, Table, Group, Text, Button, Modal } from '@mantine/core';
import jwt from 'jsonwebtoken';

const BACK_API = process.env.NEXT_PUBLIC_BACK_API || "";

interface DecodedToken {
  user_id: BigInteger;
  rol: string;
}

interface Animal {
  id: BigInteger;
  avatar?: string;
  nombre: string;
  edad: string;
  raza: string;
  tipo: string;
  estado: string;
}

const tipoColors: Record<string, string> = {
  perro: 'blue',
  gato: 'green',
};

const dogImageUrl = 'https://images.unsplash.com/photo-1558788353-f76d92427f16';
const catImageUrl = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131';

export function Adoptante() {
  const [data, setData] = useState<Animal[]>([]);
  const [opened, setOpened] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const hasFetched = useRef(false);

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/get-token', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = '/login'; 
        return null;
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await fetchToken();
    if (!token) {
      console.error('No token found');
      return null;
    }

    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        window.location.href = '/login'; 
        return null;
      }

      return response;
    } catch (error) {
      console.error('Error during fetch:', error);
      return null;
    }
  };

  const fetchData = async () => {
    const response = await fetchWithAuth(`${BACK_API}/animal-list`, {
      method: 'POST',
    });

    if (!response) return;

    try {
      const result = await response.json();

      const updatedData = result.map((item: Animal) => ({
        ...item,
        avatar: item.tipo.toLowerCase() === 'perro' ? dogImageUrl : catImageUrl,
      }));

      setData(updatedData);
      hasFetched.current = true;
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    fetchData();
  }, []);

  const handleAdoptClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setOpened(true);
  };

  const handleAdoptConfirm = async () => {
    if (selectedAnimal) {
      const token = await fetchToken();

      if (!token) {
        console.error('No token found');
        return;
      }

      const decoded = jwt.decode(token) as DecodedToken | null;

      if (!decoded || !decoded.user_id) {
        console.error('Failed to decode token');
        return;
      }

      const response = await fetchWithAuth(`${BACK_API}/adopcion-creacion-edicion-animal`, {
        method: 'POST',
        body: JSON.stringify({
          animal: selectedAnimal.id,
          adoptante: decoded.user_id,  // Include adoptante field from decoded JWT
          estado: 'en_proceso',
        }),
      });

      if (!response) return;

      if (response.status === 201) {
        console.log("Adoption in process");
        setOpened(false);
        setSuccessOpened(true);
        
        await fetchData();
      
      } else {
        console.error('Failed to adopt');
      }
    }
  };

  const formatEstado = (estado: string) => {
    return estado
      .replace(/_/g, ' ') 
      .replace(/\b\w/g, char => char.toUpperCase()); 
  };

  const rows = data.map((item) => (
    <Table.Tr key={item.nombre}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} src={item.avatar} radius={30} />
          <Text fz="sm" fw={500}>
            {item.nombre}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge color={tipoColors[item.tipo.toLowerCase()]} variant="light">
          {item.tipo}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{item.edad}</Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{item.raza}</Text>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{formatEstado(item.estado)}</Text>
      </Table.Td>

      <Table.Td>
        <Button 
          variant="light" 
          color="blue" 
          fullWidth 
          onClick={() => handleAdoptClick(item)}
          disabled={item.estado !== 'espera_de_adopcion'}
        >
          Adoptar
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Edad</Table.Th>
              <Table.Th>Raza</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Confirmar Adopción"
      >
        <Text>¿Estás seguro que deseas adoptar a {selectedAnimal?.nombre}?</Text>
        <Group justify="space-between" mt="md">
          <Button color="red" onClick={() => setOpened(false)}>
            No
          </Button>
          <Button color="green" onClick={handleAdoptConfirm}>
            Sí
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={successOpened}
        onClose={() => setSuccessOpened(false)}
        title={<Text color="green" fw={550}>Adopción en Proceso!</Text>} 
      >
        <Text>Un voluntario revisará la información. {selectedAnimal?.nombre} te espera!</Text>
        <Button fullWidth mt="md" onClick={() => setSuccessOpened(false)}>
          Cerrar
        </Button>
      </Modal>
    </>
  );
}
