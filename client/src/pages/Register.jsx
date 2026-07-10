// Register page.
import AuthForm from '../components/AuthForm'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  return <AuthForm mode="register" onSubmit={register} />
}
