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
