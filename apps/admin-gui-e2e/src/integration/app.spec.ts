import { getGreeting } from '../support/app.po';

describe('admin-gui', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to admin-gui!');
  });
});
