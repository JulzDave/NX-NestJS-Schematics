import { yellow, underline, bold } from 'chalk';

export function displayMsgToStdOut(): void {
    const stdOutMessages = [
        yellow(
            '\n\n    ______  ______ _____ ____ _____    _____ ____  _____  _____    _____        _____        _            _      ______   ',
        ),
        yellow(
            '   / / / / |  ____|_   _|  _ \\_   _|  / ____/ __ \\|  __ \\|  __ \\  |  __ \\ ___  |  __ \\      | |          | |     \\ \\ \\ \\  ',
        ),
        yellow(
            '  / / / /  | |__    | | | |_) || |   | |   | |  | | |__) | |__) | | |__) ( _ ) | |  | |   __| | ___ _ __ | |_     \\ \\ \\ \\ ',
        ),
        yellow(
            " < < < <   |  __|   | | |  _ < | |   | |   | |  | |  _  /|  ___/  |  _  // _ \\/\\ |  | |  / _` |/ _ \\ '_ \\| __|     > > > >",
        ),
        yellow(
            '  \\ \\ \\ \\  | |     _| |_| |_) || |_  | |___| |__| | | \\ \\| |_     | | \\ \\ (_>  < |__| | | (_| |  __/ |_) | |_ _   / / / / ',
        ),
        yellow(
            '   \\_\\_\\_\\ |_|    |_____|____/_____|  \\_____\\____/|_|  \\_\\_(_)    |_|  \\_\\___/\\/_____/   \\__,_|\\___| .__/ \\__(_) /_/_/_/  ',
        ),
        yellow(
            '                                                                                                   | |                    ',
        ),
        yellow(
            '                                                                                                   |_|                    ',
        ),
        yellow(
            bold(
                underline(
                    'This is a custom Mataf NX-NestJS dedicated plugin schematic\n',
                ),
            ),
        ),
        yellow('* Address placeholders and provide useful content'),
        yellow('* Confirm APM ports are open and ready.'),
        yellow(
            '* Subsequently, uncomment the APM configurations in the main.ts file.\n\n',
        ),
    ];
    for (const msg of stdOutMessages) {
        console.log(msg);
    }
}