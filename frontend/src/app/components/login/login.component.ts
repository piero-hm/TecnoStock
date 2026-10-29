import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormField, form, required } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';

interface LoginFormModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormField],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly model = signal<LoginFormModel>({ username: '', password: '' });
  readonly loginForm = form(this.model, (schema) => {
    required(schema.username, { message: 'Usuario obligatorio' });
    required(schema.password, { message: 'Contraseña obligatoria' });
  });

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm().invalid()) {
      this.loginForm.username().markAsTouched();
      this.loginForm.password().markAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.auth.login(this.model()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err?.detail || 'Credenciales inválidas.');
      },
    });
  }
}
