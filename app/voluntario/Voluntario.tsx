import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Table, Group, Text, Title, Container, Card, Space, Modal, Button } from '@mantine/core';
import jwt, {JwtPayload} from 'jsonwebtoken';

const BACK_API = process.env.NEXT_PUBLIC_BACK_API||"";

interface DecodedToken {
    user_id: BigInteger;
    rol: string;
  }
  

interface Adopcion {
  id: BigInteger;
  animal: string;
  adoptante: string;
  estado: string;
  voluntario: BigInteger | null; // New voluntario field
  voluntario_nombre: string | null;
  adoptante_nombre: string;
  animal_nombre:string
}

interface Animal {
  id: BigInteger;
  nombre: string;
  edad: string;
  raza: string;
  tipo: string;
  estado: string;
}

interface Adoptante {
  correo: string;
  nombre: string;
  apellido: string;
}

const adoptanteAvatars = [
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png',
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png',
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png',
  'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-4.png',
];

export function Voluntario() {
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [adoptantes, setAdoptantes] = useState<Adoptante[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedAdopcion, setSelectedAdopcion] = useState<Adopcion | null>(null);

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/get-token', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      return data.token; 
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  };

  const fetchData = async (endpoint: string, setState: React.Dispatch<React.SetStateAction<any>>) => {
    const token = await fetchToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`${BACK_API}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setState(result);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const handleAuthorizeClick = (adopcion: Adopcion) => {
    setSelectedAdopcion(adopcion);
    setModalOpened(true);
  };

  const handleAdopcionEdit = async () => {
    if (selectedAdopcion) {
      const token = await fetchToken();

      const decoded = jwt.decode(token) as DecodedToken | null;

      if (!token) {
        console.error('No token found');
        return;
      }

      try {
        const response = await fetch(`${BACK_API}/adopcion-update/${selectedAdopcion.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: 'finalizado',
            voluntario: decoded?.user_id
          }),
        });

        if (response.ok) {
          console.log('Adopcion autorizada');
          setModalOpened(false);
          fetchData('adopcion-list', setAdopciones); // Refresh the adopciones list
        } else {
          console.error('Failed to authorize adopcion');
        }
      } catch (error) {
        console.error('Error authorizing adopcion:', error);
      }
    }
  };

  useEffect(() => {
    fetchData('adopcion-list', setAdopciones);
    fetchData('animal-list', setAnimales);
    fetchData('adoptantes-list', setAdoptantes);
  }, []);

  const renderAdopciones = () => (
    <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
      <Title order={3} mb="md">Adopciones</Title>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Animal</Table.Th>
            <Table.Th>Adoptante</Table.Th>
            <Table.Th>Voluntario</Table.Th>
            <Table.Th>Estado</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {adopciones.map((adopcion) => (
            <Table.Tr key={adopcion.id.toString()}>
              <Table.Td>
                <Text fz="sm" fw={500}>
                  {adopcion.animal_nombre}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>
                  {adopcion.adoptante_nombre}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>
                  {adopcion.voluntario_nombre ? adopcion.voluntario_nombre.toString() : 'Por definir'}
                </Text>
              </Table.Td>
              <Table.Td>
                {adopcion.estado === 'en_proceso' ? (
                  <Badge
                    fz="sm"
                    color="blue"
                    variant="light"
                    style={{ cursor: 'pointer', backgroundColor: '#B3E5FC', color: '#0288D1' }} // Soft blue button style
                    onClick={() => handleAuthorizeClick(adopcion)}
                  >
                    {adopcion.estado.toUpperCase()}
                  </Badge>
                ) : (
                  <Badge color="green" variant="light" fz="sm">
                    {adopcion.estado.toUpperCase()}
                  </Badge>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );

  const renderAnimales = () => (
    <Card shadow="sm" p="lg" radius="md" withBorder mt="xl">
      <Title order={3} mb="md">Animales</Title>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Tipo</Table.Th>
            <Table.Th>Edad</Table.Th>
            <Table.Th>Raza</Table.Th>
            <Table.Th>Estado</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {animales.map((animal) => (
            <Table.Tr key={animal.id.toString()}>
              <Table.Td>
                <Group gap="sm">
                  <Avatar
                    size={30}
                    radius={30}
                    src={animal.tipo.toLowerCase() === 'perro' ? 'https://images.unsplash.com/photo-1558788353-f76d92427f16' : 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131'}
                  />
                  <Text fz="sm" fw={500}>
                    {animal.nombre}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>{animal.tipo.charAt(0).toUpperCase() + animal.tipo.slice(1)}</Text> {/* Capitalized Tipo */}
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>{animal.edad}</Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>{animal.raza}</Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={700}>{animal.estado}</Text> {/* Bold Estado */}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );

  const renderAdoptantes = () => (
    <Card shadow="sm" p="lg" radius="md" withBorder mt="xl">
      <Title order={3} mb="md">Adoptantes</Title>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Apellido</Table.Th>
            <Table.Th>Correo</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {adoptantes.map((adoptante, index) => (
            <Table.Tr key={adoptante.correo}>
              <Table.Td>
                <Group gap="sm">
                  <Avatar
                    size={30}
                    radius={30}
                    src={adoptanteAvatars[index % adoptanteAvatars.length]} // Rotate through the avatar images
                  />
                  <Text fz="sm" fw={500}>
                    {adoptante.nombre}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>
                  {adoptante.apellido}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>
                  {adoptante.correo}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );

  return (
    <Container size="lg" px="xs">
      {renderAdopciones()}
      {renderAnimales()}
      {renderAdoptantes()}
      <Space h="xl" /> {/* Adds space at the bottom */}
      
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Autorizas la adopción?"
      >
        <Text>¿Estás seguro que deseas autorizar la adopción?</Text>
        <Group justify="space-between" mt="md">
          <Button color="red" onClick={() => setModalOpened(false)}>
            Cancelar
          </Button>
          <Button color="green" onClick={handleAdopcionEdit}>
            Autorizar
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
