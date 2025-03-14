import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '../context/authContext';
import { getAllSnippets, likeSnippet, dislikeSnippet } from '../services/api'; // Import API functions
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

function SnippetList() {
  const [snippets, setSnippets] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const fetchedSnippets = await getAllSnippets();
        setSnippets(fetchedSnippets);
      } catch (error) {
        console.error('Error fetching snippets:', error);
      }
    };

    fetchSnippets();
  }, []);

  const handleLike = async (id) => {
    try {
      await likeSnippet(id);
      // Optimistically update the UI
      setSnippets(
        snippets.map((snippet) =>
          snippet.id === id ? { ...snippet, likes: snippet.likes + 1 } : snippet
        )
      );
    } catch (error) {
      console.error('Error liking snippet:', error);
    }
  };

  const handleDislike = async (id) => {
    try {
      await dislikeSnippet(id);
      // Optimistically update the UI
      setSnippets(
        snippets.map((snippet) =>
          snippet.id === id ? { ...snippet, dislikes: snippet.dislikes + 1 } : snippet
        )
      );
    } catch (error) {
      console.error('Error disliking snippet:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SnippetFlow</h1>
      {snippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-2">{snippet.title}</h2>
              <p className="text-sm text-gray-700">{snippet.content}</p>
              <p className="text-xs text-gray-500 mt-2">Language: {snippet.language}</p>
              <div className="flex justify-between mt-4">
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleLike(snippet.id)}
                >
                  Like ({snippet.likes})
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleDislike(snippet.id)}
                >
                  Dislike ({snippet.dislikes})
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading snippets...</p>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <SnippetList />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default App;