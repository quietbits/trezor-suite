// @group:migrations
// @retry=2

let firstTxLabel = '';
const from = '/release/22.7/web';
const to = '/develop/web';

const hiddenWalletSelector = '[data-test^="@switch-device/wallet-on-index"]';
const testData = {
    accPhrase: 'doggo je dobros',
};
// this test can be run only in sldev so we ignore baseUrl env variable
const baseUrl = 'https://suite.corp.sldev.cz/suite-web';

describe('Database migration', () => {
    /**
     * Test case:
     * 1. in in the older version of the app navigate to settings/device and verify settings state
     * 2. navigate to the wallet overview and add the hidden QA wallet
     * 3. navigate to Accounts, click on the first btc account and verify tx
     * 4. remember the wallet
     * 5. navigate to the newer version of the app
     * 6. navigate to the wallet overview and verify that the remembered wallet is still present
     * 7. navigate to Accounts, click on the first btc account and verify that txs are still present
     * and the same as in the old app
     * 8. click on the Recieve btn and verify that the address displays normally
     * 9. click on the Send btn and verify that the form is not broken
     * 10. verify that a dark theme is still applied
     */
    it(`Db migration between: ${from} => ${to}`, () => {
        //
        // Test data preparation
        //
        cy.viewport(1080, 1440);
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', {
            mnemonic: 'all all all all all all all all all all all all',
            passphrase_protection: true,
        });
        cy.task('startBridge');
        cy.resetDb();

        //
        // Test execution
        //

        // FROM

        cy.visit(baseUrl + from, {});
        cy.passThroughInitialRun();
        cy.getTestElement('@passphrase-type/standard').click();
        cy.discoveryShouldFinish();

        // change settings
        cy.getTestElement('@suite/menu/settings').click();
        cy.getTestElement('@theme/color-scheme-select/input').click();
        cy.getTestElement('@theme/color-scheme-select/option/dark').click();
        cy.getTestElement('@theme/color-scheme-select/input').should('contain', 'Dark');

        // remembering the wallet
        cy.getTestElement('@menu/switch-device').click();
        cy.getTestElement('@modal').should('be.visible');
        cy.getTestElement('@switch-device/add-hidden-wallet-button').click();
        cy.getTestElement('@passphrase/input').should('be.visible').type(testData.accPhrase);
        cy.getTestElement('@passphrase/hidden/submit-button').click();
        cy.wait(500);
        cy.task('pressYes');
        cy.task('pressYes');
        cy.getTestElement('@discovery/loader').should('be.visible');
        cy.getTestElement('@discovery/loader').should('not.exist');
        cy.discoveryShouldFinish();

        // check and store address of first btc tx
        cy.getTestElement('@suite/menu/wallet-index').click();
        cy.get('[data-test^="@metadata/outputLabel"]')
            .first()
            .first()
            .should('be.visible')
            .then(element => {
                console.log(element);
                firstTxLabel = element.text();
                console.log('firstTxLabel', firstTxLabel);
            });

        cy.getTestElement('@menu/switch-device').click();
        cy.contains(hiddenWalletSelector, 'Hidden wallet #1')
            .find('[data-test*="toggle-remember-switch"]')
            .click()
            .find('input')
            .should('be.checked');

        cy.task('stopEmu');

        // TO:
        cy.visit(baseUrl + to, {});
        cy.getTestElement('@dashboard/graph', { timeout: 40000 }).should('be.visible');
        cy.getTestElement('@suite/menu/wallet-index').click();

        cy.getTestElement('@menu/switch-device').click();
        cy.getTestElement('@deviceStatus-disconnected');
        cy.contains(hiddenWalletSelector, 'Hidden wallet #1').find('input').should('be.checked');
        cy.getTestElement('@modal/close-button').click();

        cy.get('[data-test^="@metadata/outputLabel"]').first().should('be.visible');

        // check and store address of first btc tx
        cy.get('[data-test^="@metadata/outputLabel"]')
            .first()
            .first()
            .then(element => {
                // todo: this is weird, firstTxLabel contains some more chars: "add label"
                if (!firstTxLabel.includes(element.text())) {
                    throw new Error('tx does not match');
                }
            });

        // go to receive tab, trigger show address to make sure passphrase is properly cached
        // -> no passphrase prompt should be displayed
        cy.getTestElement('@wallet/menu/wallet-receive').click();
        cy.getTestElement('@wallet/receive/reveal-address-button').click();

        // device not connected warning modal
        cy.getTestElement('@modal');
        cy.getTestElement('@modal/close-button').click();

        cy.task('startEmu');
        cy.getTestElement('@deviceStatus-connected').should('be.visible');
        cy.getTestElement('@wallet/receive/reveal-address-button').click();
    });
});