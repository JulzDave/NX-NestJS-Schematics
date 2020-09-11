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
                    'This is a custom Mataf NX-NestJS dedicated plugin schematic',
                ),
            ),
        ),
        yellow(
            bold(
                underline(
                    'Follow the steps below to take full advantage of this schematic:\n\n',
                ),
            ),
        ),
        yellow('* Replace placeholders with useful provided content'),
        yellow(
            '* Confirm APM ports are open and ready. Then, uncomment the APM configuration snippets in the main.ts file.',
        ),
        yellow('\n\n'),
    ];
    let index: number = 0;
    const startDisplayingMsg = setInterval(() => {
        console.log(stdOutMessages[index]);
        index++;
        if (index >= stdOutMessages.length) {
            clearInterval(startDisplayingMsg);
        }
    }, 75);
}
