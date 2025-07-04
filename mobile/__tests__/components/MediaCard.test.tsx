import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { renderWithSimpleProvider } from '../testHelper';
import MediaCard from '../../src/components/MediaCard';
import { Media } from '../../src/types';

const mockMedia: Media = {
  id: 1,
  title: 'Test Movie',
  type: 'movie',
  posterUrl: 'https://example.com/poster.jpg',
  description: 'Test description',
  year: 2023,
  genre: 'Action',
  rating: 8.5,
  status: 'watching',
};

describe('MediaCard', () => {
  const mockOnPress = jest.fn();
  const mockOnActionPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithSimpleProvider(
      <MediaCard
        media={mockMedia}
        onPress={mockOnPress}
        onActionPress={mockOnActionPress}
      />
    );

    expect(screen.getByText('Test Movie')).toBeTruthy();
  });
});
