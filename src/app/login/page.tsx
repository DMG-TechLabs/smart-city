import { LoginForm } from "@/components/login-form"
import "@/styles/login.css"

export default function LoginPage() {
  return (
    <div className="login">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
    </div>
  )
}
