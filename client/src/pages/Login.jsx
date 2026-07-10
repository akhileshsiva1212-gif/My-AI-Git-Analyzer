// Login page.
import AuthForm from '../components/AuthForm'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  return <AuthForm mode="login" onSubmit={login} />
}
