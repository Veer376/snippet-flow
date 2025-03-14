import axios from 'axios';

const API_BASE_URL = `$import.`; // Adjust if needed
const GRAPHQL_ENDPOINT = '/graphql'; // Adjust if needed

// --- Axios Instance for REST API ---
const restApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Axios Instance for GraphQL API ---
const graphqlApi = axios.create({
  baseURL: GRAPHQL_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor to include the token ---
restApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

graphqlApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Authentication Services (REST) ---
export const login = async (username, password) => {
  try {
    const response = await restApi.post('/auth/login', new URLSearchParams({ username, password }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await restApi.post('/auth/register', { username, email, hashed_password: password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await restApi.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Snippet Services (GraphQL) ---
export const getAllSnippets = async () => {
  try {
    const response = await graphqlApi.post('', {
      query: `
        query {
          getAllSnippets {
            id
            title
            content
            language
            likes
            dislikes
          }
        }
      `,
    });
    return response.data.data.getAllSnippets;
  } catch (error) {
    throw error;
  }
};

export const getSnippet = async (id) => {
  try {
    const response = await graphqlApi.post('', {
      query: `
        query GetSnippet($id: Int!) {
          getSnippet(id: $id) {
            id
            title
            content
            language
            likes
            dislikes
          }
        }
      `,
      variables: { id },
    });
    return response.data.data.getSnippet;
  } catch (error) {
    throw error;
  }
};

export const createSnippet = async (title, content, language, userId) => {
  try {
    const response = await graphqlApi.post('', {
      query: `
        mutation CreateSnippet($title: String!, $content: String!, $language: String!, $userId: Int!) {
          createSnippet(title: $title, content: $content, language: $language, userId: $userId) {
            id
            title
            content
            language
            likes
            dislikes
          }
        }
      `,
      variables: { title, content, language, userId },
    });
    return response.data.data.createSnippet;
  } catch (error) {
    throw error;
  }
};

export const likeSnippet = async (snippetId) => {
  try {
    const response = await graphqlApi.post('', {
      query: `
        mutation LikeSnippet($snippetId: Int!) {
          likeSnippet(snippetId: $snippetId) {
            id
            likes
          }
        }
      `,
      variables: { snippetId },
    });
    return response.data.data.likeSnippet;
  } catch (error) {
    throw error;
  }
};

export const dislikeSnippet = async (snippetId) => {
  try {
    const response = await graphqlApi.post('', {
      query: `
        mutation DislikeSnippet($snippetId: Int!) {
          dislikeSnippet(snippetId: $snippetId) {
            id
            dislikes
          }
        }
      `,
      variables: { snippetId },
    });
    return response.data.data.dislikeSnippet;
  } catch (error) {
    throw error;
  }
};

export const getRecommendationsForUser = async (userId) => {
    try {
      const response = await graphqlApi.post('', {
        query: `
          query GetRecommendationsForUser($userId: Int!) {
            getRecommendationsForUser(userId: $userId) {
              snippetId
              score
            }
          }
        `,
        variables: { userId },
      });
      return response.data.data.getRecommendationsForUser;
    } catch (error) {
      throw error;
    }
  };