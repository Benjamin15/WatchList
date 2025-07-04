import '@testing-library/jest-native/extend-expect';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    SafeAreaContext: React.createContext({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
  Entypo: 'Entypo',
  EvilIcons: 'EvilIcons',
  Feather: 'Feather',
  FontAwesome5: 'FontAwesome5',
  Foundation: 'Foundation',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Octicons: 'Octicons',
  SimpleLineIcons: 'SimpleLineIcons',
  Zocial: 'Zocial',
}));

// Mock react-native-paper Portal
jest.mock('react-native-paper', () => {
  const MockedPaper = jest.requireActual('react-native-paper');
  return {
    ...MockedPaper,
    Portal: {
      Host: ({ children }) => children,
    },
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(component => component),
    Directions: {},
  };
});

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock pour les assets
jest.mock('react-native/Libraries/Image/AssetRegistry', () => ({
  getAssetByID: jest.fn(() => ({
    uri: 'mocked-asset-uri',
    width: 100,
    height: 100,
  })),
}));

// Mock pour le resolver des assets
jest.mock('@react-navigation/elements', () => ({
  Header: ({ children }) => children,
  getHeaderTitle: () => 'Test',
  HeaderBackground: () => null,
  HeaderTitle: ({ children }) => children,
}));

// Mock pour React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      isFocused: jest.fn(() => true),
    }),
    useRoute: () => ({
      params: {},
      name: 'Home',
      key: 'Home-key',
    }),
    useFocusEffect: jest.fn(),
    NavigationContainer: ({ children }) => children,
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
  CardStyleInterpolators: {
    forHorizontalIOS: {},
  },
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock spécifique pour l'API service avec données de retour
jest.mock('./src/services/api', () => {
  const mockRoom = {
    id: 1,
    name: 'Test Room',
    code: 'ABCD1234',
    createdAt: new Date().toISOString(),
    members: [],
  };

  const mockMedia = {
    id: 1,
    title: 'Test Movie',
    type: 'movie',
    year: 2023,
    genre: 'Action',
    description: 'Test description',
    poster: '/test-poster.jpg',
    rating: 8.5,
    status: 'planned',
  };

  const mockWatchlistItem = {
    id: 1,
    roomId: 1,
    mediaId: 1,
    media: mockMedia,
    status: 'planned',
    addedBy: 'user1',
    addedAt: new Date().toISOString(),
  };

  // Simulation de données en mémoire
  let rooms = [mockRoom];
  let watchlistItems = [mockWatchlistItem];
  let currentId = 2;

  return {
    apiService: {
      createRoom: jest.fn().mockImplementation((name) => {
        if (!name || !name.trim()) {
          return Promise.reject(new Error('Room name is required'));
        }
        const newRoom = {
          id: currentId++,
          name: name.trim(),
          code: `ABCD${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          members: [],
        };
        rooms.push(newRoom);
        return Promise.resolve(newRoom);
      }),
      
      joinRoom: jest.fn().mockImplementation((code) => {
        if (!code || !code.trim()) {
          return Promise.reject(new Error('Room code is required'));
        }
        const room = rooms.find(r => r.code === code.trim().toUpperCase());
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        return Promise.resolve(room);
      }),
      
      getRoomDetails: jest.fn().mockImplementation((id) => {
        const room = rooms.find(r => r.id === id);
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        return Promise.resolve(room);
      }),
      
      getRoom: jest.fn().mockImplementation((id) => {
        const room = rooms.find(r => r.id === id);
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        return Promise.resolve(room);
      }),
      
      getWatchlist: jest.fn().mockImplementation((roomId) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        const items = watchlistItems.filter(item => item.roomId === roomId);
        return Promise.resolve({ data: items });
      }),
      
      addToWatchlist: jest.fn().mockImplementation((roomId, media) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        const exists = watchlistItems.some(item => item.roomId === roomId && item.mediaId === media.id);
        if (exists) {
          return Promise.reject(new Error('Media already in watchlist'));
        }
        const newItem = {
          id: currentId++,
          roomId,
          mediaId: media.id,
          media,
          status: 'planned',
          addedBy: 'user1',
          addedAt: new Date().toISOString(),
        };
        watchlistItems.push(newItem);
        return Promise.resolve(newItem);
      }),
      
      removeFromWatchlist: jest.fn().mockImplementation((roomId, itemId) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        const itemIndex = watchlistItems.findIndex(item => item.id === itemId && item.roomId === roomId);
        if (itemIndex === -1) {
          return Promise.reject(new Error('Watchlist item not found'));
        }
        watchlistItems.splice(itemIndex, 1);
        return Promise.resolve({ success: true });
      }),
      
      updateWatchlistItem: jest.fn().mockImplementation((roomId, itemId, updates) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
          return Promise.reject(new Error('Room not found'));
        }
        const item = watchlistItems.find(item => item.id === itemId && item.roomId === roomId);
        if (!item) {
          return Promise.reject(new Error('Watchlist item not found'));
        }
        Object.assign(item, updates);
        return Promise.resolve(item);
      }),
      
      searchMedia: jest.fn().mockImplementation((query, type) => {
        if (!query || !query.trim()) {
          return Promise.resolve([]);
        }
        const baseMedia = {
          id: 1,
          title: 'Test Movie',
          type: type || 'movie',
          year: 2023,
          genre: 'Action',
          description: 'Test description',
          poster: '/test-poster.jpg',
          rating: 8.5,
          status: 'planned',
        };
        const results = [baseMedia];
        if (type === 'series') {
          results[0] = { ...baseMedia, type: 'series', title: 'Test Series' };
        } else if (type === 'manga') {
          results[0] = { ...baseMedia, type: 'manga', title: 'Test Manga' };
        }
        return Promise.resolve(results);
      }),
      
      getMediaDetails: jest.fn().mockResolvedValue(mockMedia),
      getPopularMedia: jest.fn().mockResolvedValue([mockMedia]),
      getTrendingMedia: jest.fn().mockResolvedValue([mockMedia]),
      getUpcomingMedia: jest.fn().mockResolvedValue([mockMedia]),
      getRecommendations: jest.fn().mockResolvedValue([mockMedia]),
    },
  };
});
