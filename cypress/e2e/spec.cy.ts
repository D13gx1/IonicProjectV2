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
      .type('contraseña_incorrecta');

    // Hacer clic en el botón de login
    cy.get('ion-button')
      .contains('Login') // Ajusta este texto si el botón tiene otro texto
      .click();

    // Verificar que se muestra el mensaje de error
    cy.contains('Credenciales incorrectas') // Ajusta el texto del mensaje
      .should('be.visible');
  });
});
