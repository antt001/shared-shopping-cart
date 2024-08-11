// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthenticationForm } from './Auth/AuthenticationForm';
import { AuthProvider } from './Auth/AuthContext';
import { CatalogPage } from './Catalog/CatalogPage';
import ProtectedRoute from './Auth/ProtectedRoute';
import { CartProvider } from './Cart/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MantineProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<AuthenticationForm />} />
              <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'user']} />}>
                <Route index element={<CatalogPage />} />
              </Route>
            </Routes>
          </Router>
        </MantineProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
