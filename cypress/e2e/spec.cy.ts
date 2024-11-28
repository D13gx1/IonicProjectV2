
//Login con credenciales incorrectas
describe('Login con credenciales incorrectas', () => {
  beforeEach(() => {
    // Visitar la página de login
    cy.visit('/login'); // Ajusta la ruta según sea necesario
  });

  it('Debe mostrar un mensaje de error cuando las credenciales son incorrectas', () => {
    // Ingresar un correo electrónico inválido
    cy.get('ion-input#correo input')
      .type('usuario_invalido@example.com');

    // Ingresar una contraseña incorrecta
    cy.get('ion-input#password input')
      .type('contraseña_incorrecta')
      .should('be.visible'); // Verifica que el campo sea visible

    // Hacer clic en el botón de login usando la clase del botón
    cy.get('.enter-button') // Usamos la clase 'enter-button' del botón
      .should('be.visible') // Verifica que el botón sea visible
      .click();

    // Verificar que se muestra el mensaje de error
    cy.contains('Iniciar sesión');
  });
});

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

  //Login con credenciales correctas
describe('Login con credenciales correctas', () => {
  beforeEach(() => {
    // Visitar la página de login
    cy.visit('/login'); // Ajusta la ruta según sea necesario
  });

  it('Debe iniciar sesión correctamente con credenciales válidas', () => {
    // Ingresar un nombre de usuario válido
    cy.get('ion-input#correo input')
      .type('atorres')
      .should('have.value', 'atorres'); // Verifica que se ingresó correctamente

    // Ingresar la contraseña correcta
    cy.get('ion-input#password input')
      .type('1234')
      .should('have.value', '1234'); // Verifica que se ingresó correctamente

    // Hacer clic en el botón de login usando la clase del botón
    cy.get('.enter-button') // Usamos la clase 'enter-button' del botón
      .should('be.visible') // Verifica que el botón sea visible
      .click();

    // Verificar la navegación al home o que se muestra el mensaje de bienvenida
    cy.url().should('include', '/home'); // Asegura que redirige a /home
  });
});


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

describe('Recuperación de contraseña con datos incorretos', () => {
  beforeEach(() => {
    cy.visit('/recuperar'); // Navega a la página de recuperación de contraseña
  });

  it('Redirige a la página de /incorrecto al verificar un correo inválido', () => {
    // Introduce un correo inválido
    cy.get('ion-input#email input')
      .type('correo_invalido@ejemplo.com');

    // Haz clic en el botón de verificar correo
    cy.get('.enter-button') // Usamos la clase 'enter-button' del botón
      .should('be.visible') // Verifica que el botón sea visible
      .click();

    // Verifica que la URL sea /incorrecto
    cy.url().should('include', '/incorrecto');

    // Opcional: verifica el contenido de la página /incorrecto
    cy.contains('Los datos esperados ').should('be.visible');
  });

  it('Redirige a la página de /incorrecto al verificar una respuesta invalida', () => {
    // Introduce un correo válido
    cy.get('ion-input#email input')
      .type('atorres@duocuc.cl');

    // Haz clic en el botón de verificar correo
    cy.get('.enter-button')
      .should('be.visible')
      .click();

    // Introduce una respuesta incorrecta
    cy.get('ion-input#password input').type('perro');

    // Haz clic en el botón de verificar respuesta
    cy.get('ion-button') // Cambiar al selector del botón de la respuesta
    
    cy.get('.enter-button-password') // Usamos la clase 'enter-button' del botón
    .should('be.visible') // Verifica que el botón sea visible
    .click();

    // Verifica que la URL sea /incorrecto tras una respuesta incorrecta
    cy.url().should('include', '/incorrecto');

   
  });
});

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

describe('Recuperacion de contraseña con datos validos', () => {
  beforeEach(() => {
    cy.visit('/recuperar'); // Navega a la página de recuperación de contraseña
  });

it('Avanza al paso 2 con un correo válido', () => {
  // Introduce un correo válido
  cy.get('ion-input#email input')
    .type('atorres@duocuc.cl');

  // Haz clic en el botón de verificar correo
  cy.get('.enter-button') // Usamos la clase 'enter-button' del botón
  .should('be.visible') // Verifica que el botón sea visible
  .click();
  // Introduce una respuesta correcta
  cy.get('ion-input#password input').type('gato');

  // Haz clic en el botón para verificar la respuesta
  cy.get('.enter-button-password') // Usamos la clase 'enter-button' del botón
  .should('be.visible') // Verifica que el botón sea visible
  .click();
  // Verifica que no se muestran errores (puedes agregar más validaciones según la lógica)
});
});

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

describe('Cambio de nombre desde /mis-datos', () => {
  beforeEach(() => {
    // Navegar a la página de login y autenticarse
    cy.visit('/login');
    cy.get('ion-input#correo input').type('atorres'); // Usar correo válido
    cy.get('ion-input#password input').type('1234'); // Contraseña válida
    cy.get('.enter-button').click(); // Iniciar sesión

    // Navegar a la página /mis-datos desde el footer
    cy.get('#footer-mis-datos') // Seleccionar el botón del footer
      .click(); // Hacer clic para ir a /mis-datos
  });

  it('Debe permitir cambiar el nombre a Samuel', () => {
    const nuevoNombre = 'Samuel';

    // Localizar el campo de nombre y cambiarlo
    cy.get('ion-input#first-name input')
      .clear() // Limpiar el campo actual
      .type(nuevoNombre) // Escribir el nuevo nombre
      .should('have.value', nuevoNombre); // Verificar que el valor sea correcto

    // Guardar los cambios
    cy.get('#save-button') // Botón de guardar
      .click(); // Hacer clic en el botón de guardar

  });
}); 






  









