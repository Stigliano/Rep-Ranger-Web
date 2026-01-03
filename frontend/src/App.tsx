import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { WorkoutProgramListPage } from './features/workout-program/pages/WorkoutProgramListPage';
import { CreateWorkoutProgramPage } from './features/workout-program/pages/CreateWorkoutProgramPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkoutProgramListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout-programs"
          element={
            <ProtectedRoute>
              <WorkoutProgramListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout-programs/new"
          element={
            <ProtectedRoute>
              <CreateWorkoutProgramPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

