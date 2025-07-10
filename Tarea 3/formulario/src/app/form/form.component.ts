import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RegisterService } from '../../RegisterService';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [RegisterService],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
        email: ['', [Validators.required, Validators.email]],
        cedula: ['', [Validators.required, this.cedulaValidator]],
        age: [
          '',
          [Validators.required, Validators.min(18), Validators.max(65)],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  cedulaValidator(control: AbstractControl): ValidationErrors | null {
    const cedula = control.value;
    if (!cedula || cedula.toString().length !== 10) {
      return { invalidCedula: true };
    }
    const digitoRegion = parseInt(cedula.substring(0, 2), 10);
    if (digitoRegion < 1 || digitoRegion > 24) {
      return { invalidCedula: true };
    }
    const ultimoDigito = parseInt(cedula.charAt(9), 10);
    const pares =
      parseInt(cedula.charAt(1), 10) +
      parseInt(cedula.charAt(3), 10) +
      parseInt(cedula.charAt(5), 10) +
      parseInt(cedula.charAt(7), 10);
    let impares = 0;
    for (let i = 0; i < 9; i += 2) {
      let num = parseInt(cedula.charAt(i), 10) * 2;
      if (num > 9) {
        num -= 9;
      }
      impares += num;
    }
    const sumaTotal = pares + impares;
    const decena = Math.ceil(sumaTotal / 10) * 10;
    const digitoVerificador = decena - sumaTotal;
    if ((digitoVerificador === 10 ? 0 : digitoVerificador) !== ultimoDigito) {
      return { invalidCedula: true };
    }
    return null;
  }

  async saveUserOnBDD() {
    if (this.registerForm.valid) {
      try {
        let newUser = this.buildAndGetNewUserObject();
        await this.registerService.saveUser(newUser);
        console.log('Usuario registrado con éxito');
        alert('Usuario registrado con éxito');
      } catch (error) {
        console.error('Error al registrar el usuario', error);
        alert('Error al registrar el usuario');
      }
    } else {
      console.error('Formulario inválido');
      this.registerForm.markAllAsTouched();
    }
  }

  buildAndGetNewUserObject() {
    return {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      cedula: this.registerForm.get('cedula')?.value,
      age: this.registerForm.get('age')?.value,
      password: this.registerForm.get('password')?.value,
    };
  }
}
