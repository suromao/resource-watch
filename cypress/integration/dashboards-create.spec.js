describe('An authenticated user creates a new dashboard', () => {
  beforeEach(() => {

    cy.validateEnvVar('wriApiUrl');


    cy.fixture('dashboards/post/output').then((dashboardPayload) => {
      cy.intercept({
        method: 'POST',
        url: Cypress.env('wriApiUrl'),
        pathname: `/v1/dashboard`
      },
      dashboardPayload
      ).as('createDashboard');
    });

    cy.fixture('dashboards/get-all/output').then((dashboardsPayload) => {
      cy.intercept({
        method: 'GET',
        url: Cypress.env('wriApiUrl'),
        pathname: `/v1/dashboard`
      },
      dashboardsPayload
      ).as('getDashboards');
    });

    cy.login();
  });

  it ('a user creates a new dashboard from scratch', () => {
    cy.visit('/myrw-detail/dashboards/new');

    cy.fixture('dashboards/post/input').then((dashboard) => {
      cy.log('Fills in dashboard form');

      cy.get('form').find('input[id="input-name"]').type(dashboard.name);
      cy.get('form').find('textarea[id="input-summary"]').type(dashboard.summary);
      cy.get('form').find('textarea[id="input-description"]').type(dashboard.description);
      cy.get('input[type="file"]').attachFile({
        filePath: `../fixtures/${dashboard.photo}`,
      });

      // wysiwyg
      cy.get('.cw-wysiwyg').find('h1').clear().type(dashboard.wysiwyg.title);

      cy.log('Submits dashboard form');
      cy.get('form[data-cy="dashboard-form"]').submit();

      cy.wait('@createDashboard').then(({ response }) => {
        console.log('response', response)
        expect(response.statusCode).to.eq(200);
        expect(response.body.data.attributes.name).to.eq(dashboard.name);
      });
    });
  });

  it ('a user goes to its dashboard page', () => {
    cy.visit('/myrw/dashboards');

    cy.fixture('dashboards/get-all/output').then((dashboardsPayload) => {
      cy.wait('@getDashboards').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body.data.length).to.eq(dashboardsPayload.data.length);
      });

      cy.get('.c-dashboards-list > .list > .list-item').then((dashboardItems) => {
        expect(dashboardItems.length).to.eq(dashboardsPayload.data.length);
      });
    })
  });
});
