import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { renderWithNavigation, testUtils } from '../testHelper';
import { apiService } from '../../src/services/api';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock de l'API service
jest.mock('../../src/services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('HomeScreen', () => {
  beforeEach(() => {
    testUtils.clearMocks();
    jest.clearAllMocks();
  });

  it('renders home screen elements', () => {
    renderWithNavigation('Home');

    expect(screen.getByText('WatchList')).toBeTruthy();
    expect(screen.getByText('Créer une nouvelle room')).toBeTruthy();
    expect(screen.getByText('Rejoindre une room')).toBeTruthy();
  });

  it('renders create room section', () => {
    renderWithNavigation('Home');

    expect(screen.getByText('Créer une nouvelle room')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nom de la room')).toBeTruthy();
    expect(screen.getByText('Créer')).toBeTruthy();
  });

  it('renders join room section', () => {
    renderWithNavigation('Home');

    expect(screen.getByText('Rejoindre une room')).toBeTruthy();
    expect(screen.getByPlaceholderText('Code de la room')).toBeTruthy();
    expect(screen.getByText('Rejoindre')).toBeTruthy();
  });

  it('handles create room form input', () => {
    renderWithNavigation('Home');

    const roomNameInput = screen.getByPlaceholderText('Nom de la room');
    fireEvent.changeText(roomNameInput, 'Ma nouvelle room');

    expect(roomNameInput.props.value).toBe('Ma nouvelle room');
  });

  it('handles join room form input', () => {
    renderWithNavigation('Home');

    const roomCodeInput = screen.getByPlaceholderText('Code de la room');
    fireEvent.changeText(roomCodeInput, 'ABCD1234');

    expect(roomCodeInput.props.value).toBe('ABCD1234');
  });

  it('shows alert when creating room without name', () => {
    renderWithNavigation('Home');

    const createButton = screen.getByText('Créer');
    fireEvent.press(createButton);

    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez entrer un nom pour la room');
  });

  it('shows alert when joining room without code', () => {
    renderWithNavigation('Home');

    const joinButton = screen.getByText('Rejoindre');
    fireEvent.press(joinButton);

    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez entrer un code de room');
  });

  it('handles create room success', async () => {
    const mockRoom = { 
      id: 1, 
      name: 'Test Room', 
      code: 'ABCD1234',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockedApiService.createRoom.mockResolvedValue(mockRoom);

    renderWithNavigation('Home');

    const roomNameInput = screen.getByPlaceholderText('Nom de la room');
    const createButton = screen.getByText('Créer');

    fireEvent.changeText(roomNameInput, 'Ma nouvelle room');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockedApiService.createRoom).toHaveBeenCalledWith('Ma nouvelle room');
    });
  });

  it('handles join room success', async () => {
    const mockRoom = { 
      id: 1, 
      name: 'Test Room', 
      code: 'ABCD1234',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockedApiService.joinRoom.mockResolvedValue(mockRoom);

    renderWithNavigation('Home');

    const roomCodeInput = screen.getByPlaceholderText('Code de la room');
    const joinButton = screen.getByText('Rejoindre');

    fireEvent.changeText(roomCodeInput, 'ABCD1234');
    fireEvent.press(joinButton);

    await waitFor(() => {
      expect(mockedApiService.joinRoom).toHaveBeenCalledWith('ABCD1234');
    });
  });

  it('handles create room error', async () => {
    mockedApiService.createRoom.mockRejectedValue(new Error('Room creation failed'));

    renderWithNavigation('Home');

    const roomNameInput = screen.getByPlaceholderText('Nom de la room');
    const createButton = screen.getByText('Créer');

    fireEvent.changeText(roomNameInput, 'Ma nouvelle room');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Room creation failed');
    });
  });

  it('handles join room error', async () => {
    mockedApiService.joinRoom.mockRejectedValue(new Error('Room not found'));

    renderWithNavigation('Home');

    const roomCodeInput = screen.getByPlaceholderText('Code de la room');
    const joinButton = screen.getByText('Rejoindre');

    fireEvent.changeText(roomCodeInput, 'ABCD1234');
    fireEvent.press(joinButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Room not found');
    });
  });

  it('trims whitespace from room name', async () => {
    const mockRoom = { 
      id: 1, 
      name: 'Test Room', 
      code: 'ABCD1234',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockedApiService.createRoom.mockResolvedValue(mockRoom);

    renderWithNavigation('Home');

    const roomNameInput = screen.getByPlaceholderText('Nom de la room');
    const createButton = screen.getByText('Créer');

    fireEvent.changeText(roomNameInput, '  Ma nouvelle room  ');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockedApiService.createRoom).toHaveBeenCalledWith('Ma nouvelle room');
    });
  });

  it('trims whitespace from room code', async () => {
    const mockRoom = { 
      id: 1, 
      name: 'Test Room', 
      code: 'ABCD1234',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockedApiService.joinRoom.mockResolvedValue(mockRoom);

    renderWithNavigation('Home');

    const roomCodeInput = screen.getByPlaceholderText('Code de la room');
    const joinButton = screen.getByText('Rejoindre');

    fireEvent.changeText(roomCodeInput, '  ABCD1234  ');
    fireEvent.press(joinButton);

    await waitFor(() => {
      expect(mockedApiService.joinRoom).toHaveBeenCalledWith('ABCD1234');
    });
  });
});
