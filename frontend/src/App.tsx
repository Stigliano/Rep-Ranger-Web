import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { DashboardLayout } from './shared/layouts/DashboardLayout';
import { WorkoutProgramListPage } from './features/workout-program/pages/WorkoutProgramListPage';
import { CreateWorkoutProgramPage } from './features/workout-program/pages/CreateWorkoutProgramPage';
import { EditWorkoutProgramPage } from './features/workout-program/pages/EditWorkoutProgramPage';
import { ExercisesPage } from './features/exercises/pages/ExercisesPage';
import { CreateExercisePage } from './features/exercises/pages/CreateExercisePage';
import { ActiveWorkoutPage } from './features/training-log/pages/ActiveWorkoutPage';
import { WorkoutHistoryPage } from './features/training-log/pages/WorkoutHistoryPage';
import { ProgramDetailsPage } from './features/workout-program/pages/ProgramDetailsPage';
import { ProgressDashboardPage } from './features/progress/pages/ProgressDashboardPage';
import { ProfilePage } from './features/profile/pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<ProgressDashboardPage />} />
          <Route path="/progress" element={<ProgressDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="/workout-programs" element={<WorkoutProgramListPage />} />
          <Route path="/workout-programs/new" element={<CreateWorkoutProgramPage />} />
          <Route path="/workout-programs/:id/edit" element={<EditWorkoutProgramPage />} />
          <Route path="/workout-programs/:id" element={<ProgramDetailsPage />} />
          
          <Route path="/workout/active" element={<ActiveWorkoutPage />} />
          <Route path="/workout-history" element={<WorkoutHistoryPage />} />
          
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/exercises/new" element={<CreateExercisePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
