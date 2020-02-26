import Enigma from '@cubbit/enigma';

const bo = async () => {
    await Enigma.init();

    const dh1 = new Enigma.DiffieHellman();
    const dh2 = new Enigma.DiffieHellman();

    dh1.initialize();
    dh2.initialize();

    dh1.get_public_key();
    dh2.get_public_key();

    const s1 = await dh1.derive_secret(dh2.get_public_key());
    const s2 = await dh2.derive_secret(dh1.get_public_key());

    console.log(dh1.get_public_key(), s1, s2, s1.compare(s2));

};

const bo2 = async ()  => {

    await Enigma.init();

    console.log((self as any).enigma);

    const DH = (self as any).enigma.DiffieHellman;

    const dh1 = new DH();
    const dh2 = new DH();

    const pvk1 = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgdC/t+zrXSY/A8Ss8\ngd94Wlbx6nO5+VM76Srj+mN7Ln6hRANCAATBuzAqdaqPQyMU0nBuDEptswRnlU0K\nFcVEWB7+lMFBNDqH9kjY0wMvhpxljixU7PMngZSow4K6OZNJd9ZGjPHt\n-----END PRIVATE KEY-----';

    const pvk2 = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgQ4cKqKfHHWCzpo4/\nRhzyW40deOZlrdmOlP7NAyHGmEShRANCAATw7RPVQwn30ai1Vg9taTBVO7qCeKk1\nnBffK448LBLV7TWi4yKn51TCjjmiu5+JX7rbI+bo+GsViOkE2ReAzCAz\n-----END PRIVATE KEY-----';

    dh1.initialize();
    dh2.initialize();

    console.log('secret1', dh1.get_private());
    console.log('secret2', dh2.get_private());

    const pbk1 = dh1.get_public_key();
    const pbk2 = dh2.get_public_key();

    let secret1;
    let secret2;

    secret1 = dh1.derive_secret(pbk2);
    secret2 =  dh2.derive_secret(pbk1);

    console.log(secret1);
    console.log(secret2);

    dh1.free();
    dh2.free();

    return;
};

const bo3 = async ()  => {
    console.log('ciao2');

    await Enigma.init();

    console.log(Enigma.DiffieHellman);

    const dh1 = new Enigma.DiffieHellman();
    const dh2 = new Enigma.DiffieHellman();

    dh1.initialize();
    dh2.initialize();

    const pbk1 = dh1.get_public_key();
    const pbk2 = dh2.get_public_key();

    let secret1;
    let secret2;

    secret1 = dh1.derive_secret(pbk2);
    secret2 =  dh2.derive_secret(pbk1);

    console.log(secret1);
    console.log(secret2);

    // dh1.free();
    // dh2.free();

    return;
};

// bo2().then().catch();
console.log('ciao');

bo3().then().catch();