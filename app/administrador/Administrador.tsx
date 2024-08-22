import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Table,
  Group,
  Text,
  Title,
  Container,
  Card,
  Space,
  Modal,
  Button,
  TextInput,
  Select,
} from '@mantine/core';

const BACK_API = process.env.NEXT_PUBLIC_BACK_API || "";

interface Animal {
  id: string;
  nombre: string;
  edad: number;
  raza: string;
  tipo: string;
  estado: string;
}

interface Adoptante {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  estado: string;
}

interface Adopcion {
  id: string;
  animal_nombre: string;
  adoptante_nombre: string;
  voluntario_nombre?: string;
  estado: string;
}

interface CrudTableProps {
  title: string;
  endpoint: string;
  columns: string[];
  renderRow: (item: any) => React.ReactNode;
  modalTitle: string;
  formFields: { name: string; label: string; type?: string }[]; 
  showAddButton?: boolean; 
}

interface FormState {
  [key: string]: any;
}

const tipoColors: Record<string, string> = {
  perro: 'blue',
  gato: 'green',
};

const dogImageUrl = 'https://images.unsplash.com/photo-1558788353-f76d92427f16';
const catImageUrl = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131';

const fetchToken = async (): Promise<string | null> => {
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

const fetchData = async (endpoint: string, setState: React.Dispatch<React.SetStateAction<any[]>>): Promise<void> => {
  const token = await fetchToken();
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${BACK_API}/${endpoint}-list`, {
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

const CrudTable: React.FC<CrudTableProps> = ({
  title,
  endpoint,
  columns,
  renderRow,
  modalTitle,
  formFields,
  showAddButton = false,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [formState, setFormState] = useState<FormState>({});
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    fetchData(endpoint, setData);
  }, [endpoint]);

  const handleAddClick = (): void => {
    setFormState({});
    setSelectedItem(null);
    setModalOpened(true);
  };

  const handleEditClick = (item: any): void => {
    setFormState(item);
    setSelectedItem(item);
    setModalOpened(true);
  };

  const handleDeleteClick = (item: any): void => {
    setSelectedItem(item);
    setDeleteModalOpened(true);
  };

  const handleFormChange = (field: string, value: string | number): void => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    const token = await fetchToken();
    if (!token) return;

    var reemplazo=endpoint;

    if(endpoint=="voluntarios" || endpoint=="adoptantes") reemplazo="usuario";

    const url = selectedItem
      ? `${BACK_API}/${reemplazo}-update/${selectedItem.id}`
      : `${BACK_API}/${reemplazo}-create`;
    const method = 'POST';

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });
      setModalOpened(false);
      fetchData(endpoint, setData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    const token = await fetchToken();
    if (!token) return;

    try {
      await fetch(`${BACK_API}/${endpoint}-delete/${selectedItem.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setDeleteModalOpened(false);
      fetchData(endpoint, setData);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder mt="xl">
      <Group align="apart">
        <Title order={2} mb="md">{title}</Title>
        {showAddButton && (
          <Button onClick={handleAddClick}>Añadir</Button>
        )}
      </Group>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col}>{col}</Table.Th>
            ))}
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => (
            <Table.Tr key={item.id}>
              {renderRow(item)}
              <Table.Td>
                <Button variant="subtle" onClick={() => handleEditClick(item)}>Edit</Button>
                <Button variant="subtle" color="red" onClick={() => handleDeleteClick(item)}>Delete</Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={modalTitle}
      >
        {formFields.map((field) => {
          

          let estado_dropdown;
          let rol_dropdown;

          if(endpoint=="animal"){
            estado_dropdown=[
                { value: 'adoptado', label: 'adoptado' },
                { value: 'en_adopcion', label: 'en_adopcion' },
                { value: 'espera_de_adopcion', label: 'espera_de_adopcion' },
            ];
          }else if(endpoint=="adopcion"){
            estado_dropdown=[
                { value: 'finalizado', label: 'FINALIZADO' },
                { value: 'en_proceso', label: 'EN_ADOPCION' },
            ];
          }else{
            estado_dropdown=[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
              ];
            }
          
          if (field.name === 'tipo') {
            return (
              <Select
                key={field.name}
                label={field.label}
                value={formState[field.name] || ''}
                onChange={(value) => handleFormChange(field.name, value!)}
                mt="md"
                data={[
                  { value: 'perro', label: 'Perro' },
                  { value: 'gato', label: 'Gato' },
                ]}
              />
            );
          }else if(field.name=="estado"){
            return (
                <Select
                  key={field.name}
                  label={field.label}
                  value={formState[field.name] || ''}
                  onChange={(value) => handleFormChange(field.name, value!)}
                  mt="md"
                  data={estado_dropdown}
                />
              );
          }else if(field.name=="rol"){
            return (
                <Select
                  key={field.name}
                  label={field.label}
                  value={formState[field.name] || ''}
                  onChange={(value) => handleFormChange(field.name, value!)}
                  mt="md"
                  data={[
                    { value: 'voluntario', label: 'voluntario' },
                    { value: 'adoptante', label: 'adoptante' },
                    { value: 'administrador', label: 'administrador' },
                ]}
                />
              );
          }
          return (
            <TextInput
              key={field.name}
              label={field.label}
              value={formState[field.name] || ''}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              mt="md"
            />
          );
        })}
        <Group justify="space-between" mt="md">
          <Button color="red" onClick={() => setModalOpened(false)}>
            Cancel
          </Button>
          <Button color="green" onClick={handleSubmit}>
            Save
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Confirm Delete"
      >
        <Text>Are you sure you want to delete this item?</Text>
        <Group justify="space-between" mt="md">
          <Button color="red" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="green" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Card>
  );
};

export const Administrador: React.FC = () => {
  return (
    <Container size="lg" px="xs">
      <CrudTable
        title="Animales"
        endpoint="animal"
        columns={['ID', 'Nombre', 'Tipo', 'Edad', 'Raza', 'Estado']}
        renderRow={(item: Animal) => (
          <>
            <Table.Td>{item.id}</Table.Td>
            <Table.Td>
              <Group gap="sm">
                <Avatar
                  size={30}
                  radius={30}
                  src={item.tipo.toLowerCase() === 'perro' ? dogImageUrl : catImageUrl}
                />
                <Text fz="sm" fw={500}>
                  {item.nombre}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Badge color={tipoColors[item.tipo.toLowerCase()]} variant="light">
                {item.tipo.toUpperCase()}
              </Badge>
            </Table.Td>
            <Table.Td>{item.edad}</Table.Td>
            <Table.Td>{item.raza}</Table.Td>
            <Table.Td>
              <Text fz="sm" fw={500}>{item.estado}</Text>

              </Table.Td>
          </>
        )}
        modalTitle="Edit Animal"
        formFields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'tipo', label: 'Tipo' }, // This will be a dropdown list
          { name: 'edad', label: 'Edad' },
          { name: 'raza', label: 'Raza' },
          { name: 'estado', label: 'Estado' },
        ]}
        showAddButton // Only show "Añadir" button for Animales
      />
      <CrudTable
        title="Adopciones"
        endpoint="adopcion"
        columns={['ID', 'Animal', 'Adoptante', 'Voluntario', 'Estado']}
        renderRow={(item: Adopcion) => (
          <>
            <Table.Td>{item.id}</Table.Td>
            <Table.Td>{item.animal_nombre}</Table.Td>
            <Table.Td>{item.adoptante_nombre}</Table.Td>
            <Table.Td>{item.voluntario_nombre || 'Por definir'}</Table.Td>
            <Table.Td>
              <Badge color={item.estado === 'en_proceso' ? 'blue' : 'green'} variant="light">
                {item.estado.toUpperCase()}
              </Badge>
            </Table.Td>
          </>
        )}
        modalTitle="Edit Adopcion"
        formFields={[
          { name: 'animal', label: 'Animal' },
          { name: 'adoptante', label: 'Adoptante' },
          { name: 'voluntario', label: 'Voluntario' },
          { name: 'estado', label: 'Estado' },
        ]}
        showAddButton // Only show "Añadir" button for Adopciones
      />
      <CrudTable
      title="Adoptantes"
      endpoint="adoptantes"
      columns={['ID', 'Nombre', 'Apellido', 'Correo', 'Estado']} // Removed 'Rol'
      renderRow={(item: Adoptante) => (
        <>
          <Table.Td>{item.id}</Table.Td>
          <Table.Td>
            <Group gap="sm">
              <Text fz="sm" fw={500}>
                {item.nombre}
              </Text>
            </Group>
          </Table.Td>
          <Table.Td>{item.apellido}</Table.Td>
          <Table.Td>{item.correo}</Table.Td>
          {/* Removed <Table.Td>{item.rol}</Table.Td> */}
          <Table.Td>{item.estado}</Table.Td>
        </>
      )}
      modalTitle="Edit Adoptante"
      formFields={[
        { name: 'nombre', label: 'Nombre' },
        { name: 'apellido', label: 'Apellido' },
        { name: 'correo', label: 'Correo' },
        { name: 'estado', label: 'Estado' }, // Removed 'Rol'
      ]}
    />

    <CrudTable
      title="Voluntarios"
      endpoint="voluntarios"
      columns={['ID', 'Nombre', 'Apellido', 'Correo', 'Estado']} // Removed 'Rol'
      renderRow={(item: Adoptante) => (
        <>
          <Table.Td>{item.id}</Table.Td>
          <Table.Td>
            <Group gap="sm">
              <Text fz="sm" fw={500}>
                {item.nombre}
              </Text>
            </Group>
          </Table.Td>
          <Table.Td>{item.apellido}</Table.Td>
          <Table.Td>{item.correo}</Table.Td>
          {/* Removed <Table.Td>{item.rol}</Table.Td> */}
          <Table.Td>{item.estado}</Table.Td>
        </>
      )}
      modalTitle="Edit Voluntario"
      formFields={[
        { name: 'nombre', label: 'Nombre' },
        { name: 'apellido', label: 'Apellido' },
        { name: 'correo', label: 'Correo' },
        { name: 'estado', label: 'Estado' }, // Removed 'Rol'
      ]}
    />

      <Space h="xl" /> {/* Adds space at the bottom */}
    </Container>
  );
}
